import { test, expect } from '@playwright/test';
import { signIn, signUp, TEST_USERS, clearTestData } from './helpers/auth.helper';
import { fillPaymentDetails, TEST_CARDS, mockWebhook, checkSubscriptionStatus } from './helpers/payment.helper';

test.describe('Subscription Management', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('/api/subscription/clear-test-data', {
      data: {
        emails: Object.values(TEST_USERS).map(u => u.email)
      }
    });
  });

  test.describe('Subscription Cancellation', () => {
    test('Pro user can cancel subscription', async ({ page }) => {
      // Set up Pro user
      await signUp(page, TEST_USERS.pro);
      await mockWebhook(page, 'charge.succeeded', {
        id: 'ch_cancel_test',
        amount: 999,
        currency: 'usd',
        customer: { email: TEST_USERS.pro.email },
        metadata: { plan: 'pro' }
      });
      
      await signIn(page, TEST_USERS.pro);
      
      // Navigate to account page
      await page.goto('/en/account');
      
      // Click manage subscription
      await page.getByRole('button', { name: /manage subscription/i }).click();
      
      // Should open Creem portal in iframe or new window
      const portalPromise = page.waitForEvent('popup');
      await page.getByRole('button', { name: /open billing portal/i }).click();
      const portalPage = await portalPromise;
      
      // In the portal, cancel subscription
      await portalPage.getByRole('button', { name: /cancel plan/i }).click();
      await portalPage.getByRole('button', { name: /confirm cancellation/i }).click();
      
      // Should show cancellation confirmation
      await expect(portalPage.getByText(/subscription will be cancelled/i)).toBeVisible();
      
      await portalPage.close();
      
      // Back in main app, refresh to see updated status
      await page.reload();
      await expect(page.getByText(/cancels on/i)).toBeVisible();
    });

    test('Cancelled subscription remains active until period end', async ({ page }) => {
      // Set up user with cancelled subscription
      await signUp(page, TEST_USERS.pro);
      
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 15); // 15 days remaining
      
      await mockWebhook(page, 'subscription.updated', {
        id: 'sub_cancelled_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: periodEnd.toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en/account');
      
      // Should show active but cancelling
      await expect(page.getByText('Pro Plan')).toBeVisible();
      await expect(page.getByText(/cancels on/i)).toBeVisible();
      await expect(page.getByText(/15 days remaining/i)).toBeVisible();
      
      // User should still have Pro features
      await page.goto('/en');
      const generateButton = page.getByRole('button', { name: /generate/i });
      await expect(generateButton).toBeEnabled();
    });

    test('User can reactivate cancelled subscription', async ({ page }) => {
      // Set up user with cancelled subscription
      await signUp(page, TEST_USERS.pro);
      await mockWebhook(page, 'subscription.updated', {
        id: 'sub_reactivate_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en/account');
      
      // Should see reactivate option
      await expect(page.getByRole('button', { name: /reactivate subscription/i })).toBeVisible();
      
      // Click reactivate
      await page.getByRole('button', { name: /reactivate subscription/i }).click();
      
      // Confirm reactivation
      await page.getByRole('button', { name: /yes, reactivate/i }).click();
      
      // Should show success message
      await expect(page.getByText(/subscription reactivated/i)).toBeVisible();
      
      // Cancel notice should be gone
      await expect(page.getByText(/cancels on/i)).not.toBeVisible();
    });
  });

  test.describe('Subscription Renewal', () => {
    test('Subscription auto-renews successfully', async ({ page }) => {
      // Set up user with expiring subscription
      await signUp(page, TEST_USERS.pro);
      
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setHours(currentPeriodEnd.getHours() + 1); // Expires in 1 hour
      
      await mockWebhook(page, 'subscription.created', {
        id: 'sub_renew_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'active',
        current_period_end: currentPeriodEnd.toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      // Simulate renewal webhook
      const newPeriodEnd = new Date();
      newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);
      
      await mockWebhook(page, 'subscription.renewed', {
        id: 'sub_renew_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'active',
        current_period_end: newPeriodEnd.toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en/account');
      
      // Should show renewed subscription
      await expect(page.getByText('Pro Plan')).toBeVisible();
      await expect(page.getByText(/renews on/i)).toBeVisible();
      
      // Should not show any expiry warning
      await expect(page.getByText(/expires soon/i)).not.toBeVisible();
    });

    test('Failed renewal downgrades user to free', async ({ page }) => {
      // Set up user with expired subscription
      await signUp(page, TEST_USERS.pro);
      
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Expired yesterday
      
      await mockWebhook(page, 'subscription.updated', {
        id: 'sub_expired_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'past_due',
        current_period_end: expiredDate.toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en/account');
      
      // Should show payment required
      await expect(page.getByText(/payment required/i)).toBeVisible();
      await expect(page.getByText(/update payment method/i)).toBeVisible();
      
      // User should be on free tier
      await page.goto('/en');
      await expect(page.getByText(/2 free generations remaining/i)).toBeVisible();
    });

    test('User can update payment method for failed renewal', async ({ page }) => {
      // Set up user with past_due subscription
      await signUp(page, TEST_USERS.pro);
      await mockWebhook(page, 'subscription.updated', {
        id: 'sub_past_due_test',
        customer: { email: TEST_USERS.pro.email },
        status: 'past_due',
        current_period_end: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          price: {
            product: {
              metadata: { plan: 'pro' }
            }
          }
        }]
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en/account');
      
      // Click update payment method
      await page.getByRole('button', { name: /update payment method/i }).click();
      
      // Should navigate to payment update page
      await expect(page).toHaveURL(/\/payment\/update/);
      
      // Fill new payment details
      await fillPaymentDetails(page);
      
      // Submit
      await page.getByRole('button', { name: /update payment/i }).click();
      
      // Should show success and reactivate subscription
      await expect(page.getByText(/payment updated successfully/i)).toBeVisible();
      await page.waitForURL('**/account**');
      
      // Subscription should be active again
      await expect(page.getByText('Pro Plan')).toBeVisible();
      await expect(page.getByText(/active/i)).toBeVisible();
    });
  });

  test.describe('Subscription Limits', () => {
    test('Free user hits generation limit', async ({ page }) => {
      await signUp(page, TEST_USERS.free);
      await signIn(page, TEST_USERS.free);
      
      await page.goto('/en');
      
      // Generate 2 times (free limit)
      for (let i = 0; i < 2; i++) {
        await page.fill('[data-testid="title-input"]', `Test Generation ${i + 1}`);
        await page.getByRole('button', { name: /generate/i }).click();
        await page.waitForSelector('[data-testid="generation-result"]', { timeout: 30000 });
        
        // Clear for next generation
        await page.reload();
      }
      
      // Try third generation
      await page.fill('[data-testid="title-input"]', 'Test Generation 3');
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Should show upgrade prompt
      await expect(page.getByText(/generation limit reached/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /upgrade to pro/i })).toBeVisible();
    });

    test('Pro user has higher limits', async ({ page }) => {
      await signUp(page, TEST_USERS.pro);
      await mockWebhook(page, 'charge.succeeded', {
        id: 'ch_pro_limits_test',
        amount: 999,
        currency: 'usd',
        customer: { email: TEST_USERS.pro.email },
        metadata: { plan: 'pro' }
      });
      
      await signIn(page, TEST_USERS.pro);
      await page.goto('/en');
      
      // Should show Pro limits
      await expect(page.getByText(/50 generations/i)).toBeVisible();
      
      // Can generate without hitting limit
      await page.fill('[data-testid="title-input"]', 'Pro Test Generation');
      await page.getByRole('button', { name: /generate/i }).click();
      await page.waitForSelector('[data-testid="generation-result"]', { timeout: 30000 });
      
      // Should show remaining count
      await expect(page.getByText(/49 generations remaining/i)).toBeVisible();
    });
  });
});