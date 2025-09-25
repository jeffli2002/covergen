-- Focused Migration: Single Subscription and Stripe IDs

-- Step 1: Show what columns exist in the subscriptions table
SELECT 
  'Supabase subscriptions columns' as info,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
  AND column_name IN ('id', 'status', 'created_at', 'created', 'price_id', 'quantity', 
                      'cancel_at_period_end', 'current_period_start', 'current_period_end',
                      'stripe_customer_id', 'stripe_subscription_id')
ORDER BY ordinal_position;

-- Step 2: Migrate the single missing subscription for 994235892@qq.com
INSERT INTO bestauth_subscriptions (
  id,
  user_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  created_at
)
SELECT 
  s.id,
  bu.id as user_id,
  CASE 
    WHEN s.status = 'trialing' THEN 'trialing'::bestauth.subscription_status
    WHEN s.status = 'active' THEN 'active'::bestauth.subscription_status
    WHEN s.status = 'canceled' THEN 'cancelled'::bestauth.subscription_status
    WHEN s.status = 'cancelled' THEN 'cancelled'::bestauth.subscription_status
    WHEN s.status = 'incomplete' THEN 'pending'::bestauth.subscription_status
    WHEN s.status = 'incomplete_expired' THEN 'expired'::bestauth.subscription_status
    WHEN s.status = 'past_due' THEN 'paused'::bestauth.subscription_status
    WHEN s.status = 'unpaid' THEN 'paused'::bestauth.subscription_status
    ELSE 'active'::bestauth.subscription_status
  END,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end,
  COALESCE(s.created_at, NOW())
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
JOIN bestauth_users bu ON bu.email = u.email
WHERE u.email = '994235892@qq.com'
  AND NOT EXISTS (
    SELECT 1 FROM bestauth_subscriptions bs 
    WHERE bs.user_id = bu.id
  )
ON CONFLICT (id) DO NOTHING;

-- Step 3: Update Stripe customer IDs for all subscriptions that need them
UPDATE bestauth_subscriptions bs
SET 
  stripe_customer_id = s.stripe_customer_id,
  stripe_subscription_id = s.stripe_subscription_id,
  updated_at = NOW()
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
JOIN bestauth_users bu ON bu.email = u.email
WHERE bs.user_id = bu.id
  AND s.stripe_customer_id IS NOT NULL
  AND (bs.stripe_customer_id IS NULL OR bs.stripe_customer_id != s.stripe_customer_id);

-- Step 4: Verify the migration results
SELECT 
  'Migration Results' as info,
  bu.email,
  bs.status,
  bs.stripe_customer_id,
  bs.stripe_subscription_id,
  bs.current_period_end,
  bs.created_at,
  bs.updated_at
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bs.user_id = bu.id
WHERE bu.email IN ('994235892@qq.com', 'jefflee2002@gmail.com')
ORDER BY bu.email;

-- Step 5: Show summary of all BestAuth subscriptions
SELECT 
  'Summary' as info,
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(stripe_customer_id) as with_stripe_customer,
  COUNT(stripe_subscription_id) as with_stripe_subscription
FROM bestauth_subscriptions;

-- Step 6: List any subscriptions without Stripe IDs that might need attention
SELECT 
  'Subscriptions needing Stripe setup' as info,
  bu.email,
  bs.status,
  bs.created_at
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bs.user_id = bu.id
WHERE bs.status IN ('active', 'trialing')
  AND bs.stripe_customer_id IS NULL
ORDER BY bs.created_at DESC;