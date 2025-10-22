-- Fix Credit Storage Mismatch
-- Problem: The reset script stored credits in metadata->'credits'->>'balance' (3225)
--          But the account API reads from points_balance column (showing wrong value)
--
-- This script migrates credits from metadata to points_balance column

-- Step 1: Check current state for 994235892@qq.com
SELECT 
  '=== BEFORE MIGRATION ===' as status,
  u.email,
  s.tier::text,
  s.points_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  (s.metadata->'credits'->>'balance')::integer as metadata_balance,
  (s.metadata->'credits'->>'granted')::integer as metadata_granted,
  (s.metadata->'credits'->>'used')::integer as metadata_used
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email = '994235892@qq.com';

-- Step 2: Migrate metadata credits to points_balance for 994235892@qq.com
UPDATE bestauth_subscriptions
SET 
  points_balance = COALESCE((metadata->'credits'->>'balance')::integer, 30),
  points_lifetime_earned = COALESCE((metadata->'credits'->>'granted')::integer, 30),
  points_lifetime_spent = COALESCE((metadata->'credits'->>'used')::integer, 0),
  -- Clear metadata credits since we're migrating to proper columns
  metadata = COALESCE(metadata, '{}'::jsonb) - 'credits',
  updated_at = NOW()
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com')
  AND tier = 'free';

-- Step 3: Verify migration
SELECT 
  '=== AFTER MIGRATION ===' as status,
  u.email,
  s.tier::text,
  s.points_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  s.metadata->'credits' as metadata_credits_remaining
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email = '994235892@qq.com';

-- Step 4: Check transaction history (should show actual usage)
SELECT 
  '=== TRANSACTION HISTORY ===' as status,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
  MIN(created_at) as first_transaction,
  MAX(created_at) as last_transaction
FROM bestauth_points_transactions
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');

-- Step 5: Show recent transactions with details
SELECT 
  '=== RECENT TRANSACTIONS ===' as status,
  created_at::date as date,
  transaction_type,
  generation_type,
  amount,
  balance_after,
  description
FROM bestauth_points_transactions
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com')
ORDER BY created_at DESC
LIMIT 20;

-- Step 6: Create missing transactions for audit trail
-- If the user had 3225 credits and used 5, we should have a grant transaction and a deduction
DO $$
DECLARE
  v_user_id UUID;
  v_current_balance INTEGER;
  v_granted INTEGER;
  v_used INTEGER;
BEGIN
  -- Get user ID and current state
  SELECT 
    u.id,
    COALESCE((s.metadata->'credits'->>'balance')::integer, s.points_balance),
    COALESCE((s.metadata->'credits'->>'granted')::integer, s.points_lifetime_earned),
    COALESCE((s.metadata->'credits'->>'used')::integer, s.points_lifetime_spent)
  INTO 
    v_user_id,
    v_current_balance,
    v_granted,
    v_used
  FROM bestauth_users u
  LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
  WHERE u.email = '994235892@qq.com';
  
  -- Check if we need to create transactions
  IF NOT EXISTS (
    SELECT 1 FROM bestauth_points_transactions 
    WHERE user_id = v_user_id
  ) THEN
    RAISE NOTICE 'Creating transaction history for user %', v_user_id;
    
    -- Create initial grant transaction (signup bonus or previous grants)
    IF v_granted > 0 THEN
      INSERT INTO bestauth_points_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        description,
        created_at
      ) VALUES (
        v_user_id,
        v_granted,
        v_granted,
        'signup_bonus',
        'Initial credit balance (migrated from metadata)',
        NOW() - INTERVAL '1 day' -- Backdate to before deductions
      );
      RAISE NOTICE 'Created grant transaction: % credits', v_granted;
    END IF;
    
    -- Create deduction transaction if credits were used
    IF v_used > 0 THEN
      INSERT INTO bestauth_points_transactions (
        user_id,
        amount,
        balance_after,
        transaction_type,
        generation_type,
        description,
        created_at
      ) VALUES (
        v_user_id,
        -v_used,
        v_current_balance,
        'generation_deduction',
        'nanoBananaImage',
        'Credit usage (migrated from metadata)',
        NOW() - INTERVAL '1 hour' -- Recent deduction
      );
      RAISE NOTICE 'Created deduction transaction: -% credits', v_used;
    END IF;
  ELSE
    RAISE NOTICE 'Transaction history already exists for user %', v_user_id;
  END IF;
END $$;

-- Step 7: Final verification
SELECT 
  '=== FINAL STATE ===' as status,
  u.email,
  s.tier::text,
  s.status::text,
  s.points_balance as current_credits,
  s.points_lifetime_earned as total_earned,
  s.points_lifetime_spent as total_spent,
  (SELECT COUNT(*) FROM bestauth_points_transactions WHERE user_id = u.id) as transaction_count
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email = '994235892@qq.com';
