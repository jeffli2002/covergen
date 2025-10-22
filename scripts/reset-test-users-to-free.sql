-- Reset jefflee2002@gmail.com to free with 30 credits
UPDATE bestauth_subscriptions
SET 
  tier = 'free',
  status = 'active',
  stripe_subscription_id = NULL,
  stripe_price_id = NULL,
  cancel_at_period_end = false,
  cancel_at = NULL,
  cancelled_at = NULL,
  current_period_start = NULL,
  current_period_end = NULL,
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{credits}',
    jsonb_build_object(
      'balance', 30,
      'granted', 30,
      'purchased', 0,
      'used', 0,
      'billing_cycle', 'monthly'
    )
  ),
  updated_at = NOW()
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = 'jefflee2002@gmail.com');

-- Reset 994235892@qq.com to free with 30 credits
UPDATE bestauth_subscriptions
SET 
  tier = 'free',
  status = 'active',
  stripe_subscription_id = NULL,
  stripe_price_id = NULL,
  cancel_at_period_end = false,
  cancel_at = NULL,
  cancelled_at = NULL,
  current_period_start = NULL,
  current_period_end = NULL,
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{credits}',
    jsonb_build_object(
      'balance', 30,
      'granted', 30,
      'purchased', 0,
      'used', 0,
      'billing_cycle', 'monthly'
    )
  ),
  updated_at = NOW()
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');

-- Show results
SELECT 
  u.email,
  s.tier::text as tier,
  s.status::text as status,
  s.metadata->'credits'->>'balance' as credits_balance,
  s.metadata->'credits'->>'granted' as credits_granted,
  s.metadata->'credits'->>'billing_cycle' as billing_cycle,
  s.stripe_subscription_id,
  s.updated_at
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
ORDER BY u.email;
