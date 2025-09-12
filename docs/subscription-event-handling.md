# Subscription Event Handling Guide

## Overview
This guide documents how to properly handle all subscription events to ensure data consistency in the `user_subscriptions` table.

## Database Schema
After migration, the `user_subscriptions` table includes:
- **Trial tracking**: trial_started_at, trial_ended_at
- **Paid tracking**: paid_started_at, canceled_at
- **Status tracking**: pause_started_at, pause_ended_at
- **History**: previous_plan_type
- **Billing**: billing_cycle, next_billing_date, total_paid_amount

## Event Handlers

### 1. Trial Start
```typescript
// When starting a trial (e.g., from payment page)
async function startTrial(userId: string, planType: 'pro' | 'pro_plus') {
  const { data, error } = await supabase.rpc('create_trial_subscription', {
    p_user_id: userId,
    p_plan_type: planType,
    p_trial_days: 3 // or from env
  });
}
```

### 2. Trial to Paid Conversion
```typescript
// In webhook handler for checkout.completed or subscription.created
async function handleTrialToPaid(event: CreemEvent) {
  const updates = {
    status: 'active',
    trial_ended_at: new Date().toISOString(),
    paid_started_at: new Date().toISOString(),
    creem_subscription_id: event.subscription.id,
    current_period_start: event.subscription.current_period_start,
    current_period_end: event.subscription.current_period_end,
    next_billing_date: event.subscription.current_period_end,
    billing_cycle: event.subscription.interval // 'month' or 'year'
  };
  
  await supabase
    .from('user_subscriptions')
    .update(updates)
    .eq('user_id', userId);
}
```

### 3. Subscription Cancellation
```typescript
// When user cancels (immediate or at period end)
async function handleCancellation(event: CreemEvent) {
  const updates = {
    cancel_at_period_end: true,
    canceled_at: new Date().toISOString(),
    // Don't change status yet if canceling at period end
    status: event.immediate ? 'canceled' : 'active'
  };
  
  await supabase
    .from('user_subscriptions')
    .update(updates)
    .eq('creem_subscription_id', event.subscription.id);
}
```

### 4. Plan Upgrade/Downgrade
```typescript
async function handlePlanChange(event: CreemEvent) {
  const currentSub = await getCurrentSubscription(userId);
  
  const updates = {
    previous_plan_type: currentSub.plan_type,
    plan_type: mapCreemPlanToOurPlan(event.subscription.product),
    daily_limit: getDailyLimit(newPlanType),
    // Update billing if needed
    current_period_end: event.subscription.current_period_end,
    next_billing_date: event.subscription.current_period_end
  };
  
  await supabase
    .from('user_subscriptions')
    .update(updates)
    .eq('user_id', userId);
}
```

### 5. Trial Expiration
```typescript
// Cron job or webhook for trial.ended
async function handleTrialExpiration(userId: string) {
  const updates = {
    status: 'expired',
    trial_ended_at: new Date().toISOString(),
    plan_type: 'free',
    daily_limit: 3
  };
  
  await supabase
    .from('user_subscriptions')
    .update(updates)
    .eq('user_id', userId)
    .eq('status', 'trialing');
}
```

### 6. Payment Update (Renewal)
```typescript
async function handlePaymentSuccess(event: CreemEvent) {
  const amount = event.payment.amount / 100; // Convert cents to dollars
  
  await supabase.rpc('increment_total_paid', {
    subscription_id: event.subscription.id,
    amount: amount
  });
  
  // Update next billing date
  await supabase
    .from('user_subscriptions')
    .update({
      current_period_start: event.subscription.current_period_start,
      current_period_end: event.subscription.current_period_end,
      next_billing_date: event.subscription.current_period_end
    })
    .eq('creem_subscription_id', event.subscription.id);
}
```

## Webhook Event Mapping

| Creem Event | Our Action | Fields to Update |
|-------------|------------|------------------|
| checkout.completed | Start trial or paid | trial_started_at, paid_started_at, status |
| subscription.created | Activate subscription | creem_subscription_id, status, billing info |
| subscription.updated | Update plan/status | plan_type, previous_plan_type, status |
| subscription.canceled | Mark for cancellation | canceled_at, cancel_at_period_end |
| subscription.trial_ended | End trial | trial_ended_at, status='expired' or 'active' |
| invoice.paid | Record payment | total_paid_amount, next_billing_date |
| subscription.paused | Pause subscription | pause_started_at, status='paused' |
| subscription.resumed | Resume subscription | pause_ended_at, status='active' |

## SQL Helper Functions

```sql
-- Increment total paid amount
CREATE OR REPLACE FUNCTION increment_total_paid(
  subscription_id TEXT,
  amount DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET total_paid_amount = total_paid_amount + amount
  WHERE creem_subscription_id = subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Get subscription status summary
CREATE OR REPLACE FUNCTION get_subscription_summary(p_user_id UUID)
RETURNS TABLE (
  is_trial BOOLEAN,
  is_paid BOOLEAN,
  days_in_trial INTEGER,
  days_as_paid_customer INTEGER,
  lifetime_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    status = 'trialing' as is_trial,
    paid_started_at IS NOT NULL as is_paid,
    CASE 
      WHEN trial_started_at IS NOT NULL 
      THEN EXTRACT(DAY FROM (COALESCE(trial_ended_at, NOW()) - trial_started_at))::INTEGER
      ELSE 0
    END as days_in_trial,
    CASE
      WHEN paid_started_at IS NOT NULL
      THEN EXTRACT(DAY FROM (NOW() - paid_started_at))::INTEGER
      ELSE 0
    END as days_as_paid_customer,
    total_paid_amount as lifetime_value
  FROM user_subscriptions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

## Testing Checklist

- [ ] New user signup creates free subscription
- [ ] Trial start sets trial_started_at and expires_at
- [ ] Trial to paid conversion sets trial_ended_at and paid_started_at
- [ ] Cancellation sets canceled_at
- [ ] Plan change tracks previous_plan_type
- [ ] Payment updates total_paid_amount
- [ ] Trial expiration sets correct status and limits
- [ ] Pause/resume tracks dates correctly

## Monitoring Queries

```sql
-- Active trials by plan
SELECT plan_type, COUNT(*) 
FROM user_subscriptions 
WHERE status = 'trialing' 
GROUP BY plan_type;

-- Trial conversion rate
SELECT 
  COUNT(*) FILTER (WHERE paid_started_at IS NOT NULL) * 100.0 / 
  COUNT(*) as conversion_rate
FROM user_subscriptions
WHERE trial_started_at IS NOT NULL;

-- Average trial duration before conversion
SELECT AVG(trial_ended_at - trial_started_at) as avg_trial_duration
FROM user_subscriptions
WHERE trial_ended_at IS NOT NULL AND paid_started_at IS NOT NULL;

-- Monthly recurring revenue
SELECT SUM(
  CASE 
    WHEN billing_cycle = 'monthly' AND plan_type = 'pro' THEN 9.99
    WHEN billing_cycle = 'monthly' AND plan_type = 'pro_plus' THEN 19.99
    WHEN billing_cycle = 'yearly' AND plan_type = 'pro' THEN 8.33
    WHEN billing_cycle = 'yearly' AND plan_type = 'pro_plus' THEN 16.67
    ELSE 0
  END
) as mrr
FROM user_subscriptions
WHERE status = 'active';
```