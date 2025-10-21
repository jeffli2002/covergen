-- Fix: Free users should NOT have billing_cycle set
-- Free users with billing_cycle = 'monthly' are likely from:
-- 1. Incorrect database defaults
-- 2. Former paid users who downgraded (should clear billing_cycle)
-- 3. Bulk migration that incorrectly set the field

-- Preview affected users
SELECT 
  u.email,
  s.tier,
  s.billing_cycle,
  s.previous_tier,
  s.stripe_subscription_id,
  s.status,
  s.updated_at,
  CASE 
    WHEN s.previous_tier IS NOT NULL THEN 'Former paid user'
    WHEN s.stripe_subscription_id IS NOT NULL THEN 'Has Stripe sub (cancelled?)'
    ELSE 'Never was paid'
  END as reason
FROM bestauth_users u
JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE s.tier = 'free' AND s.billing_cycle IS NOT NULL
ORDER BY s.updated_at DESC;

-- Fix: Clear billing_cycle for all free users
UPDATE bestauth_subscriptions
SET 
  billing_cycle = NULL,
  updated_at = NOW()
WHERE tier = 'free' AND billing_cycle IS NOT NULL;

-- Verify fix
SELECT 
  tier,
  COUNT(*) as total,
  COUNT(CASE WHEN billing_cycle IS NULL THEN 1 END) as with_null_billing,
  COUNT(CASE WHEN billing_cycle IS NOT NULL THEN 1 END) as with_billing_cycle
FROM bestauth_subscriptions
GROUP BY tier
ORDER BY tier;

-- Expected result:
-- free tier: ALL should have billing_cycle = NULL
-- pro tier: ALL should have billing_cycle = 'monthly' or 'yearly'
-- pro_plus tier: ALL should have billing_cycle = 'monthly' or 'yearly'
