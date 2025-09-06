# Subscription Timestamp Tracking Documentation

## Overview

This document outlines the comprehensive timestamp tracking system implemented for subscription management, ensuring all critical time points are recorded for trials, subscriptions, renewals, and plan changes.

## Database Schema

### Subscriptions Table - Timestamp Fields

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | TIMESTAMPTZ | When the subscription record was created |
| `updated_at` | TIMESTAMPTZ | Last time the record was updated |
| `subscription_started_at` | TIMESTAMPTZ | When the subscription first started (including trial) |
| `trial_start` | TIMESTAMPTZ | When the free trial period began |
| `trial_end` | TIMESTAMPTZ | When the free trial period ends |
| `is_trial_active` | BOOLEAN | Whether currently in trial period |
| `converted_from_trial` | BOOLEAN | Whether this was a trial conversion |
| `current_period_start` | TIMESTAMPTZ | Start of current billing period |
| `current_period_end` | TIMESTAMPTZ | End of current billing period |
| `last_renewal_at` | TIMESTAMPTZ | Last time subscription was renewed |
| `renewal_count` | INTEGER | Number of successful renewals |
| `upgraded_at` | TIMESTAMPTZ | When last upgraded to higher tier |
| `downgraded_at` | TIMESTAMPTZ | When last downgraded to lower tier |
| `previous_tier` | VARCHAR(50) | Previous subscription tier |

### Subscription History Table

Audit trail table that records all subscription events:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `subscription_id` | UUID | Reference to subscription |
| `user_id` | UUID | Reference to user |
| `event_type` | VARCHAR(50) | Type of event |
| `from_tier` | VARCHAR(50) | Previous tier (if applicable) |
| `to_tier` | VARCHAR(50) | New tier (if applicable) |
| `from_period_end` | TIMESTAMPTZ | Previous period end |
| `to_period_end` | TIMESTAMPTZ | New period end |
| `metadata` | JSONB | Additional event data |
| `created_at` | TIMESTAMPTZ | When event occurred |

### Event Types

- `created` - New subscription created
- `trial_started` - Free trial began
- `trial_converted` - Trial converted to paid
- `renewed` - Subscription renewed
- `upgraded` - Plan upgraded
- `downgraded` - Plan downgraded
- `cancelled` - Subscription cancelled
- `expired` - Subscription expired

## Webhook Timestamp Recording

### New Trial Subscription

When a user starts a trial:

```sql
created_at = NOW()
subscription_started_at = NOW()
trial_start = NOW()
trial_end = NOW() + [trial_days]
is_trial_active = true
current_period_start = trial_end  -- Billing starts after trial
current_period_end = trial_end + 1 month
```

### Trial to Paid Conversion

When trial converts (automatically or manually):

```sql
is_trial_active = false
converted_from_trial = true
current_period_start = NOW()
current_period_end = NOW() + 1 month
updated_at = NOW()
-- History event: 'trial_converted'
```

### Subscription Renewal

When subscription auto-renews:

```sql
last_renewal_at = NOW()
renewal_count = renewal_count + 1
current_period_start = [previous current_period_end]
current_period_end = [previous current_period_end] + 1 month
updated_at = NOW()
-- History event: 'renewed'
```

### Plan Upgrade

When user upgrades (e.g., Pro to Pro+):

```sql
previous_tier = [old tier]
tier = [new tier]
upgraded_at = NOW()
updated_at = NOW()
-- History event: 'upgraded'
```

### Plan Downgrade

When user downgrades (e.g., Pro+ to Pro):

```sql
previous_tier = [old tier]
tier = [new tier]
downgraded_at = NOW()
updated_at = NOW()
-- History event: 'downgraded'
```

## Implementation Files

### Database Migrations

1. **20250906_add_trial_period_fields.sql**
   - Added basic trial tracking fields
   
2. **20250907_add_missing_timestamp_fields.sql**
   - Added comprehensive timestamp fields
   - Created subscription_history table
   - Added record_subscription_event function

### Webhook Handler

**src/app/api/payment/webhook/route.ts** (current)
- Basic timestamp recording
- Trial handling
- Renewal detection

**src/app/api/payment/webhook/enhanced-route.ts** (improved)
- Comprehensive timestamp recording
- Full audit trail
- Handles all subscription events

## Verification Queries

### Check All Timestamps

```sql
SELECT 
  id,
  user_id,
  tier,
  status,
  created_at,
  updated_at,
  trial_start,
  trial_end,
  is_trial_active,
  converted_from_trial,
  subscription_started_at,
  current_period_start,
  current_period_end,
  last_renewal_at,
  renewal_count,
  upgraded_at,
  downgraded_at,
  previous_tier
FROM subscriptions
WHERE user_id = '[USER_ID]';
```

### View Subscription History

```sql
SELECT 
  event_type,
  from_tier,
  to_tier,
  created_at,
  metadata
FROM subscription_history
WHERE user_id = '[USER_ID]'
ORDER BY created_at DESC;
```

### Check Data Completeness

```sql
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(subscription_started_at) as has_started_at,
  COUNT(CASE WHEN is_trial_active THEN trial_start END) as trial_with_start,
  COUNT(CASE WHEN is_trial_active THEN trial_end END) as trial_with_end,
  COUNT(last_renewal_at) as has_renewal_date
FROM subscriptions
WHERE status = 'active';
```

## Testing Checklist

- [ ] New trial subscription creates all timestamps
- [ ] Trial conversion updates timestamps correctly
- [ ] Subscription renewal updates last_renewal_at
- [ ] Renewal count increments properly
- [ ] Upgrade records upgraded_at timestamp
- [ ] Downgrade records downgraded_at timestamp
- [ ] All events create history records
- [ ] Webhook handles all timestamp updates

## Benefits

1. **Complete Audit Trail**: Every subscription change is recorded
2. **Renewal Tracking**: Know exactly when and how many times renewed
3. **Trial Analytics**: Track trial starts, ends, and conversions
4. **Plan Change History**: See upgrade/downgrade patterns
5. **Debugging**: Full history for troubleshooting
6. **Compliance**: Audit trail for financial compliance

## Next Steps

1. Run migration: `20250907_add_missing_timestamp_fields.sql`
2. Deploy enhanced webhook handler
3. Backfill existing subscriptions with missing timestamps
4. Set up monitoring for timestamp completeness
5. Create analytics dashboard using history data