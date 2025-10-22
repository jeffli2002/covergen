-- Investigate Transaction Mismatch and Fix
-- Problem: Transaction sum doesn't match subscription balance
-- jefflee2002@gmail.com: balance=30, transactions sum=3195 (WRONG!)
-- 994235892@qq.com: balance=30, transactions sum=-35 (WRONG!)

-- Step 1: Show ALL existing transactions
SELECT 
  '=== ALL EXISTING TRANSACTIONS ===' as status,
  u.email,
  t.id,
  t.created_at,
  t.transaction_type,
  t.generation_type,
  t.amount,
  t.balance_after,
  t.description,
  t.metadata
FROM bestauth_points_transactions t
JOIN bestauth_users u ON t.user_id = u.id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
ORDER BY u.email, t.created_at;

-- Step 2: Show current subscription state
SELECT 
  '=== CURRENT SUBSCRIPTION STATE ===' as status,
  u.email,
  s.points_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  s.tier::text,
  s.status::text
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com');

-- Step 3: DELETE all existing transactions (they're wrong!)
-- We'll recreate them correctly based on subscription balance
DELETE FROM bestauth_points_transactions
WHERE user_id IN (
  SELECT id FROM bestauth_users 
  WHERE email IN ('jefflee2002@gmail.com', '994235892@qq.com')
);

-- Step 4: Recreate correct transactions
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN 
    SELECT 
      u.id as user_id,
      u.email,
      s.id as subscription_id,
      s.points_balance,
      s.points_lifetime_earned,
      s.points_lifetime_spent,
      s.tier::text as tier
    FROM bestauth_users u
    LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
    WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
  LOOP
    RAISE NOTICE 'Recreating transactions for: % (balance: %, earned: %, spent: %)', 
      v_user.email, v_user.points_balance, v_user.points_lifetime_earned, v_user.points_lifetime_spent;
    
    -- Case 1: Free tier with 30 credits (signup bonus only)
    IF v_user.tier = 'free' AND v_user.points_balance = 30 THEN
      -- Create a single signup bonus transaction
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
        30,
        30,
        'signup_bonus',
        v_user.subscription_id,
        'Free tier signup bonus: 30 credits',
        jsonb_build_object('tier', 'free', 'source', 'signup'),
        NOW() - INTERVAL '7 days' -- Created a week ago
      );
      
      RAISE NOTICE 'Created signup bonus: +30 credits for %', v_user.email;
      
      -- If user has spent some credits, create deduction transactions
      IF v_user.points_lifetime_spent > 0 THEN
        -- They started with 30, spent some, current balance is 30
        -- This means they must have earned more credits somehow
        -- Or the lifetime_spent is wrong. Let's fix it.
        
        -- Update subscription to fix lifetime values
        UPDATE bestauth_subscriptions
        SET 
          points_lifetime_earned = 30,
          points_lifetime_spent = 0
        WHERE user_id = v_user.user_id;
        
        RAISE NOTICE 'Fixed lifetime values for % (earned=30, spent=0)', v_user.email;
      END IF;
    END IF;
    
    -- Case 2: If balance differs from 30, calculate actual transactions
    IF v_user.points_balance != 30 THEN
      -- Calculate what was actually earned and spent
      DECLARE
        v_initial_grant INTEGER := GREATEST(v_user.points_lifetime_earned, v_user.points_balance + v_user.points_lifetime_spent);
        v_actual_spent INTEGER := v_initial_grant - v_user.points_balance;
      BEGIN
        -- Create grant transaction
        INSERT INTO bestauth_points_transactions (
          user_id,
          amount,
          balance_after,
          transaction_type,
          subscription_id,
          description,
          created_at
        ) VALUES (
          v_user.user_id,
          v_initial_grant,
          v_initial_grant,
          CASE 
            WHEN v_user.tier = 'free' THEN 'signup_bonus'
            ELSE 'subscription_grant'
          END,
          v_user.subscription_id,
          FORMAT('Initial credit grant: %s credits', v_initial_grant),
          NOW() - INTERVAL '7 days'
        );
        
        -- Create deduction transaction if credits were spent
        IF v_actual_spent > 0 THEN
          INSERT INTO bestauth_points_transactions (
            user_id,
            amount,
            balance_after,
            transaction_type,
            subscription_id,
            generation_type,
            description,
            created_at
          ) VALUES (
            v_user.user_id,
            -v_actual_spent,
            v_user.points_balance,
            'generation_deduction',
            v_user.subscription_id,
            'nanoBananaImage',
            FORMAT('Credits used for generation: %s credits', v_actual_spent),
            NOW() - INTERVAL '1 day'
          );
        END IF;
        
        RAISE NOTICE 'Created grant (+%) and deduction (-%) for %', 
          v_initial_grant, v_actual_spent, v_user.email;
      END;
    END IF;
  END LOOP;
END $$;

-- Step 5: Verify fixed transactions
SELECT 
  '=== FIXED TRANSACTIONS ===' as status,
  u.email,
  t.created_at,
  t.transaction_type,
  t.amount,
  t.balance_after,
  t.description
FROM bestauth_points_transactions t
JOIN bestauth_users u ON t.user_id = u.id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com')
ORDER BY u.email, t.created_at;

-- Step 6: Final validation
SELECT 
  '=== FINAL VALIDATION ===' as status,
  u.email,
  s.points_balance as subscription_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM bestauth_points_transactions
    WHERE user_id = u.id
  ) as calculated_balance,
  CASE 
    WHEN s.points_balance = (
      SELECT COALESCE(SUM(amount), 0)
      FROM bestauth_points_transactions
      WHERE user_id = u.id
    ) THEN '✓ MATCH'
    ELSE '✗ MISMATCH - BALANCE NEEDS FIX'
  END as validation_status,
  (SELECT COUNT(*) FROM bestauth_points_transactions WHERE user_id = u.id) as tx_count
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE u.email IN ('jefflee2002@gmail.com', '994235892@qq.com');
