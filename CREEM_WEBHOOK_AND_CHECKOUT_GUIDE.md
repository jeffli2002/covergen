# Creem Webhook and Checkout Integration Guide

## Overview

This guide covers the complete Creem integration including checkout sessions and webhook handling.

## Checkout Session Creation

### Why Use Checkout Sessions?

Creem recommends using checkout sessions instead of direct product payment links because:
- You can pass a `request_id` to track payments in your system
- You can include `metadata` that persists across subscription lifecycle
- You can customize success/cancel URLs per checkout
- You can pre-fill customer email

### Implementation with SDK

Our checkout session creation uses the Creem TypeScript SDK:

```typescript
// Create checkout session with Creem SDK
const checkoutResult = await creemClient.createCheckout({
  xApiKey: CREEM_API_KEY,
  createCheckoutRequest: {
    productId: productId,
    requestId: `checkout_${userId}_${Date.now()}`,
    successUrl: successUrl,
    metadata: {
      userId: userId,
      userEmail: userEmail,
      planId: planId,
      currentPlan: currentPlan,
    },
    customer: {
      email: userEmail,
    },
  }
})

if (!checkoutResult.ok) {
  throw new Error('Failed to create checkout session')
}

const checkout = checkoutResult.value
const checkoutUrl = checkout.checkoutUrl
```

### Important Metadata Fields

Always include these in checkout metadata:
- `userId`: Your internal user ID
- `planId`: The subscription tier (pro/pro_plus)
- `userEmail`: User's email for reference

This metadata will be included in all webhook events for the subscription.

## Webhook Configuration

### 1. Add Webhook Endpoint

In Creem Dashboard:
- Navigate to Developers → Webhooks
- Add endpoint URL: `https://your-domain.com/api/webhooks/creem`
- Copy the webhook secret (format: `whsec_xxxxx`)

### 2. Environment Setup

```bash
# .env.local
CREEM_SECRET_KEY=sk_test_your_key_here
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CREEM_TEST_MODE=true
```

### 3. Event Handling

Creem sends ALL events to your endpoint. Key events to handle:

| Creem Event | Purpose | Action |
|-------------|---------|---------|
| `checkout.completed` | Payment successful | Create/update subscription |
| `subscription.active` | New subscription created | Update user tier |
| `subscription.paid` | Recurring payment success | Reset monthly credits |
| `subscription.canceled` | Subscription cancelled | Downgrade to free |
| `subscription.expired` | Subscription ended | Downgrade to free |
| `subscription.paused` | Subscription paused | Mark as paused |

### 4. Webhook Signature Verification

Creem uses HMAC-SHA256 for signature verification:

```typescript
const crypto = require('crypto')
const computedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(rawBody)
  .digest('hex')
  
const isValid = computedSignature === receivedSignature
```

## Testing

### 1. Test Webhook Signature
```bash
npm run test:webhook-signature
```

### 2. Debug Webhook Endpoint
Use `/api/webhooks/creem-test` to log all incoming events during development.

### 3. Local Testing with ngrok
```bash
# Start local server
npm run dev

# Expose with ngrok
ngrok http 3000

# Use ngrok URL in Creem dashboard
https://xxx.ngrok.io/api/webhooks/creem-test
```

## Common Issues

### Webhook Not Received
- Verify endpoint URL is publicly accessible
- Check webhook secret is correct
- Ensure signature header is `creem-signature`

### Checkout Session Errors
- Verify product IDs match your Creem products
- Ensure API key has correct permissions
- Check test/production mode settings

### User Not Updated After Payment
- Verify metadata includes `userId`
- Check webhook logs for errors
- Ensure database updates have proper permissions

## Production Checklist

- [ ] Set `NEXT_PUBLIC_CREEM_TEST_MODE=false`
- [ ] Update product IDs to production values
- [ ] Configure production webhook URL
- [ ] Test full payment flow
- [ ] Monitor webhook logs for first 24 hours