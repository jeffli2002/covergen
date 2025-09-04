import { Page } from '@playwright/test';

export const TEST_USERS = {
  free: {
    email: 'free.user@test.com',
    password: 'Test123456!'
  },
  pro: {
    email: 'pro.user@test.com',
    password: 'Test123456!'
  },
  proPlus: {
    email: 'proplus.user@test.com',
    password: 'Test123456!'
  }
};

export async function signIn(page: Page, user: { email: string; password: string }) {
  await page.goto('/en');
  
  // Check if already signed in
  const userMenu = await page.locator('[data-testid="user-menu"]').count();
  if (userMenu > 0) {
    return;
  }
  
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for the auth modal
  await page.waitForSelector('[data-testid="auth-modal"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit
  await page.getByRole('button', { name: /sign in/i, exact: true }).click();
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
}

export async function signOut(page: Page) {
  await page.locator('[data-testid="user-menu"]').click();
  await page.getByRole('button', { name: /sign out/i }).click();
  await page.waitForLoadState('networkidle');
}

export async function signUp(page: Page, user: { email: string; password: string }) {
  await page.goto('/en');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for the auth modal
  await page.waitForSelector('[data-testid="auth-modal"]');
  
  // Switch to sign up
  await page.getByRole('link', { name: /sign up/i }).click();
  
  // Fill in credentials
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit
  await page.getByRole('button', { name: /sign up/i, exact: true }).click();
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');
}

export async function clearTestData(page: Page) {
  // Call the test data cleanup endpoint
  const response = await page.request.post('/api/subscription/clear-test-data', {
    data: {
      emails: Object.values(TEST_USERS).map(u => u.email)
    }
  });
  
  if (!response.ok()) {
    console.warn('Failed to clear test data:', await response.text());
  }
}