import { test, expect, Page } from '@playwright/test';
import { signIn, signUp, TEST_USERS } from './helpers/auth.helper';
import { fillPaymentDetails, waitForCheckoutComplete, TEST_CARDS } from './helpers/payment.helper';
import { generateTestId } from './constants/creem-test-data';

test.describe('Pro+ License Management', () => {
  let testEmail: string;
  
  test.beforeEach(async () => {
    testEmail = `test-${generateTestId('user')}@example.com`;
  });

  test('Pro+ users should receive API license after subscription', async ({ page }) => {
    // Sign up new user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Navigate to pricing page
    await page.goto('/en/pricing');
    
    // Select Pro+ plan
    await page.getByTestId('upgrade-pro-plus').click();
    
    // Complete checkout
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    
    // Wait for success page
    await expect(page).toHaveURL(/payment\/success/);
    await expect(page.getByText('Payment Successful')).toBeVisible();
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Verify Pro+ subscription
    await expect(page.getByTestId('subscription-tier')).toContainText('Pro+');
    
    // Check for API license section
    await expect(page.getByTestId('api-license-section')).toBeVisible();
    const licenseKey = await page.getByTestId('api-license-key').textContent();
    
    // Verify license format
    expect(licenseKey).toMatch(/^lic_[a-zA-Z0-9]{32}$/);
    
    // Test copy license button
    await page.getByTestId('copy-license-button').click();
    await expect(page.getByText('Copied to clipboard')).toBeVisible();
  });

  test('Should validate API license in API requests', async ({ page, request }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Get API license
    await page.goto('/en/account');
    const licenseKey = await page.getByTestId('api-license-key').textContent();
    
    // Test API with valid license
    const validResponse = await request.post('/api/generate', {
      headers: {
        'X-API-License': licenseKey || '',
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Cover',
        platform: 'youtube'
      }
    });
    
    expect(validResponse.ok()).toBeTruthy();
    expect(validResponse.status()).toBe(200);
    
    // Test API with invalid license
    const invalidResponse = await request.post('/api/generate', {
      headers: {
        'X-API-License': 'invalid_license_key',
        'Content-Type': 'application/json'
      },
      data: {
        title: 'Test Cover',
        platform: 'youtube'
      }
    });
    
    expect(invalidResponse.status()).toBe(401);
    const errorData = await invalidResponse.json();
    expect(errorData.error).toContain('Invalid API license');
  });

  test('Should regenerate API license', async ({ page }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Get original license
    const originalLicense = await page.getByTestId('api-license-key').textContent();
    
    // Click regenerate button
    await page.getByTestId('regenerate-license-button').click();
    
    // Confirm regeneration
    await page.getByRole('button', { name: 'Yes, regenerate' }).click();
    
    // Wait for new license
    await page.waitForTimeout(1000);
    
    // Get new license
    const newLicense = await page.getByTestId('api-license-key').textContent();
    
    // Verify license changed
    expect(newLicense).not.toBe(originalLicense);
    expect(newLicense).toMatch(/^lic_[a-zA-Z0-9]{32}$/);
    
    // Verify success message
    await expect(page.getByText('License regenerated successfully')).toBeVisible();
  });

  test('Should revoke API license when downgrading from Pro+', async ({ page }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Get API license
    await page.goto('/en/account');
    const licenseKey = await page.getByTestId('api-license-key').textContent();
    expect(licenseKey).toBeTruthy();
    
    // Open customer portal
    await page.getByTestId('manage-subscription-button').click();
    
    // Wait for portal to load in iframe
    await page.waitForSelector('iframe[title="Customer portal"]');
    const portalFrame = page.frameLocator('iframe[title="Customer portal"]');
    
    // Downgrade to Pro
    await portalFrame.getByText('Change plan').click();
    await portalFrame.getByText('Pro Plan').click();
    await portalFrame.getByRole('button', { name: 'Confirm change' }).click();
    
    // Wait for confirmation
    await expect(portalFrame.getByText('Plan changed successfully')).toBeVisible();
    
    // Return to account page
    await page.goto('/en/account');
    
    // Verify Pro subscription
    await expect(page.getByTestId('subscription-tier')).toContainText('Pro');
    
    // Verify API license section is gone
    await expect(page.getByTestId('api-license-section')).not.toBeVisible();
  });

  test('Should handle API rate limits for Pro+ users', async ({ page, request }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Get API license
    await page.goto('/en/account');
    const licenseKey = await page.getByTestId('api-license-key').textContent();
    
    // Make multiple API requests to test rate limit (Pro+ has 100 requests/hour)
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request.post('/api/generate', {
          headers: {
            'X-API-License': licenseKey || '',
            'Content-Type': 'application/json'
          },
          data: {
            title: `Test Cover ${i}`,
            platform: 'youtube'
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // All requests should succeed for Pro+
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
    });
    
    // Check rate limit headers
    const lastResponse = responses[responses.length - 1];
    const rateLimitRemaining = lastResponse.headers()['x-ratelimit-remaining'];
    const rateLimitTotal = lastResponse.headers()['x-ratelimit-limit'];
    
    expect(parseInt(rateLimitTotal)).toBe(100);
    expect(parseInt(rateLimitRemaining)).toBe(95); // 100 - 5 requests
  });

  test('Should display API documentation for Pro+ users', async ({ page }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Navigate to account page
    await page.goto('/en/account');
    
    // Click API documentation link
    await page.getByTestId('api-docs-link').click();
    
    // Verify API documentation page
    await expect(page).toHaveURL(/docs\/api/);
    await expect(page.getByRole('heading', { name: 'API Documentation' })).toBeVisible();
    
    // Check for important sections
    await expect(page.getByText('Authentication')).toBeVisible();
    await expect(page.getByText('Endpoints')).toBeVisible();
    await expect(page.getByText('Rate Limits')).toBeVisible();
    await expect(page.getByText('Error Codes')).toBeVisible();
    
    // Verify code examples
    await expect(page.getByText('curl -X POST')).toBeVisible();
    await expect(page.getByText('X-API-License:')).toBeVisible();
  });

  test('Should track API usage for Pro+ users', async ({ page, request }) => {
    // Setup Pro+ user
    await signUp(page, {
      email: testEmail,
      password: TEST_USERS.default.password
    });
    
    // Upgrade to Pro+
    await page.goto('/en/pricing');
    await page.getByTestId('upgrade-pro-plus').click();
    await waitForCheckoutComplete(page);
    await fillPaymentDetails(page, TEST_CARDS.valid);
    await page.getByTestId('submit-payment').click();
    await expect(page).toHaveURL(/payment\/success/);
    
    // Get API license
    await page.goto('/en/account');
    const licenseKey = await page.getByTestId('api-license-key').textContent();
    
    // Make some API requests
    for (let i = 0; i < 3; i++) {
      await request.post('/api/generate', {
        headers: {
          'X-API-License': licenseKey || '',
          'Content-Type': 'application/json'
        },
        data: {
          title: `Test Cover ${i}`,
          platform: 'youtube'
        }
      });
    }
    
    // Navigate to API usage page
    await page.goto('/en/account/api-usage');
    
    // Verify usage statistics
    await expect(page.getByTestId('api-requests-today')).toContainText('3');
    await expect(page.getByTestId('api-requests-month')).toContainText('3');
    await expect(page.getByTestId('api-requests-remaining')).toContainText('97'); // 100 - 3
    
    // Check usage graph
    await expect(page.getByTestId('api-usage-chart')).toBeVisible();
    
    // Verify usage breakdown by endpoint
    await expect(page.getByText('/api/generate: 3 requests')).toBeVisible();
  });
});