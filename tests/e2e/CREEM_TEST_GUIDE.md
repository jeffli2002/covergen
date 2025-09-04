# Creem Payment Integration E2E Test Guide

## Overview
This guide explains how to run the E2E tests for the Creem payment integration. All tests are configured to use Creem's test API to ensure safe testing without affecting real payments.

## Prerequisites

1. **Creem Test Account**
   - Sign up at https://dashboard.creem.io
   - Navigate to the test mode (toggle in dashboard)
   - Get your test API keys

2. **System Requirements**
   - Node.js 18+
   - npm or yarn
   - Linux/macOS (for Playwright browsers)

## Setup

### 1. Configure Test Environment

Copy the example environment file:
```bash
cp tests/e2e/.env.test.example tests/e2e/.env.test
```

Edit `tests/e2e/.env.test` and add your Creem test keys:
```env
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_test_your_key_here
CREEM_SECRET_KEY=sk_test_your_key_here
CREEM_WEBHOOK_SECRET=whsec_test_your_secret_here
```

### 2. Install Dependencies

```bash
# Install project dependencies
npm install

# Install Playwright browsers
npm run test:install
```

## Running Tests

### Quick Start
Use the provided test runner script:
```bash
./tests/e2e/run-tests.sh
```

### Run Specific Test Suite
```bash
# Run only payment flow tests
./tests/e2e/run-tests.sh payment-flow.spec.ts

# Run only webhook tests
./tests/e2e/run-tests.sh webhook-handling.spec.ts
```

### Manual Test Commands
```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (for debugging)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug a specific test
npm run test:e2e:debug tests/e2e/payment-flow.spec.ts
```

## Test Structure

### Test Files
- `payment-flow.spec.ts` - Basic payment flows (free → pro, payment failures)
- `pro-to-proplus-upgrade.spec.ts` - Upgrade scenarios and proration
- `subscription-management.spec.ts` - Cancellation, renewal, limits
- `webhook-handling.spec.ts` - Webhook security and event processing

### Helper Files
- `helpers/auth.helper.ts` - User authentication utilities
- `helpers/payment.helper.ts` - Payment form and webhook helpers
- `constants/creem-test-data.ts` - Creem test cards and data

## Creem Test Cards

The tests use official Creem test cards:

| Card Number | Scenario |
|-------------|----------|
| 4242424242424242 | Success |
| 4000000000000002 | Declined |
| 4000000000009995 | Insufficient funds |
| 4000000000000069 | Expired card |
| 4000000000003220 | 3D Secure required |

## Debugging Failed Tests

### 1. Check Test Report
After tests run, open the HTML report:
```bash
npx playwright show-report
```

### 2. Run in UI Mode
```bash
npm run test:e2e:ui
```
This opens an interactive test runner where you can:
- Step through tests
- See browser state
- Inspect network requests

### 3. Enable Debug Logs
Add to your test:
```typescript
test('my test', async ({ page }) => {
  // Enable verbose logging
  page.on('console', msg => console.log(msg.text()));
  page.on('request', req => console.log('>', req.method(), req.url()));
  page.on('response', res => console.log('<', res.status(), res.url()));
  
  // Your test code...
});
```

### 4. Check Webhook Logs
Webhooks are logged in the console. Look for lines starting with `[Webhook]`.

## Common Issues

### 1. "Invalid webhook signature"
- Ensure `CREEM_WEBHOOK_SECRET` is set correctly
- For local testing, you can temporarily set `SKIP_WEBHOOK_SIGNATURE=true`

### 2. "Payment form not loading"
- Check that `NEXT_PUBLIC_CREEM_PUBLIC_KEY` starts with `pk_test_`
- Ensure you're using test mode keys, not production

### 3. "Subscription not updating"
- Verify your database is accessible
- Check Supabase service role key has proper permissions

### 4. "Tests timing out"
- Increase timeout in specific tests:
  ```typescript
  test.setTimeout(60000); // 60 seconds
  ```

## Writing New Tests

### Test Template
```typescript
import { test, expect } from '@playwright/test';
import { signIn, TEST_USERS } from './helpers/auth.helper';
import { fillPaymentDetails, TEST_CARDS } from './helpers/payment.helper';

test.describe('New Payment Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
    await page.goto('/');
  });

  test('should handle new payment scenario', async ({ page }) => {
    // Arrange
    await signIn(page, TEST_USERS.free);
    
    // Act
    await page.goto('/pricing');
    await page.click('button:has-text("Upgrade")');
    await fillPaymentDetails(page, TEST_CARDS.valid);
    
    // Assert
    await expect(page).toHaveURL(/success/);
  });
});
```

### Best Practices
1. Use data-testid attributes for reliable selectors
2. Always clean up test data in afterEach hooks
3. Use meaningful test descriptions
4. Group related tests with describe blocks
5. Mock time-sensitive operations when possible

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        env:
          NEXT_PUBLIC_CREEM_TEST_MODE: true
          NEXT_PUBLIC_CREEM_PUBLIC_KEY: ${{ secrets.CREEM_TEST_PUBLIC_KEY }}
          CREEM_SECRET_KEY: ${{ secrets.CREEM_TEST_SECRET_KEY }}
          CREEM_WEBHOOK_SECRET: ${{ secrets.CREEM_TEST_WEBHOOK_SECRET }}
        run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Support

For issues with:
- **Tests**: Check this guide and test files
- **Creem API**: Refer to https://docs.creem.io
- **Playwright**: See https://playwright.dev/docs