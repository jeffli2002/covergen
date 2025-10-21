-- Check all users with their subscription details and credits balance
-- This query combines data from bestauth_users, bestauth_subscriptions, and user_id_mapping

SELECT 
  -- User Info
  u.id as user_id,
  u.email,
  u.name,
  u.created_at as user_created_at,
  u.email_verified,
  
  -- Subscription Info
  s.tier as subscription_tier,
  s.status as subscription_status,
  s.billing_cycle,
  
  -- Credits
  s.points_balance as credits_balance,
  s.points_lifetime_earned as credits_lifetime_earned,
  s.points_lifetime_spent as credits_lifetime_spent,
  
  -- Payment Info
  s.stripe_subscription_id,
  s.stripe_customer_id,
  
  -- Dates
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  s.updated_at as subscription_updated_at,
  
  -- Additional Info
  s.previous_tier,
  s.trial_ends_at,
  
  -- User ID Mapping (if exists)
  m.supabase_user_id
  
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
LEFT JOIN user_id_mapping m ON u.id = m.bestauth_user_id

ORDER BY u.created_at DESC;


-- ============================================================================
-- Simplified version - Just key fields
-- ============================================================================

SELECT 
  u.email,
  u.id as user_id,
  COALESCE(s.tier, 'free') as plan,
  COALESCE(s.status, 'active') as status,
  COALESCE(s.points_balance, 0) as credits,
  s.billing_cycle,
  s.stripe_subscription_id as stripe_sub_id,
  u.created_at::date as signup_date
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC;


-- ============================================================================
-- Summary statistics
-- ============================================================================

SELECT 
  COALESCE(s.tier, 'free') as tier,
  COUNT(*) as user_count,
  SUM(COALESCE(s.points_balance, 0)) as total_credits,
  AVG(COALESCE(s.points_balance, 0))::int as avg_credits,
  COUNT(s.stripe_subscription_id) as paying_users
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
GROUP BY COALESCE(s.tier, 'free')
ORDER BY 
  CASE COALESCE(s.tier, 'free')
    WHEN 'pro_plus' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'free' THEN 3
  END;


-- ============================================================================
-- Users with credits balance issues (potential problems)
-- ============================================================================

SELECT 
  u.email,
  s.tier,
  s.points_balance as credits,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  CASE 
    WHEN s.tier = 'pro_plus' AND s.points_balance = 0 THEN 'Pro+ with 0 credits - Issue!'
    WHEN s.tier = 'pro' AND s.points_balance = 0 THEN 'Pro with 0 credits - Issue!'
    WHEN s.tier = 'free' AND s.points_balance > 50 THEN 'Free with excess credits'
    WHEN s.points_lifetime_earned < s.points_lifetime_spent THEN 'Negative balance - Issue!'
    ELSE 'OK'
  END as status_check
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE 
  (s.tier IN ('pro', 'pro_plus') AND s.points_balance = 0)
  OR (s.tier = 'free' AND s.points_balance > 50)
  OR (s.points_lifetime_earned < s.points_lifetime_spent)
ORDER BY u.created_at DESC;


-- ============================================================================
-- Recent upgrades/downgrades (last 7 days)
-- ============================================================================

SELECT 
  u.email,
  s.previous_tier,
  s.tier as current_tier,
  s.points_balance as credits,
  s.updated_at,
  EXTRACT(EPOCH FROM (NOW() - s.updated_at))/3600 as hours_since_change
FROM bestauth_users u
JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE 
  s.previous_tier IS NOT NULL 
  AND s.previous_tier != s.tier
  AND s.updated_at > NOW() - INTERVAL '7 days'
ORDER BY s.updated_at DESC;


-- ============================================================================
-- Users with active subscriptions (paying customers)
-- ============================================================================

SELECT 
  u.email,
  s.tier,
  s.status,
  s.points_balance as credits,
  s.billing_cycle,
  s.current_period_end,
  s.cancel_at_period_end,
  CASE 
    WHEN s.cancel_at_period_end THEN 'Cancelling'
    WHEN s.current_period_end < NOW() THEN 'Expired'
    ELSE 'Active'
  END as billing_status
FROM bestauth_users u
JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE s.stripe_subscription_id IS NOT NULL
ORDER BY s.current_period_end DESC;
