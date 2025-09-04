import { test, expect } from '@playwright/test';
import { signIn, signUp, TEST_USERS, clearTestData } from './helpers/auth.helper';
import { fillPaymentDetails, TEST_CARDS, mockWebhook, checkSubscriptionStatus } from './helpers/payment.helper';

test.describe('Pro to Pro+ Upgrade Flow', () => {
  test.beforeAll(async ({ request }) => {
    // Clear test data before running tests
    await request.post('/api/subscription/clear-test-data', {
      data: {
        emails: Object.values(TEST_USERS).map(u => u.email)
      }
    });
  });

  test.beforeEach(async ({ page }) => {
    // Set up a Pro user
    await signUp(page, TEST_USERS.pro);
    
    // Mock Pro subscription via webhook
    await mockWebhook(page, 'charge.succeeded', {
      id: 'ch_pro_test',
      amount: 999,
      currency: 'usd',
      customer: {
        email: TEST_USERS.pro.email
      },
      metadata: {
        plan: 'pro',
        userId: 'test_user_id'
      }
    });
  });

  test('Pro user can upgrade to Pro+ from pricing page', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Navigate to pricing page
    await page.goto('/en/pricing');
    
    // Pro plan should show as current plan
    await expect(page.locator('[data-testid="pro-plan-card"]')).toContainText('Current Plan');
    
    // Click upgrade to Pro+
    await page.locator('[data-testid="proplus-plan-card"]').getByRole('button', { name: /upgrade/i }).click();
    
    // Should navigate to payment page
    await expect(page).toHaveURL(/\/payment\?plan=pro-plus/);
    
    // Verify upgrade information is shown
    await expect(page.getByText('Upgrading from Pro to Pro+')).toBeVisible();
    await expect(page.getByText('$19.99/month')).toBeVisible();
    
    // Fill payment details
    await fillPaymentDetails(page);
    
    // Submit payment
    await page.getByRole('button', { name: /upgrade now/i }).click();
    
    // Wait for success
    await page.waitForURL('**/payment/success**');
    await expect(page.getByText(/successfully upgraded to pro\+/i)).toBeVisible();
    
    // Verify subscription is updated
    await checkSubscriptionStatus(page, 'pro+');
  });

  test('Pro user sees prorated pricing when upgrading', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Mock a Pro subscription that's halfway through the billing period
    const halfwayDate = new Date();
    halfwayDate.setDate(halfwayDate.getDate() + 15);
    
    await page.evaluate((endDate) => {
      localStorage.setItem('user_subscription', JSON.stringify({
        plan: 'pro',
        status: 'active',
        current_period_end: endDate,
        amount: 999
      }));
    }, halfwayDate.toISOString());
    
    // Navigate to upgrade page
    await page.goto('/en/payment?plan=pro-plus');
    
    // Should show prorated amount
    await expect(page.getByText(/prorated amount/i)).toBeVisible();
    await expect(page.getByText(/credit for unused pro time/i)).toBeVisible();
  });

  test('Pro user upgrade fails with invalid payment', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Navigate to upgrade page
    await page.goto('/en/payment?plan=pro-plus');
    
    // Fill with declined card
    await fillPaymentDetails(page, TEST_CARDS.declined);
    
    // Submit payment
    await page.getByRole('button', { name: /upgrade now/i }).click();
    
    // Should show error
    await expect(page.getByText(/payment failed/i)).toBeVisible();
    await expect(page.getByText(/card was declined/i)).toBeVisible();
    
    // User should remain on Pro plan
    await checkSubscriptionStatus(page, 'pro');
  });

  test('Pro user can upgrade from account settings', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Should see current Pro plan
    await expect(page.getByText('Pro Plan')).toBeVisible();
    await expect(page.getByText('$9.99/month')).toBeVisible();
    
    // Click upgrade button
    await page.getByRole('button', { name: /upgrade to pro\+/i }).click();
    
    // Should navigate to payment page
    await expect(page).toHaveURL(/\/payment\?plan=pro-plus/);
    
    // Complete upgrade
    await fillPaymentDetails(page);
    await page.getByRole('button', { name: /upgrade now/i }).click();
    
    // Wait for success
    await page.waitForURL('**/payment/success**');
    
    // Return to account page
    await page.goto('/en/account');
    await expect(page.getByText('Pro+ Plan')).toBeVisible();
    await expect(page.getByText('$19.99/month')).toBeVisible();
  });

  test('Pro user upgrade is handled correctly by webhook', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Simulate upgrade webhook
    const response = await mockWebhook(page, 'subscription.updated', {
      id: 'sub_proplus_test',
      customer: {
        email: TEST_USERS.pro.email
      },
      items: [{
        price: {
          product: {
            metadata: {
              plan: 'pro-plus'
            }
          }
        }
      }],
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    expect(response.ok()).toBeTruthy();
    
    // Check subscription is updated
    await checkSubscriptionStatus(page, 'pro+');
    
    // Verify increased limits
    await page.goto('/en');
    await expect(page.getByText(/unlimited generations/i)).toBeVisible();
  });

  test('Pro user upgrade preserves existing generation history', async ({ page }) => {
    await signIn(page, TEST_USERS.pro);
    
    // Create some generation history
    await page.goto('/en');
    await page.fill('[data-testid="title-input"]', 'Test Generation');
    await page.getByRole('button', { name: /generate/i }).click();
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generation-result"]', { timeout: 30000 });
    
    // Upgrade to Pro+
    await page.goto('/en/payment?plan=pro-plus');
    await fillPaymentDetails(page);
    await page.getByRole('button', { name: /upgrade now/i }).click();
    await page.waitForURL('**/payment/success**');
    
    // Check generation history is preserved
    await page.goto('/en/account');
    await page.getByRole('tab', { name: /history/i }).click();
    await expect(page.getByText('Test Generation')).toBeVisible();
  });
});