-- Fix subscription for user 994235892@qq.com
-- Run this directly in Supabase SQL Editor

-- 1. Check current state
SELECT id, email FROM bestauth_users WHERE email = '994235892@qq.com';

-- 2. Check current subscription
SELECT user_id, tier, status, billing_cycle, updated_at, metadata
FROM bestauth_subscriptions 
WHERE user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';

-- 3. Update to Pro
UPDATE bestauth_subscriptions
SET 
  tier = 'pro',
  previous_tier = tier,
  status = 'active',
  billing_cycle = 'monthly',
  upgrade_history = COALESCE(upgrade_history, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
      'from_tier', tier,
      'to_tier', 'pro',
      'upgraded_at', NOW()::text,
      'upgrade_type', 'manual_fix',
      'source', 'webhook_failure_recovery'
    )
  ),
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
    'manual_upgrade_at', NOW()::text,
    'manual_upgrade_reason', 'Webhook failed to process upgrade'
  ),
  updated_at = NOW()
WHERE user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';

-- 4. Grant Pro monthly credits (500 points)
INSERT INTO points_balance (user_id, balance, lifetime_earned, lifetime_spent, updated_at)
VALUES ('57c1c563-4cdd-4471-baa0-f49064b997c9', 500, 500, 0, NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  balance = points_balance.balance + 500,
  lifetime_earned = points_balance.lifetime_earned + 500,
  updated_at = NOW();

-- 5. Record transaction
INSERT INTO points_transactions (user_id, amount, transaction_type, description, subscription_id, metadata)
SELECT 
  '57c1c563-4cdd-4471-baa0-f49064b997c9',
  500,
  'subscription_grant',
  'Pro monthly subscription: 500 credits (manual recovery)',
  id,
  jsonb_build_object('tier', 'pro', 'cycle', 'monthly', 'source', 'manual_webhook_recovery')
FROM bestauth_subscriptions
WHERE user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';

-- 6. Verify the update
SELECT user_id, tier, status, previous_tier, billing_cycle, updated_at
FROM bestauth_subscriptions 
WHERE user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';

SELECT user_id, balance, lifetime_earned
FROM points_balance
WHERE user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';
