-- Create Missing Transaction Records
-- This script creates transaction history for users who have points_balance
-- but no corresponding transaction records in bestauth_points_transactions

-- Step 1: Check current state
SELECT 
  '=== CURRENT STATE ===' as status,
  u.email,
  s.points_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  (SELECT COUNT(*) FROM bestauth_points_transactions WHERE user_id = u.id) as transaction_count
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com');

-- Step 2: Create missing transactions for users with balance but no transaction history
DO $$
DECLARE
  v_user RECORD;
  v_subscription_id UUID;
BEGIN
  -- Loop through users who need transaction history
  FOR v_user IN 
    SELECT 
      u.id as user_id,
      u.email,
      s.id as subscription_id,
      s.points_balance,
      s.points_lifetime_earned,
      s.points_lifetime_spent,
      (SELECT COUNT(*) FROM bestauth_points_transactions WHERE user_id = u.id) as tx_count
    FROM bestauth_users u
    LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
    WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
      AND s.points_balance IS NOT NULL
  LOOP
    RAISE NOTICE 'Processing user: % (balance: %, tx_count: %)', 
      v_user.email, v_user.points_balance, v_user.tx_count;
    
    -- Only create transactions if none exist
    IF v_user.tx_count = 0 THEN
      -- Create initial grant transaction if user has earned credits
      IF v_user.points_lifetime_earned > 0 THEN
        INSERT INTO bestauth_points_transactions (
          user_id,
          amount,
          balance_after,
          transaction_type,
          subscription_id,
          description,
          metadata,
          created_at
        ) VALUES (
          v_user.user_id,
          v_user.points_lifetime_earned,
          v_user.points_lifetime_earned, -- Balance after grant, before any spending
          'signup_bonus',
          v_user.subscription_id,
          'Initial credit grant (migrated from subscription balance)',
          jsonb_build_object('migration', true, 'source', 'fix-script'),
          NOW() - INTERVAL '2 days' -- Backdate to before any usage
        );
        
        RAISE NOTICE 'Created grant transaction: +% credits for %', 
          v_user.points_lifetime_earned, v_user.email;
      END IF;
      
      -- Create deduction transaction if user has spent credits
      IF v_user.points_lifetime_spent > 0 THEN
        INSERT INTO bestauth_points_transactions (
          user_id,
          amount,
          balance_after,
          transaction_type,
          subscription_id,
          generation_type,
          description,
          metadata,
          created_at
        ) VALUES (
          v_user.user_id,
          -v_user.points_lifetime_spent,
          v_user.points_balance, -- Current balance after spending
          'generation_deduction',
          v_user.subscription_id,
          'nanoBananaImage', -- Assume image generation
          FORMAT('Credit usage: %s credits spent (migrated from subscription)', v_user.points_lifetime_spent),
          jsonb_build_object('migration', true, 'source', 'fix-script'),
          NOW() - INTERVAL '1 day' -- More recent than grant
        );
        
        RAISE NOTICE 'Created deduction transaction: -% credits for %', 
          v_user.points_lifetime_spent, v_user.email;
      END IF;
      
      -- If user has balance but no earned/spent, create a simple grant
      IF v_user.points_lifetime_earned = 0 AND v_user.points_lifetime_spent = 0 AND v_user.points_balance > 0 THEN
        INSERT INTO bestauth_points_transactions (
          user_id,
          amount,
          balance_after,
          transaction_type,
          subscription_id,
          description,
          metadata,
          created_at
        ) VALUES (
          v_user.user_id,
          v_user.points_balance,
          v_user.points_balance,
          'signup_bonus',
          v_user.subscription_id,
          FORMAT('Free tier signup bonus: %s credits', v_user.points_balance),
          jsonb_build_object('migration', true, 'source', 'fix-script', 'tier', 'free'),
          NOW() - INTERVAL '1 day'
        );
        
        RAISE NOTICE 'Created signup bonus transaction: +% credits for %', 
          v_user.points_balance, v_user.email;
      END IF;
      
    ELSE
      RAISE NOTICE 'User % already has % transactions, skipping', 
        v_user.email, v_user.tx_count;
    END IF;
  END LOOP;
END $$;

-- Step 3: Verify transaction creation
SELECT 
  '=== AFTER TRANSACTION CREATION ===' as status,
  u.email,
  s.points_balance as current_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  (SELECT COUNT(*) FROM bestauth_points_transactions WHERE user_id = u.id) as transaction_count
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com');

-- Step 4: Show transaction details
SELECT 
  '=== TRANSACTION DETAILS ===' as status,
  u.email,
  t.created_at,
  t.transaction_type,
  t.generation_type,
  t.amount,
  t.balance_after,
  t.description
FROM bestauth_points_transactions t
JOIN bestauth_users u ON t.user_id = u.id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
ORDER BY u.email, t.created_at DESC;

-- Step 5: Validate that balance matches transaction history
SELECT 
  '=== VALIDATION ===' as status,
  u.email,
  s.points_balance as subscription_balance,
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM bestauth_points_transactions
    WHERE user_id = u.id
  ) as calculated_balance_from_transactions,
  CASE 
    WHEN s.points_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM bestauth_points_transactions
      WHERE user_id = u.id
    ) THEN '✓ MATCH'
    ELSE '✗ MISMATCH'
  END as validation_status
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com');
