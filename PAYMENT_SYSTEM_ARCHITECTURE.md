# Payment System Architecture - BestAuth + Creem Integration

## Overview
This document describes the complete payment system implementation using BestAuth for authentication and Creem SDK for payment processing.

## Payment Scenarios Implemented

### 1. New Subscription Creation (Free to Paid)
- **Endpoint**: `POST /api/bestauth/subscription/create`
- **Flow**:
  1. User requests subscription (with/without trial)
  2. System checks existing subscription
  3. Creates Creem checkout session
  4. User completes payment
  5. Webhook updates database

### 2. Trial Subscription
- **With Payment Method**: 
  - Created via checkout with `trialPeriodDays`
  - Automatically converts to paid after trial
- **Without Payment Method**:
  - Created via `startTrial` method
  - Requires payment method before trial end

### 3. Trial to Paid Conversion
- **Immediate**: `POST /api/bestauth/subscription/activate`
  - Uses Creem `updateSubscription` with immediate proration
- **At Trial End**: Handled by webhook automatically

### 4. Upgrade (Pro to Pro+)
- **Endpoint**: `POST /api/bestauth/subscription/upgrade`
- **Scenarios**:
  - Trial with payment: Immediate upgrade
  - Trial without payment: Checkout required
  - Paid user: Proration handled by Creem

### 5. Downgrade (Pro+ to Pro)
- **Endpoint**: `POST /api/bestauth/subscription/downgrade`
- **Options**:
  - Immediate with proration credit
  - Scheduled at period end

### 6. Cancellation
- **Endpoint**: `POST /api/bestauth/subscription/cancel`
- **Options**:
  - Cancel at period end (default)
  - Cancel immediately

### 7. Resume Cancelled Subscription
- **Endpoint**: `POST /api/bestauth/subscription/resume`
- **Condition**: Only if not yet expired

### 8. Payment Method Update
- **Endpoint**: `POST /api/bestauth/subscription/update-payment`
- **Flow**: Redirects to Creem customer portal

## Database Schema

### bestauth_subscriptions Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- tier: ENUM ('free', 'pro', 'pro_plus')
- status: ENUM ('active', 'cancelled', 'expired', 'pending', 'trialing', 'paused', 'past_due')
- stripe_customer_id: TEXT
- stripe_subscription_id: TEXT
- stripe_price_id: TEXT
- stripe_payment_method_id: TEXT (tracks has_payment_method)
- trial_started_at: TIMESTAMPTZ
- trial_ends_at: TIMESTAMPTZ
- current_period_start: TIMESTAMPTZ
- current_period_end: TIMESTAMPTZ
- cancel_at_period_end: BOOLEAN
- cancelled_at: TIMESTAMPTZ
- metadata: JSONB
```

### bestauth_payment_history Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- stripe_payment_intent_id: TEXT
- stripe_invoice_id: TEXT
- amount: INTEGER (in cents)
- currency: VARCHAR(3)
- status: TEXT
- description: TEXT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

## API Endpoints

### Subscription Management
- `GET /api/bestauth/subscription` - Get subscription details
- `POST /api/bestauth/subscription/create` - Create new subscription
- `POST /api/bestauth/subscription/activate` - Activate trial
- `POST /api/bestauth/subscription/upgrade` - Upgrade tier
- `POST /api/bestauth/subscription/downgrade` - Downgrade tier
- `POST /api/bestauth/subscription/cancel` - Cancel subscription
- `POST /api/bestauth/subscription/resume` - Resume cancelled subscription
- `POST /api/bestauth/subscription/update-payment` - Update payment method

### Webhooks
- `/api/webhooks/bestauth-creem` - BestAuth-specific webhook handler

## Webhook Events Handled

1. **checkout.completed** - New subscription created
2. **subscription.created** - Subscription details available
3. **subscription.update** - Status/plan changes
4. **subscription.trial_will_end** - Trial ending notification
5. **subscription.trial_ended** - Trial converted to paid
6. **subscription.deleted** - Subscription cancelled
7. **payment.success** - Payment processed
8. **payment.failed** - Payment failed (past_due)
9. **subscription.paused** - Subscription paused
10. **refund.created** - Refund processed
11. **dispute.created** - Payment disputed

## Payment Flow States

```
FREE → TRIAL → ACTIVE → CANCELLED → FREE
       ↓
    ACTIVE (with payment)
       ↓
    PAST_DUE → CANCELLED
```

## Security Considerations

1. **Webhook Verification**: All webhooks verify Creem signature
2. **Session Validation**: All endpoints require authenticated session
3. **Idempotency**: Webhook handlers are idempotent
4. **Error Handling**: Graceful fallbacks for Creem API failures

## Usage Tracking

- Daily limits enforced based on subscription tier
- Trial limits separate from regular limits
- Usage reset on successful payment
- Session-based tracking for anonymous users

## Environment Variables Required

```env
# Creem Configuration
CREEM_SECRET_KEY=creem_live_xxx or creem_test_xxx
CREEM_WEBHOOK_SECRET=whsec_xxx
CREEM_PRO_PLAN_ID=prod_xxx
CREEM_PRO_PLUS_PLAN_ID=prod_xxx
NEXT_PUBLIC_CREEM_TEST_MODE=false

# BestAuth Database
BESTAUTH_DATABASE_URL=postgresql://...
```

## Testing

### Test Cards (Creem Test Mode)
- Success: 4242424242424242
- Decline: 4000000000000002
- Insufficient: 4000000000009995
- 3D Secure: 4000000000003220

### Test Scenarios
1. Free user → Trial → Paid
2. Free user → Paid (skip trial)
3. Trial user → Cancel → Resume
4. Pro user → Pro+ → Pro
5. Payment failure → Update payment → Resume

## Known Limitations

1. **Creem SDK Limitations**:
   - No direct trial end support (using proration workaround)
   - Portal session creation simplified
   - Customer management placeholder implementation

2. **Edge Cases**:
   - Race conditions between checkout and subscription.created webhooks
   - Payment method updates require portal redirect
   - Downgrade proration handled at period end by default