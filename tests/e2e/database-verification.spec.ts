import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { signUp } from './helpers/auth.helper';
import { fillPaymentDetails, waitForCheckoutComplete, TEST_CARDS } from './helpers/payment.helper';
import { generateTestId, CREEM_TEST_EVENTS } from './constants/creem-test-data';

// Initialize Supabase client for direct DB verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

test.describe('Database State Verification', () => {
  let testEmail: string;
  let testUserId: string;

  test.beforeEach(async () => {
    testEmail = `test-${generateTestId('user')}@example.com`;
  });

  test.afterEach(async () => {
    // Clean up test data
    if (testUserId) {
      await supabase.from('user_usage').delete().eq('user_id', testUserId);
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  test('Should correctly create user records on signup', async ({ page }) => {
    // Sign up new user
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    expect(error).toBeNull();
    expect(user).toBeTruthy();
    testUserId = user.id;

    // Verify user fields
    expect(user.email).toBe(testEmail);
    expect(user.subscription_tier).toBe('free');
    expect(user.subscription_status).toBeNull();
    expect(user.creem_customer_id).toBeNull();
    expect(user.creem_subscription_id).toBeNull();
    expect(user.created_at).toBeTruthy();

    // Verify user_usage record was created
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    expect(usageError).toBeNull();
    expect(usage).toBeTruthy();
    expect(usage.daily_count).toBe(0);
    expect(usage.monthly_count).toBe(0);
    expect(usage.api_daily_count).toBe(0);
    expect(usage.api_monthly_count).toBe(0);
  });

  test('Should update database on Pro subscription creation', async ({ page, request }) => {
    // Sign up new user
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    // Get initial user state
    const { data: initialUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    testUserId = initialUser.id;

    // Subscribe to Pro
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);

    // Simulate webhook for subscription creation
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + generateTestId('session'),
          payment_status: 'paid',
          customer: 'cus_test_' + generateTestId('customer'),
          subscription: 'sub_test_' + generateTestId('sub'),
          metadata: {
            userId: testUserId,
            plan: 'pro'
          }
        }
      }
    };

    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: webhookPayload
    });

    // Wait for database update
    await page.waitForTimeout(2000);

    // Verify user record updated
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(updatedUser.subscription_tier).toBe('pro');
    expect(updatedUser.subscription_status).toBe('active');
    expect(updatedUser.creem_customer_id).toBe(webhookPayload.data.object.customer);
    expect(updatedUser.creem_subscription_id).toBe(webhookPayload.data.object.subscription);
    expect(updatedUser.subscription_current_period_end).toBeTruthy();
    expect(updatedUser.subscription_cancel_at_period_end).toBe(false);
  });

  test('Should update database on Pro+ subscription with license', async ({ page, request }) => {
    // Sign up new user
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    // Get user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    testUserId = user.id;

    // Subscribe to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);

    // Simulate webhook
    const customerId = 'cus_test_' + generateTestId('customer');
    const subscriptionId = 'sub_test_' + generateTestId('sub');
    const licenseKey = 'lic_' + generateTestId('license');

    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_' + generateTestId('session'),
            payment_status: 'paid',
            customer: customerId,
            subscription: subscriptionId,
            metadata: {
              userId: testUserId,
              plan: 'pro_plus'
            }
          }
        }
      }
    });

    // Simulate license creation webhook
    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: {
        type: 'license.created',
        data: {
          object: {
            id: licenseKey,
            customer: customerId,
            subscription: subscriptionId,
            status: 'active',
            metadata: {
              userId: testUserId
            }
          }
        }
      }
    });

    // Wait for database updates
    await page.waitForTimeout(2000);

    // Verify user record
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(updatedUser.subscription_tier).toBe('pro_plus');
    expect(updatedUser.subscription_status).toBe('active');
    expect(updatedUser.api_license_key).toBe(licenseKey);
    expect(updatedUser.api_license_created_at).toBeTruthy();
  });

  test('Should track usage correctly in database', async ({ page }) => {
    // Sign up and get Pro subscription
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    testUserId = user.id;

    // Make the user Pro for higher limits
    await supabase
      .from('users')
      .update({ subscription_tier: 'pro', subscription_status: 'active' })
      .eq('id', testUserId);

    // Generate some covers
    for (let i = 0; i < 3; i++) {
      await page.goto('/en');
      await page.fill('[data-testid="cover-title-input"]', `Test Cover ${i}`);
      await page.getByTestId('generate-button').click();
      await page.waitForSelector('[data-testid="generated-cover"]');
    }

    // Check usage in database
    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    expect(usage.daily_count).toBe(3);
    expect(usage.monthly_count).toBe(3);
    expect(new Date(usage.last_reset_daily).toDateString()).toBe(new Date().toDateString());
  });

  test('Should handle subscription cancellation in database', async ({ page, request }) => {
    // Setup user with Pro subscription
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    testUserId = user.id;

    const subscriptionId = 'sub_test_' + generateTestId('sub');
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Set up active subscription
    await supabase
      .from('users')
      .update({
        subscription_tier: 'pro',
        subscription_status: 'active',
        creem_subscription_id: subscriptionId,
        subscription_current_period_end: periodEnd.toISOString()
      })
      .eq('id', testUserId);

    // Cancel subscription via API
    await page.goto('/en/account');
    await signIn(page, testEmail);
    await page.getByTestId('cancel-subscription-button').click();
    await page.getByRole('button', { name: 'Yes, cancel' }).click();

    // Simulate cancellation webhook
    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            status: 'active',
            cancel_at_period_end: true,
            current_period_end: periodEnd.toISOString(),
            metadata: {
              userId: testUserId
            }
          }
        }
      }
    });

    // Wait for database update
    await page.waitForTimeout(1000);

    // Verify database state
    const { data: cancelledUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(cancelledUser.subscription_status).toBe('active');
    expect(cancelledUser.subscription_cancel_at_period_end).toBe(true);
    expect(cancelledUser.subscription_tier).toBe('pro'); // Still Pro until period ends
  });

  test('Should handle upgrade proration in database', async ({ page, request }) => {
    // Setup user with Pro subscription
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    testUserId = user.id;

    const subscriptionId = 'sub_test_' + generateTestId('sub');
    const customerId = 'cus_test_' + generateTestId('customer');

    // Set up Pro subscription
    await supabase
      .from('users')
      .update({
        subscription_tier: 'pro',
        subscription_status: 'active',
        creem_subscription_id: subscriptionId,
        creem_customer_id: customerId
      })
      .eq('id', testUserId);

    // Upgrade to Pro+
    await page.goto('/en/account');
    await signIn(page, testEmail);
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();

    // Simulate upgrade webhook
    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId,
            customer: customerId,
            status: 'active',
            items: {
              data: [{
                price: {
                  metadata: {
                    plan: 'pro_plus'
                  }
                }
              }]
            },
            metadata: {
              userId: testUserId,
              plan: 'pro_plus'
            }
          }
        }
      }
    });

    // Wait for database update
    await page.waitForTimeout(1000);

    // Verify upgrade in database
    const { data: upgradedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(upgradedUser.subscription_tier).toBe('pro_plus');
    expect(upgradedUser.subscription_status).toBe('active');
    
    // Should also create payment record for proration
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1);

    expect(payments).toHaveLength(1);
    expect(payments[0].type).toBe('proration_credit');
  });

  test('Should handle failed payment in database', async ({ page, request }) => {
    // Setup user
    await signUp(page, {
      email: testEmail,
      password: 'Test123456!'
    });

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();
    
    testUserId = user.id;

    // Try to subscribe with failing card
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.declined);
    await page.getByTestId('submit-payment').click();

    // Simulate payment failed webhook
    await request.post('/api/webhooks/creem', {
      headers: {
        'creem-signature': 'test_signature'
      },
      data: {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_test_' + generateTestId('invoice'),
            customer: 'cus_test_' + generateTestId('customer'),
            status: 'open',
            metadata: {
              userId: testUserId
            }
          }
        }
      }
    });

    // Wait for database update
    await page.waitForTimeout(1000);

    // Verify user still on free tier
    const { data: freeUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    expect(freeUser.subscription_tier).toBe('free');
    expect(freeUser.subscription_status).toBeNull();

    // Check for failed payment record
    const { data: failedPayments } = await supabase
      .from('payment_failures')
      .select('*')
      .eq('user_id', testUserId);

    expect(failedPayments).toHaveLength(1);
    expect(failedPayments[0].reason).toContain('declined');
  });
});

// Helper function for sign in within tests
async function signIn(page: any, email: string) {
  await page.getByTestId('user-menu-button').click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', 'Test123456!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/account');
}