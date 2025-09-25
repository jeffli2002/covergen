# BestAuth Payment Configuration Guide

## Overview

This guide ensures all payment features are properly configured to use BestAuth instead of Supabase Auth. All payment flows, webhooks, and subscription management must use BestAuth endpoints.

## Webhook Configuration

### Production Webhook URL
The Creem webhook URL is fixed and cannot be modified:
```
https://covergen.pro/api/webhooks/creem
```

This webhook handler has been updated to use BestAuth instead of Supabase. All webhook events will now update BestAuth tables directly.

### Test Mode Configuration
For development/test mode, update `.env.local`:
```env
# Use BestAuth webhook endpoint
CREEM_WEBHOOK_ENDPOINT=/api/webhooks/bestauth-creem

# Test mode settings
NEXT_PUBLIC_CREEM_TEST_MODE=true
SKIP_WEBHOOK_SIGNATURE=true
```

## API Endpoints

All payment-related API calls should use BestAuth endpoints:

### Checkout & Payment
- **Create Checkout**: `/api/bestauth/payment/create-checkout`
- **Cancel Subscription**: `/api/bestauth/payment/cancel-subscription`
- **Resume Subscription**: `/api/bestauth/payment/resume-subscription`
- **Upgrade Subscription**: `/api/bestauth/payment/upgrade-subscription`

### Subscription Management
- **Get Status**: `/api/bestauth/subscription/status`
- **Activate Trial**: `/api/bestauth/subscription/activate`
- **Upgrade During Trial**: `/api/bestauth/subscription/upgrade`

### Portal
- **Create Portal Session**: `/api/payment/create-portal` (Already supports BestAuth)

## Frontend Integration

### Payment Service Usage
Always use `bestAuthPaymentService` for payment operations:

```typescript
import { bestAuthPaymentService } from '@/services/payment/bestauth-payment'

// Create checkout session
const result = await bestAuthPaymentService.createCheckoutSession({
  userId: user.id,
  userEmail: user.email,
  planId: 'pro',
  successUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/pricing`
})

// Cancel subscription
await bestAuthPaymentService.cancelSubscription(subscriptionId)

// Resume subscription
await bestAuthPaymentService.resumeSubscription(subscriptionId)

// Upgrade subscription
await bestAuthPaymentService.upgradeSubscription('pro_plus', subscriptionId)
```

### Subscription Status
Always fetch subscription status from BestAuth:

```typescript
const response = await fetch('/api/bestauth/subscription/status', {
  headers: {
    'Authorization': `Bearer ${session.token}`
  }
})
```

## Data Flow

### Payment Creation Flow
1. User clicks upgrade → Frontend calls `bestAuthPaymentService.createCheckoutSession()`
2. API endpoint `/api/bestauth/payment/create-checkout` validates BestAuth session
3. Creates checkout session with Creem
4. Returns checkout URL to frontend
5. User completes payment on Creem

### Webhook Processing Flow
1. Creem sends webhook to `/api/webhooks/bestauth-creem`
2. Webhook handler validates signature
3. Updates BestAuth tables:
   - `bestauth_subscriptions` - subscription details
   - `bestauth_payments` - payment records
   - `bestauth_usage_tracking` - reset limits if needed

### Subscription Query Flow
1. Frontend requests subscription status
2. API validates BestAuth session
3. Queries `bestauth_subscriptions` table
4. Returns subscription data with usage limits

## Migration Checklist

- [x] Created BestAuth payment endpoints
- [x] Updated payment service to use BestAuth endpoints  
- [x] Updated main Creem webhook handler to use BestAuth
- [x] Payment success page uses BestAuth
- [x] All payment flows now use BestAuth tables
- [ ] Remove old Supabase payment endpoints (after full migration)

## Testing

### Manual Testing Steps
1. **Test Checkout**: Create a new subscription as a BestAuth user
2. **Test Cancel**: Cancel an active subscription
3. **Test Resume**: Resume a cancelled subscription
4. **Test Upgrade**: Upgrade from Pro to Pro+
5. **Test Webhooks**: Verify subscription data updates in BestAuth tables

### Verify BestAuth Integration
Check that these tables are updated after payment operations:
- `bestauth_users` - user exists
- `bestauth_subscriptions` - subscription created/updated
- `bestauth_payments` - payment recorded
- `bestauth_usage_tracking` - usage limits reset

## Troubleshooting

### Common Issues

1. **"Subscription not found" error**
   - Ensure user exists in `bestauth_users` table
   - Check if subscription exists in `bestauth_subscriptions`

2. **Webhook not updating subscription**
   - Verify webhook URL points to `/api/webhooks/bestauth-creem`
   - Check webhook signature validation
   - Ensure BestAuth database connection is working

3. **Usage limits not updating**
   - Verify user exists in `bestauth_users` before usage tracking
   - Check `bestauth_usage_tracking` table permissions

## Environment Variables

Required for BestAuth payments:
```env
# BestAuth Database
BESTAUTH_DATABASE_URL=postgresql://...
BESTAUTH_JWT_SECRET=...

# Creem Configuration
CREEM_SECRET_KEY=...
CREEM_WEBHOOK_SECRET=...
CREEM_PRO_PLAN_ID=...
CREEM_PRO_PLUS_PLAN_ID=...

# Site URL
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```

## Security Notes

1. Always validate BestAuth sessions before payment operations
2. Never expose service role keys in frontend code
3. Verify webhook signatures in production
4. Use HTTPS for all payment-related endpoints