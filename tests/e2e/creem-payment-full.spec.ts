import { test, expect, Page } from '@playwright/test';
import { TEST_CARDS, fillPaymentDetails, mockWebhook, checkSubscriptionStatus } from './helpers/payment.helper';

// Test user credentials
const TEST_USERS = {
  newUser: {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123456!'
  },
  existingUser: {
    email: 'existing-test@example.com',
    password: 'Test123456!'
  },
  googleUser: {
    email: 'google-test@example.com'
  }
};

// Helper to sign up a new user
async function signUpNewUser(page: Page, email: string, password: string) {
  await page.goto('/en');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Switch to sign up
  await page.getByText('Don\'t have an account?').locator('..').getByRole('link', { name: /sign up/i }).click();
  
  // Fill signup form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit signup
  await page.getByRole('button', { name: /sign up/i, exact: true }).click();
  
  // Wait for redirect
  await page.waitForURL('**/en/**');
  await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
}

// Helper to sign in existing user
async function signInUser(page: Page, email: string, password: string) {
  await page.goto('/en');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  await page.getByRole('button', { name: /sign in/i, exact: true }).click();
  await page.waitForURL('**/en/**');
}

test.describe('1. User Authentication Flow', () => {
  test('New user signup and free tier assignment', async ({ page }) => {
    const newEmail = `test-${Date.now()}@example.com`;
    
    await signUpNewUser(page, newEmail, TEST_USERS.newUser.password);
    
    // Verify free tier is assigned
    await page.goto('/en/account');
    await expect(page.getByText('Free Plan')).toBeVisible();
    await expect(page.getByText('10 covers per month')).toBeVisible();
  });

  test('Existing user signin', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Verify signed in
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('OAuth sign-in with Google', async ({ page, context }) => {
    // Mock Google OAuth response
    await context.route('**/auth/v1/authorize**', async route => {
      if (route.request().url().includes('google')) {
        // Simulate successful OAuth callback
        await route.fulfill({
          status: 302,
          headers: {
            'Location': `${page.url()}#access_token=mock-token&token_type=bearer&expires_in=3600`
          }
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/en');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Click Google sign-in
    await page.getByRole('button', { name: /continue with google/i }).click();
    
    // Should be redirected and signed in
    await page.waitForURL('**/en/**');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
});

test.describe('2. Subscription Plan Selection & Payment', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as test user
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
  });

  test('Select Pro plan from pricing page and complete payment', async ({ page }) => {
    await page.goto('/en/pricing');
    
    // Click Pro plan
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade to pro/i }).click();
    
    // Should redirect to Creem checkout
    await page.waitForURL('**/payment**');
    
    // Verify Pro plan details
    await expect(page.getByText('Pro Plan')).toBeVisible();
    await expect(page.getByText('$9/month')).toBeVisible();
    await expect(page.getByText('120 covers per month')).toBeVisible();
    
    // Fill payment details
    await fillPaymentDetails(page, TEST_CARDS.valid);
    
    // Submit payment
    await page.getByRole('button', { name: /pay/i }).click();
    
    // Wait for success
    await page.waitForURL('**/payment/success**', { timeout: 30000 });
    await expect(page.getByText(/payment successful/i)).toBeVisible();
    
    // Verify subscription is active
    await checkSubscriptionStatus(page, 'pro');
  });

  test('Verify metadata is properly set in checkout', async ({ page, request }) => {
    // Intercept checkout creation request
    let checkoutMetadata: any = null;
    
    await page.route('**/api/payment/create-checkout', async route => {
      const response = await route.fetch();
      const body = await response.json();
      
      // Store metadata for verification
      checkoutMetadata = body.metadata;
      
      await route.fulfill({ response });
    });

    await page.goto('/en/pricing');
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Verify metadata contains required fields
    expect(checkoutMetadata).toBeTruthy();
    expect(checkoutMetadata.userId).toBeTruthy();
    expect(checkoutMetadata.planId).toBe('pro');
    expect(checkoutMetadata.userEmail).toBeTruthy();
  });

  test('Test webhook handling updates user subscription', async ({ page, request }) => {
    // Complete a checkout first
    await page.goto('/en/pricing');
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Mock successful payment
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByRole('button', { name: /pay/i }).click();
    
    // Simulate webhook
    const webhookResponse = await mockWebhook(page, 'checkout.completed', {
      id: 'checkout_test_123',
      customer: { id: 'cus_test_123', email: TEST_USERS.existingUser.email },
      subscription: { id: 'sub_test_123' },
      metadata: {
        userId: 'test-user-id',
        planId: 'pro'
      }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
    
    // Verify subscription is updated
    await page.goto('/en/account');
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });
});

test.describe('3. Plan Upgrade Flow', () => {
  test('Upgrade from Pro to Pro+ with proration', async ({ page }) => {
    // Start with Pro user
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Simulate existing Pro subscription via webhook
    await mockWebhook(page, 'checkout.completed', {
      customer: { email: TEST_USERS.existingUser.email },
      subscription: { id: 'sub_pro_123' },
      metadata: { planId: 'pro' }
    });
    
    // Go to account and upgrade
    await page.goto('/en/account');
    await page.getByRole('button', { name: /upgrade to pro\+/i }).click();
    
    // Should show proration information
    await page.waitForURL('**/payment**');
    await expect(page.getByText('Pro+ Plan')).toBeVisible();
    await expect(page.getByText(/proration/i)).toBeVisible();
    
    // Complete upgrade
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByRole('button', { name: /upgrade now/i }).click();
    
    // Verify upgrade success
    await page.waitForURL('**/payment/success**');
    await checkSubscriptionStatus(page, 'pro+');
  });

  test('Verify subscription is updated after upgrade payment', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Simulate webhook for upgrade
    await mockWebhook(page, 'subscription.updated', {
      id: 'sub_test_123',
      customer: { email: TEST_USERS.existingUser.email },
      status: 'active',
      product: { id: 'prod_test_proplus' },
      metadata: { planId: 'pro_plus' }
    });
    
    // Check account shows Pro+
    await checkSubscriptionStatus(page, 'pro+');
    await expect(page.getByText('300 covers per month')).toBeVisible();
  });
});

test.describe('4. Free Usage Limit & Payment Trigger', () => {
  test('Generate 10 covers and trigger upgrade prompt on 11th', async ({ page }) => {
    // Create new user for clean state
    const freeEmail = `free-${Date.now()}@example.com`;
    await signUpNewUser(page, freeEmail, TEST_USERS.newUser.password);
    
    // Navigate to generation page
    await page.goto('/en');
    
    // Generate 10 covers (mocking the process)
    for (let i = 1; i <= 10; i++) {
      await page.fill('input[placeholder*="title"]', `Test Cover ${i}`);
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Wait for generation to complete (mocked)
      await page.waitForSelector('[data-testid="generation-result"]', { timeout: 5000 });
      
      // Check remaining quota
      const quotaText = await page.getByText(/remaining:/i).textContent();
      expect(quotaText).toContain(`${10 - i}`);
    }
    
    // Try 11th generation
    await page.fill('input[placeholder*="title"]', 'Test Cover 11');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Should show upgrade prompt
    await expect(page.getByText(/quota exceeded/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /upgrade now/i })).toBeVisible();
  });

  test('Redirect to payment after sign-in from upgrade prompt', async ({ page }) => {
    // Start not signed in
    await page.goto('/en');
    
    // Try to generate (should prompt sign in)
    await page.fill('input[placeholder*="title"]', 'Test Cover');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Should show sign-in prompt
    await expect(page.getByText(/sign in to continue/i)).toBeVisible();
    
    // Click sign in
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Sign in
    await page.fill('input[type="email"]', TEST_USERS.existingUser.email);
    await page.fill('input[type="password"]', TEST_USERS.existingUser.password);
    await page.getByRole('button', { name: /sign in/i, exact: true }).click();
    
    // Should redirect back to generation with plan selection
    await page.waitForURL('**/en**');
    await expect(page.getByRole('button', { name: /generate/i })).toBeVisible();
  });

  test('Verify subscription activation after payment from limit', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Simulate being at limit
    await page.evaluate(() => {
      localStorage.setItem('user_quota_used', '10');
    });
    
    await page.goto('/en');
    await page.fill('input[placeholder*="title"]', 'Over Limit Cover');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Should show upgrade prompt
    await page.getByRole('button', { name: /upgrade to pro/i }).click();
    
    // Complete payment
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByRole('button', { name: /pay/i }).click();
    
    // After success, should be able to generate
    await page.waitForURL('**/payment/success**');
    await page.goto('/en');
    
    await page.fill('input[placeholder*="title"]', 'Pro User Cover');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Should work without limit
    await page.waitForSelector('[data-testid="generation-result"]');
  });
});

test.describe('5. Payment Cancellation', () => {
  test.beforeEach(async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Set up Pro subscription
    await mockWebhook(page, 'checkout.completed', {
      customer: { email: TEST_USERS.existingUser.email },
      subscription: { id: 'sub_cancel_test' },
      metadata: { planId: 'pro' }
    });
  });

  test('Cancel Pro subscription with period end', async ({ page }) => {
    await page.goto('/en/account');
    
    // Click cancel subscription
    await page.getByRole('button', { name: /cancel subscription/i }).click();
    
    // Confirm cancellation dialog
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await page.getByRole('button', { name: /yes.*cancel/i }).click();
    
    // Verify cancellation scheduled
    await expect(page.getByText(/subscription.*cancelled.*end of period/i)).toBeVisible();
    await expect(page.getByText(/active until/i)).toBeVisible();
    
    // Should still show as Pro until period ends
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });

  test('Resume cancelled subscription', async ({ page }) => {
    // First cancel
    await page.goto('/en/account');
    await page.getByRole('button', { name: /cancel subscription/i }).click();
    await page.getByRole('button', { name: /yes.*cancel/i }).click();
    
    // Now resume
    await page.getByRole('button', { name: /resume subscription/i }).click();
    
    // Verify resumed
    await expect(page.getByText(/subscription resumed/i)).toBeVisible();
    await expect(page.getByText(/active until/i)).not.toBeVisible();
  });

  test('Immediate cancellation option', async ({ page }) => {
    await page.goto('/en/account');
    await page.getByRole('button', { name: /cancel subscription/i }).click();
    
    // Choose immediate cancellation
    await page.getByRole('checkbox', { name: /cancel immediately/i }).check();
    await page.getByRole('button', { name: /yes.*cancel/i }).click();
    
    // Should immediately downgrade to free
    await page.waitForTimeout(1000); // Wait for update
    await page.reload();
    
    await expect(page.getByText('Free Plan')).toBeVisible();
    await expect(page.getByText('10 covers per month')).toBeVisible();
  });
});

test.describe('6. Customer Portal Access', () => {
  test('Access Creem customer portal', async ({ page, context }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Set up subscription
    await mockWebhook(page, 'checkout.completed', {
      customer: { id: 'cus_portal_test', email: TEST_USERS.existingUser.email },
      subscription: { id: 'sub_portal_test' },
      metadata: { planId: 'pro' }
    });
    
    await page.goto('/en/account');
    
    // Mock portal URL response
    await page.route('**/api/payment/create-portal', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'https://checkout.creem.io/portal/test-session'
        })
      });
    });
    
    // Click manage subscription
    const [portalPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /manage subscription/i }).click()
    ]);
    
    // Verify portal opened
    expect(portalPage.url()).toContain('creem.io/portal');
  });

  test('Verify portal link generation with correct parameters', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    let portalRequest: any = null;
    
    await page.route('**/api/payment/create-portal', async route => {
      portalRequest = await route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: 'https://test.portal.url' })
      });
    });
    
    await page.goto('/en/account');
    await page.getByRole('button', { name: /manage subscription/i }).click();
    
    // Verify request parameters
    expect(portalRequest).toBeTruthy();
    expect(portalRequest.returnUrl).toContain('/account');
  });
});

test.describe('7. Webhook Event Testing', () => {
  test('Handle checkout.completed event', async ({ page }) => {
    const webhookResponse = await mockWebhook(page, 'checkout.completed', {
      id: 'checkout_completed_test',
      customer: { 
        id: 'cus_test_checkout',
        email: 'webhook-test@example.com'
      },
      subscription: { 
        id: 'sub_test_checkout',
        status: 'active'
      },
      metadata: {
        userId: 'user_webhook_test',
        planId: 'pro'
      }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
    const body = await webhookResponse.json();
    expect(body.received).toBe(true);
  });

  test('Handle subscription.active event', async ({ page }) => {
    const webhookResponse = await mockWebhook(page, 'subscription.active', {
      id: 'sub_active_test',
      customer: { id: 'cus_active_test' },
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      product: { id: 'prod_test_pro' }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
  });

  test('Handle subscription.paid event', async ({ page }) => {
    const webhookResponse = await mockWebhook(page, 'subscription.paid', {
      id: 'sub_paid_test',
      customer: { id: 'cus_paid_test' },
      amount_paid: 900,
      currency: 'usd'
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
  });

  test('Handle subscription.canceled event', async ({ page }) => {
    const webhookResponse = await mockWebhook(page, 'subscription.canceled', {
      id: 'sub_canceled_test',
      customer: { id: 'cus_canceled_test' },
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: true
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
  });

  test('Handle refund.created event', async ({ page }) => {
    const webhookResponse = await mockWebhook(page, 'refund.created', {
      id: 'refund_test_123',
      amount: 900,
      currency: 'usd',
      checkout: { id: 'checkout_refund_test' },
      customer: { id: 'cus_refund_test' },
      reason: 'requested_by_customer'
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
  });

  test('Test webhook signature validation', async ({ page, request }) => {
    // Test with invalid signature
    const invalidResponse = await request.post('/api/webhooks/creem', {
      data: { type: 'test.event' },
      headers: {
        'creem-signature': 'invalid_signature',
        'content-type': 'application/json'
      }
    });
    
    expect(invalidResponse.status()).toBe(401);
    const errorBody = await invalidResponse.json();
    expect(errorBody.error).toContain('signature');
  });

  test('Test webhook replay/duplicate handling', async ({ page }) => {
    const eventId = 'evt_duplicate_test_123';
    const eventData = {
      id: eventId,
      type: 'checkout.completed',
      data: {
        object: {
          customer: { id: 'cus_dup_test' },
          metadata: { planId: 'pro' }
        }
      }
    };
    
    // Send webhook twice
    const response1 = await mockWebhook(page, 'checkout.completed', eventData);
    const response2 = await mockWebhook(page, 'checkout.completed', eventData);
    
    // Both should return success (idempotent)
    expect(response1.ok()).toBeTruthy();
    expect(response2.ok()).toBeTruthy();
  });
});

test.describe('8. Edge Cases', () => {
  test('Payment with insufficient funds', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    await page.goto('/en/pricing');
    
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Use insufficient funds card
    await fillPaymentDetails(page, TEST_CARDS.insufficient_funds);
    await page.getByRole('button', { name: /pay/i }).click();
    
    // Should show error
    await expect(page.getByText(/insufficient funds/i)).toBeVisible();
    await expect(page.getByText(/please try a different payment method/i)).toBeVisible();
    
    // Should stay on payment page
    expect(page.url()).toContain('/payment');
  });

  test('Payment with expired card', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    await page.goto('/en/pricing');
    
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Use expired card
    await fillPaymentDetails(page, TEST_CARDS.expired);
    await page.getByRole('button', { name: /pay/i }).click();
    
    // Should show error
    await expect(page.getByText(/card.*expired/i)).toBeVisible();
  });

  test('Handle network failures and retries', async ({ page, context }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    let attemptCount = 0;
    
    // Mock network failure on first attempt, success on second
    await context.route('**/api/payment/create-checkout', async route => {
      attemptCount++;
      
      if (attemptCount === 1) {
        // First attempt fails
        await route.abort('failed');
      } else {
        // Second attempt succeeds
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            sessionId: 'test_session_retry',
            url: 'https://checkout.creem.io/test'
          })
        });
      }
    });
    
    await page.goto('/en/pricing');
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Should show error initially
    await expect(page.getByText(/network error/i)).toBeVisible({ timeout: 5000 });
    
    // Retry button should appear
    await page.getByRole('button', { name: /retry/i }).click();
    
    // Should succeed on retry
    await page.waitForURL('**/payment**');
    expect(attemptCount).toBe(2);
  });

  test('Handle 3D Secure authentication', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    await page.goto('/en/pricing');
    
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Use 3D Secure card
    await fillPaymentDetails(page, TEST_CARDS.threeDSecure);
    await page.getByRole('button', { name: /pay/i }).click();
    
    // Should show 3D Secure modal/iframe
    await expect(page.frameLocator('iframe[name*="3d"]')).toBeVisible({ timeout: 10000 });
    
    // Complete 3D Secure (in test mode, usually auto-completes)
    await page.waitForURL('**/payment/success**', { timeout: 30000 });
  });

  test('Concurrent payment attempts prevention', async ({ page, context }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Open two tabs
    const page2 = await context.newPage();
    await page2.goto('/en/pricing');
    
    // Start payment in both tabs
    await page.goto('/en/pricing');
    
    // Click upgrade in both tabs nearly simultaneously
    await Promise.all([
      page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click(),
      page2.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click()
    ]);
    
    // One should succeed, one should show error
    const results = await Promise.all([
      page.waitForURL('**/payment**', { timeout: 5000 }).then(() => 'success').catch(() => 'error'),
      page2.waitForURL('**/payment**', { timeout: 5000 }).then(() => 'success').catch(() => 'error')
    ]);
    
    // At least one should show an error about existing session
    const hasError = results.includes('error');
    expect(hasError).toBeTruthy();
  });

  test('Handle subscription already exists error', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    // Set up existing subscription
    await mockWebhook(page, 'subscription.active', {
      customer: { email: TEST_USERS.existingUser.email },
      id: 'sub_existing',
      status: 'active',
      product: { id: 'prod_test_pro' }
    });
    
    // Try to subscribe again
    await page.goto('/en/pricing');
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /current plan/i }).isDisabled();
  });
});

// Performance and Load Tests
test.describe('Performance Tests', () => {
  test('Checkout page load performance', async ({ page }) => {
    await signInUser(page, TEST_USERS.existingUser.email, TEST_USERS.existingUser.password);
    
    const startTime = Date.now();
    
    await page.goto('/en/pricing');
    await page.locator('[data-testid="plan-pro"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Wait for payment form to be ready
    await page.waitForSelector('iframe[title="Secure payment input frame"]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Webhook processing performance', async ({ page }) => {
    const webhookCount = 10;
    const webhooks = [];
    
    const startTime = Date.now();
    
    // Send multiple webhooks in parallel
    for (let i = 0; i < webhookCount; i++) {
      webhooks.push(
        mockWebhook(page, 'subscription.paid', {
          id: `sub_perf_test_${i}`,
          customer: { id: `cus_perf_test_${i}` },
          amount_paid: 900
        })
      );
    }
    
    const responses = await Promise.all(webhooks);
    const processingTime = Date.now() - startTime;
    
    // All should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
    
    // Should process all within reasonable time (5 seconds for 10 webhooks)
    expect(processingTime).toBeLessThan(5000);
  });
});