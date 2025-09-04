# Payment System Test Documentation

## Overview

This document provides comprehensive documentation for the CoverImage payment system tests, including setup instructions, test scenarios, and maintenance guidelines.

## Test Architecture

### Test Types

1. **End-to-End Tests** (`tests/e2e/creem-payment-full.spec.ts`)
   - Full user journey testing using Playwright
   - Tests actual UI interactions and payment flows
   - Covers all major payment scenarios

2. **Integration Tests** (`tests/integration/creem-payment-api.test.ts`)
   - API-level testing using Vitest
   - Tests payment endpoints and webhook handling
   - Focuses on backend logic and data flow

3. **Helper Functions** (`tests/e2e/helpers/payment.helper.ts`)
   - Reusable utilities for payment testing
   - Mock webhook generation
   - Payment form filling automation

## Setup Instructions

### Prerequisites

1. Install dependencies:
```bash
npm install
npm install -D @playwright/test playwright @supabase/supabase-js
```

2. Set up environment variables:
```bash
cp .env.test.example tests/e2e/.env.test
```

3. Configure test environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key

# Creem Configuration
CREEM_SECRET_KEY=test_secret_key
CREEM_WEBHOOK_SECRET=test_webhook_secret
NEXT_PUBLIC_CREEM_TEST_MODE=true

# Test Configuration
SKIP_WEBHOOK_SIGNATURE=true
BASE_URL=http://localhost:3000
```

### Database Setup

1. Start Supabase locally:
```bash
npx supabase start
```

2. Run migrations:
```bash
npx supabase db reset
```

3. Seed test data (optional):
```bash
npx supabase db seed
```

## Running Tests

### All Payment Tests
```bash
# Run the comprehensive test suite
./tests/e2e/run-payment-tests.sh
```

### Specific Test Suites

```bash
# E2E tests only
npx playwright test tests/e2e/creem-payment-full.spec.ts

# Integration tests only
npm test tests/integration/creem-payment-api.test.ts

# With specific configuration
npx playwright test --config=tests/e2e/payment-test.config.ts

# Debug mode
npx playwright test --debug

# UI mode (interactive)
npx playwright test --ui
```

### Test Reporting

```bash
# Generate HTML report
npx playwright show-report

# Generate JSON report
npx playwright test --reporter=json > test-results.json
```

## Test Scenarios Covered

### 1. User Authentication Flow
- **New User Signup**: Creates account and verifies free tier assignment
- **Existing User Login**: Tests standard email/password authentication
- **OAuth Integration**: Tests Google OAuth flow with mocked responses

### 2. Subscription Management
- **Plan Selection**: Tests choosing Pro or Pro+ from pricing page
- **Checkout Flow**: Verifies Creem checkout integration
- **Metadata Validation**: Ensures correct user/plan data in checkout

### 3. Payment Processing
- **Successful Payment**: Tests valid card transactions
- **Failed Payments**: Tests declined cards, insufficient funds
- **3D Secure**: Tests additional authentication flows

### 4. Webhook Handling
- **Event Processing**: Tests all Creem webhook event types
- **Signature Validation**: Ensures webhook security
- **Idempotency**: Verifies duplicate event handling

### 5. Usage Limits
- **Free Tier Limits**: Tests quota enforcement (10 covers/month)
- **Upgrade Prompts**: Tests limit-triggered upgrade flows
- **Usage Reset**: Verifies monthly reset on payment

### 6. Subscription Changes
- **Upgrades**: Tests Pro to Pro+ upgrade with proration
- **Cancellations**: Tests immediate and end-of-period cancellation
- **Resumption**: Tests reactivating cancelled subscriptions

### 7. Customer Portal
- **Portal Access**: Tests Creem customer portal link generation
- **Self-Service**: Verifies billing management capabilities

### 8. Edge Cases
- **Network Failures**: Tests retry logic and error handling
- **Concurrent Requests**: Tests race condition prevention
- **Invalid Data**: Tests input validation and sanitization

## Test Data Management

### Test Users
```javascript
const TEST_USERS = {
  newUser: {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123456!'
  },
  existingUser: {
    email: 'existing-test@example.com',
    password: 'Test123456!'
  }
};
```

### Test Cards (Creem)
```javascript
const TEST_CARDS = {
  valid: '4111111111111111',
  declined: '4000000000000002',
  insufficient_funds: '4000000000009995',
  expired: '4000000000000069',
  threeDSecure: '4000000000003220'
};
```

## Debugging Tests

### Common Issues

1. **Authentication Failures**
   - Check Supabase is running: `npx supabase status`
   - Verify environment variables are loaded
   - Check test user exists in database

2. **Payment Failures**
   - Ensure `NEXT_PUBLIC_CREEM_TEST_MODE=true`
   - Check Creem API keys are valid
   - Verify webhook endpoint is accessible

3. **Timeout Errors**
   - Increase timeout in config: `timeout: 60000`
   - Check network connectivity
   - Verify services are running

### Debug Commands

```bash
# Run with verbose logging
DEBUG=pw:api npx playwright test

# Run specific test
npx playwright test -g "should create checkout session"

# Generate trace for debugging
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Maintenance Guidelines

### Adding New Tests

1. Create test in appropriate file:
   - E2E: `tests/e2e/creem-payment-full.spec.ts`
   - Integration: `tests/integration/creem-payment-api.test.ts`

2. Use existing helpers:
```javascript
import { fillPaymentDetails, mockWebhook } from './helpers/payment.helper';

test('new payment scenario', async ({ page }) => {
  await fillPaymentDetails(page, TEST_CARDS.valid);
  const response = await mockWebhook(page, 'event.type', data);
});
```

3. Follow naming conventions:
   - Descriptive test names
   - Group related tests with `describe`
   - Use data-testid attributes for selectors

### Updating Test Data

1. **Environment Variables**: Update `.env.test.example`
2. **Test Cards**: Update in `payment.helper.ts`
3. **API Mocks**: Update in integration tests

### CI/CD Integration

```yaml
# .github/workflows/payment-tests.yml
name: Payment Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:payment
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/e2e/results/
```

## Best Practices

### Test Writing
1. **Independent Tests**: Each test should be self-contained
2. **Clear Assertions**: Use specific error messages
3. **Proper Cleanup**: Use setup/teardown hooks
4. **Mock External Services**: Don't rely on real payment providers

### Security
1. **Never Use Real Cards**: Always use test card numbers
2. **Secure Test Data**: Don't commit real API keys
3. **Validate Webhooks**: Test signature verification
4. **Sanitize Inputs**: Test XSS and injection prevention

### Performance
1. **Parallel Execution**: Enable where possible
2. **Selective Testing**: Use tags for subset testing
3. **Resource Cleanup**: Prevent test data accumulation
4. **Efficient Selectors**: Use data-testid over complex selectors

## Troubleshooting

### Error: "Failed to create checkout session"
```bash
# Check Creem API key
echo $CREEM_SECRET_KEY

# Test API directly
curl -X POST https://api.creem.io/v1/checkouts \
  -H "X-API-KEY: $CREEM_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Error: "Webhook signature validation failed"
```bash
# Verify webhook secret
echo $CREEM_WEBHOOK_SECRET

# Test with skip validation
export SKIP_WEBHOOK_SIGNATURE=true
```

### Error: "User not found"
```bash
# Check database connection
npx supabase db reset

# Create test user manually
npx supabase db seed
```

## Support

For issues or questions:
1. Check test logs in `tests/e2e/results/`
2. Review this documentation
3. Check Playwright/Vitest documentation
4. Contact the development team

---

Last Updated: January 2025