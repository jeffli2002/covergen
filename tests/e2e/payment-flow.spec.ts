import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!';

// Helper function to sign in
async function signIn(page: Page, email: string = TEST_EMAIL) {
  await page.goto('/en');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for the auth modal to appear
  await page.waitForSelector('[data-testid="auth-modal"]');
  
  // Enter credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  
  // Click sign in
  await page.getByRole('button', { name: /sign in/i, exact: true }).click();
  
  // Wait for successful sign in
  await page.waitForURL('**/en/**');
}

// Helper function to set up a test user
async function setupTestUser(page: Page) {
  // First, clear any existing test data
  await page.goto('/api/subscription/clear-test-data');
  
  // Sign up a new user
  await page.goto('/en');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Switch to sign up
  await page.getByRole('link', { name: /sign up/i }).click();
  
  // Enter credentials
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  
  // Click sign up
  await page.getByRole('button', { name: /sign up/i, exact: true }).click();
  
  // Wait for successful sign up
  await page.waitForURL('**/en/**');
}

test.describe('Payment Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/');
  });

  test('Free to Pro upgrade flow', async ({ page }) => {
    // Setup test user
    await setupTestUser(page);
    
    // Navigate to pricing page
    await page.goto('/en/pricing');
    
    // Click on Pro plan upgrade button
    await page.getByRole('button', { name: /upgrade to pro/i }).click();
    
    // Should redirect to payment page
    await expect(page).toHaveURL(/\/payment/);
    
    // Verify Pro plan is selected
    await expect(page.getByText('Pro Plan')).toBeVisible();
    await expect(page.getByText('$9.99/month')).toBeVisible();
    
    // Fill in test payment details
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cardnumber"]').fill('4242424242424242');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cvc"]').fill('123');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="postal"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay now/i }).click();
    
    // Wait for success page
    await page.waitForURL('**/payment/success**');
    
    // Verify success message
    await expect(page.getByText(/payment successful/i)).toBeVisible();
    
    // Check user is now Pro
    await page.goto('/en/account');
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });

  test('Pro to Pro+ upgrade flow', async ({ page }) => {
    // Setup test user with Pro subscription
    await setupTestUser(page);
    
    // Mock existing Pro subscription
    await page.evaluate(() => {
      localStorage.setItem('user_subscription', JSON.stringify({
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
    });
    
    // Navigate to pricing page
    await page.goto('/en/pricing');
    
    // Click on Pro+ plan upgrade button
    await page.getByRole('button', { name: /upgrade to pro\+/i }).click();
    
    // Should redirect to payment page
    await expect(page).toHaveURL(/\/payment/);
    
    // Verify Pro+ plan is selected
    await expect(page.getByText('Pro+ Plan')).toBeVisible();
    await expect(page.getByText('$19.99/month')).toBeVisible();
    
    // Fill in test payment details
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cardnumber"]').fill('4242424242424242');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cvc"]').fill('123');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="postal"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay now/i }).click();
    
    // Wait for success page
    await page.waitForURL('**/payment/success**');
    
    // Verify success message
    await expect(page.getByText(/upgrade successful/i)).toBeVisible();
    
    // Check user is now Pro+
    await page.goto('/en/account');
    await expect(page.getByText('Pro+ Plan')).toBeVisible();
  });

  test('Sign in redirects to payment flow', async ({ page }) => {
    // Start from pricing page without being signed in
    await page.goto('/en/pricing');
    
    // Click on Pro plan
    await page.getByRole('button', { name: /upgrade to pro/i }).click();
    
    // Should redirect to sign in
    await expect(page).toHaveURL(/\?redirect=.*payment/);
    
    // Sign in
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i, exact: true }).click();
    
    // Should redirect to payment page after sign in
    await page.waitForURL('**/payment**');
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });

  test('Payment cancellation flow', async ({ page }) => {
    // Setup test user with active subscription
    await setupTestUser(page);
    
    // Mock active subscription
    await page.evaluate(() => {
      localStorage.setItem('user_subscription', JSON.stringify({
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false
      }));
    });
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Click cancel subscription
    await page.getByRole('button', { name: /cancel subscription/i }).click();
    
    // Confirm cancellation
    await page.getByRole('button', { name: /yes, cancel/i }).click();
    
    // Verify cancellation message
    await expect(page.getByText(/subscription will be cancelled/i)).toBeVisible();
    
    // Check subscription status
    await expect(page.getByText(/cancels on/i)).toBeVisible();
  });

  test('Webhook handling for payment events', async ({ page }) => {
    // Setup test user
    await setupTestUser(page);
    
    // Simulate webhook for successful payment
    const webhookResponse = await page.request.post('/api/webhooks/creem', {
      data: {
        type: 'charge.succeeded',
        data: {
          id: 'ch_test_123',
          amount: 999,
          currency: 'usd',
          customer: {
            email: TEST_EMAIL
          },
          metadata: {
            plan: 'pro'
          }
        }
      },
      headers: {
        'creem-signature': 'test_signature' // In real tests, this would be properly signed
      }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
    
    // Check user subscription is updated
    await page.goto('/en/account');
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });

  test('Payment failure handling', async ({ page }) => {
    // Setup test user
    await setupTestUser(page);
    
    // Navigate to payment page
    await page.goto('/en/payment?plan=pro');
    
    // Use a card that will be declined
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cardnumber"]').fill('4000000000000002');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="cvc"]').fill('123');
    await page.frameLocator('iframe[title="Secure payment input frame"]').locator('input[name="postal"]').fill('12345');
    
    // Submit payment
    await page.getByRole('button', { name: /pay now/i }).click();
    
    // Verify error message
    await expect(page.getByText(/payment failed/i)).toBeVisible();
    await expect(page.getByText(/card was declined/i)).toBeVisible();
    
    // User should still be on payment page
    await expect(page).toHaveURL(/\/payment/);
  });

  test('Subscription renewal flow', async ({ page }) => {
    // Setup test user with expiring subscription
    await setupTestUser(page);
    
    // Mock expiring subscription
    await page.evaluate(() => {
      localStorage.setItem('user_subscription', JSON.stringify({
        plan: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 1 day
        cancel_at_period_end: false
      }));
    });
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Should show renewal reminder
    await expect(page.getByText(/subscription expires soon/i)).toBeVisible();
    
    // Simulate webhook for renewal
    const webhookResponse = await page.request.post('/api/webhooks/creem', {
      data: {
        type: 'subscription.renewed',
        data: {
          id: 'sub_test_123',
          customer: {
            email: TEST_EMAIL
          },
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      },
      headers: {
        'creem-signature': 'test_signature'
      }
    });
    
    expect(webhookResponse.ok()).toBeTruthy();
    
    // Refresh and check renewal is processed
    await page.reload();
    await expect(page.getByText(/subscription expires soon/i)).not.toBeVisible();
  });
});