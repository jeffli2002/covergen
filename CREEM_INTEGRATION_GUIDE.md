# Creem Payment Integration Guide

This guide explains the complete Creem payment integration for CoverGen Pro.

## Overview

The integration replaces the previous Stripe-based implementation with the Creem SDK, providing:
- Subscription management (Free/Pro/Pro+ tiers)
- Checkout flow for new subscriptions
- Customer portal for subscription management
- Webhook handling for payment events
- License management for Pro+ API access

## Architecture

### Key Components

1. **Payment Service** (`/src/services/payment/creem.ts`)
   - Core Creem SDK integration
   - Handles checkout sessions, subscriptions, and customer management
   - Supports both client-side and server-side usage

2. **API Routes**
   - `/api/payment/create-checkout` - Creates checkout sessions
   - `/api/payment/create-portal` - Creates customer portal sessions
   - `/api/payment/cancel-subscription` - Cancels subscriptions
   - `/api/payment/resume-subscription` - Resumes cancelled subscriptions
   - `/api/webhooks/creem` - Handles Creem webhook events

3. **Database Schema**
   - `subscriptions` table stores subscription details
   - `profiles` table stores user tier and quota limits
   - `user_usage` table tracks monthly usage

## Setup Instructions

### 1. Environment Configuration

Add these variables to your `.env.local`:

```bash
# Creem API Keys
CREEM_SECRET_KEY=sk_test_your_secret_key_here
CREEM_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CREEM_TEST_MODE=true  # Set to false in production
```

### 2. Create Creem Products

Run the setup script to create products in your Creem account:

```bash
npm run setup:creem-products
```

This creates two products:
- **CoverGen Pro** - $9.00/month - 120 covers
- **CoverGen Pro+** - $19.00/month - 300 covers + API access

### 3. Configure Webhooks

In your Creem dashboard:
1. Go to Webhooks settings
2. Add endpoint URL: `https://your-domain.com/api/webhooks/creem`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `CREEM_WEBHOOK_SECRET`

### 4. Update Product/Price IDs

After creating products, update the IDs in `/src/services/payment/creem.ts`:

```typescript
export const CREEM_PRODUCTS = {
  pro: CREEM_TEST_MODE ? 'prod_test_pro' : 'prod_live_pro',
  pro_plus: CREEM_TEST_MODE ? 'prod_test_proplus' : 'prod_live_proplus',
}

export const CREEM_PRICES = {
  pro: CREEM_TEST_MODE ? 'price_test_pro_900' : 'price_live_pro_900',
  pro_plus: CREEM_TEST_MODE ? 'price_test_proplus_1900' : 'price_live_proplus_1900',
}
```

## Implementation Details

### Checkout Flow

1. User clicks upgrade button
2. Client calls `creemService.createCheckoutSession()`
3. API route creates Creem checkout with metadata
4. User is redirected to Creem checkout page
5. After payment, webhook updates user subscription

### Subscription Management

- **Cancel**: Sets `cancel_at_period_end` to true
- **Resume**: Sets `cancel_at_period_end` to false
- **Upgrade**: Uses `upgradeSubscription` with proration
- **Portal**: Generates customer portal link for self-service

### Webhook Processing

The webhook handler processes these events:
- `checkout.session.completed` - Activates new subscription
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Downgrades to free tier
- `invoice.payment_succeeded` - Resets monthly usage
- `invoice.payment_failed` - Logs payment failure

### Security

- Webhook signatures are verified in production
- All API routes require authentication
- Service role keys are only used server-side
- User ownership is verified for all operations

## Testing

### Test Cards

Use these test card numbers in test mode:
- `4242424242424242` - Successful payment
- `4000000000000002` - Card declined
- `4000000000009995` - Insufficient funds
- `4000000000003220` - 3D Secure required

### Test Flows

1. **New Subscription**
   ```bash
   # Create checkout session
   curl -X POST http://localhost:3001/api/payment/create-checkout \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"planId": "pro", "successUrl": "...", "cancelUrl": "..."}'
   ```

2. **Cancel Subscription**
   ```bash
   curl -X POST http://localhost:3001/api/payment/cancel-subscription \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"subscriptionId": "sub_123", "cancelAtPeriodEnd": true}'
   ```

3. **Test Webhook**
   ```bash
   # Use Creem CLI or dashboard to trigger test events
   ```

## Migration from Stripe

For existing Stripe subscriptions:

1. Export customer data from Stripe
2. Create matching customers in Creem
3. Update database with new IDs
4. Pause Stripe subscriptions
5. Activate Creem subscriptions

## Monitoring

### Key Metrics

- Checkout conversion rate
- Failed payment rate
- Subscription churn rate
- Webhook processing time

### Error Handling

All errors are logged with context:
- User ID
- Subscription ID
- Error message
- Stack trace

### Alerts

Set up monitoring for:
- Failed webhook processing
- Payment failures
- Subscription cancellations
- API errors

## Support

### Common Issues

1. **Checkout fails**: Check API keys and product IDs
2. **Webhook not received**: Verify endpoint URL and events
3. **Subscription not updated**: Check webhook signature
4. **Portal link fails**: Ensure customer exists in Creem

### Debugging

Enable debug logging:
```typescript
console.log('Creem request:', { endpoint, params })
console.log('Creem response:', { status, data })
```

### Resources

- [Creem API Documentation](https://docs.creem.io)
- [Creem SDK Reference](https://github.com/armitage-labs/creem-sdk)
- [Creem Dashboard](https://app.creem.io)