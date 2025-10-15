-- ============================================================================
-- Migration Script: Supabase Auth -> BestAuth
-- ============================================================================
-- This script migrates user data, subscriptions, and credits from Supabase 
-- Auth system to BestAuth system.
--
-- IMPORTANT: Run this in a transaction and TEST on a copy first!
-- 
-- Database: Same Supabase PostgreSQL database
-- Source: auth.users, subscriptions_consolidated, points_transactions
-- Target: bestauth_users, bestauth_subscriptions, bestauth_points_transactions
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 0: Pre-Migration Checks
-- ============================================================================

-- Check if points columns exist in bestauth_subscriptions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bestauth_subscriptions' 
        AND column_name = 'points_balance'
    ) THEN
        RAISE EXCEPTION 'ERROR: bestauth_subscriptions does not have points_balance column. Run add-points-system.sql first!';
    END IF;
END $$;

-- ============================================================================
-- STEP 1: Create Temporary User Mapping Table
-- ============================================================================

CREATE TEMP TABLE IF NOT EXISTS user_mapping AS
SELECT 
    au.id as supabase_user_id,
    bu.id as bestauth_user_id,
    au.email,
    au.created_at as supabase_created_at,
    bu.created_at as bestauth_created_at
FROM auth.users au
INNER JOIN bestauth_users bu ON LOWER(TRIM(au.email)) = LOWER(TRIM(bu.email))
WHERE au.email IS NOT NULL AND bu.email IS NOT NULL;

-- Report on user mapping
DO $$
DECLARE
    v_supabase_users INTEGER;
    v_bestauth_users INTEGER;
    v_mapped_users INTEGER;
    v_unmapped_supabase INTEGER;
    v_unmapped_bestauth INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_supabase_users FROM auth.users WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO v_bestauth_users FROM bestauth_users WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO v_mapped_users FROM user_mapping;
    
    SELECT COUNT(*) INTO v_unmapped_supabase 
    FROM auth.users au 
    WHERE email IS NOT NULL 
    AND NOT EXISTS (SELECT 1 FROM user_mapping WHERE supabase_user_id = au.id);
    
    SELECT COUNT(*) INTO v_unmapped_bestauth
    FROM bestauth_users bu
    WHERE email IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM user_mapping WHERE bestauth_user_id = bu.id);
    
    RAISE NOTICE '================================================';
    RAISE NOTICE 'USER MAPPING SUMMARY';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Total Supabase users: %', v_supabase_users;
    RAISE NOTICE 'Total BestAuth users: %', v_bestauth_users;
    RAISE NOTICE 'Successfully mapped: %', v_mapped_users;
    RAISE NOTICE 'Unmapped Supabase users: %', v_unmapped_supabase;
    RAISE NOTICE 'Unmapped BestAuth users: %', v_unmapped_bestauth;
    RAISE NOTICE '================================================';
    
    IF v_mapped_users = 0 THEN
        RAISE EXCEPTION 'ERROR: No users could be mapped between systems!';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Migrate Subscription Data
-- ============================================================================

-- Update bestauth_subscriptions with data from subscriptions_consolidated
UPDATE bestauth_subscriptions bs
SET
    tier = CASE 
        WHEN sc.tier = 'free' THEN 'free'::bestauth.subscription_tier
        WHEN sc.tier = 'pro' THEN 'pro'::bestauth.subscription_tier
        WHEN sc.tier = 'pro_plus' THEN 'pro_plus'::bestauth.subscription_tier
        ELSE bs.tier -- Keep existing if unrecognized
    END,
    status = CASE
        WHEN sc.status = 'active' THEN 'active'::bestauth.subscription_status
        WHEN sc.status = 'cancelled' THEN 'cancelled'::bestauth.subscription_status
        WHEN sc.status = 'expired' THEN 'expired'::bestauth.subscription_status
        WHEN sc.status = 'trialing' THEN 'trialing'::bestauth.subscription_status
        WHEN sc.status = 'pending' THEN 'pending'::bestauth.subscription_status
        WHEN sc.status = 'paused' THEN 'paused'::bestauth.subscription_status
        ELSE bs.status -- Keep existing if unrecognized
    END,
    stripe_customer_id = COALESCE(sc.stripe_customer_id, bs.stripe_customer_id),
    stripe_subscription_id = COALESCE(sc.stripe_subscription_id, bs.stripe_subscription_id),
    stripe_payment_method_id = COALESCE(sc.stripe_payment_method_id, bs.stripe_payment_method_id),
    trial_started_at = COALESCE(sc.trial_start_date, bs.trial_started_at),
    trial_ends_at = COALESCE(sc.trial_end_date, bs.trial_ends_at),
    current_period_start = COALESCE(sc.current_period_start, bs.current_period_start),
    current_period_end = COALESCE(sc.current_period_end, bs.current_period_end),
    cancel_at_period_end = COALESCE(sc.cancel_at_period_end, bs.cancel_at_period_end),
    updated_at = NOW()
FROM subscriptions_consolidated sc
INNER JOIN user_mapping um ON sc.user_id = um.supabase_user_id
WHERE bs.user_id = um.bestauth_user_id
AND sc.updated_at > bs.updated_at; -- Only update if Supabase data is newer

-- Insert subscriptions that exist in Supabase but not in BestAuth
INSERT INTO bestauth_subscriptions (
    user_id,
    tier,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_payment_method_id,
    trial_started_at,
    trial_ends_at,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
)
SELECT 
    um.bestauth_user_id,
    CASE 
        WHEN sc.tier = 'free' THEN 'free'::bestauth.subscription_tier
        WHEN sc.tier = 'pro' THEN 'pro'::bestauth.subscription_tier
        WHEN sc.tier = 'pro_plus' THEN 'pro_plus'::bestauth.subscription_tier
        ELSE 'free'::bestauth.subscription_tier
    END,
    CASE
        WHEN sc.status = 'active' THEN 'active'::bestauth.subscription_status
        WHEN sc.status = 'cancelled' THEN 'cancelled'::bestauth.subscription_status
        WHEN sc.status = 'expired' THEN 'expired'::bestauth.subscription_status
        WHEN sc.status = 'trialing' THEN 'trialing'::bestauth.subscription_status
        WHEN sc.status = 'pending' THEN 'pending'::bestauth.subscription_status
        WHEN sc.status = 'paused' THEN 'paused'::bestauth.subscription_status
        ELSE 'active'::bestauth.subscription_status
    END,
    sc.stripe_customer_id,
    sc.stripe_subscription_id,
    sc.stripe_payment_method_id,
    sc.trial_start_date,
    sc.trial_end_date,
    sc.current_period_start,
    sc.current_period_end,
    sc.cancel_at_period_end,
    sc.created_at,
    sc.updated_at
FROM subscriptions_consolidated sc
INNER JOIN user_mapping um ON sc.user_id = um.supabase_user_id
WHERE NOT EXISTS (
    SELECT 1 FROM bestauth_subscriptions 
    WHERE user_id = um.bestauth_user_id
);

-- ============================================================================
-- STEP 3: Migrate Credits/Points Data
-- ============================================================================

-- Update bestauth_subscriptions with points balance from subscriptions_consolidated
UPDATE bestauth_subscriptions bs
SET
    points_balance = COALESCE(sc.points_balance, bs.points_balance, 0),
    points_lifetime_earned = COALESCE(sc.points_lifetime_earned, bs.points_lifetime_earned, 0),
    points_lifetime_spent = COALESCE(sc.points_lifetime_spent, bs.points_lifetime_spent, 0),
    updated_at = NOW()
FROM subscriptions_consolidated sc
INNER JOIN user_mapping um ON sc.user_id = um.supabase_user_id
WHERE bs.user_id = um.bestauth_user_id
AND (
    sc.points_balance IS NOT NULL OR 
    sc.points_lifetime_earned IS NOT NULL OR 
    sc.points_lifetime_spent IS NOT NULL
);

-- ============================================================================
-- STEP 4: Migrate Points Transaction History
-- ============================================================================

-- Insert points transactions from Supabase to BestAuth
INSERT INTO bestauth_points_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    subscription_id,
    generation_type,
    stripe_payment_intent_id,
    description,
    metadata,
    created_at
)
SELECT 
    um.bestauth_user_id,
    pt.amount,
    pt.balance_after,
    pt.transaction_type,
    bs.id, -- Map to BestAuth subscription ID
    pt.generation_type,
    pt.stripe_payment_intent_id,
    pt.description,
    pt.metadata,
    pt.created_at
FROM points_transactions pt
INNER JOIN user_mapping um ON pt.user_id = um.supabase_user_id
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id
WHERE NOT EXISTS (
    -- Avoid duplicates by checking if similar transaction already exists
    SELECT 1 FROM bestauth_points_transactions bpt
    WHERE bpt.user_id = um.bestauth_user_id
    AND bpt.amount = pt.amount
    AND bpt.transaction_type = pt.transaction_type
    AND bpt.created_at = pt.created_at
)
ORDER BY pt.created_at ASC; -- Maintain chronological order

-- ============================================================================
-- STEP 5: Migration Summary Report
-- ============================================================================

DO $$
DECLARE
    v_subscriptions_migrated INTEGER;
    v_subscriptions_created INTEGER;
    v_points_migrated INTEGER;
    v_transactions_migrated INTEGER;
BEGIN
    -- Count migrated subscriptions (updated)
    SELECT COUNT(*) INTO v_subscriptions_migrated
    FROM bestauth_subscriptions bs
    INNER JOIN user_mapping um ON bs.user_id = um.bestauth_user_id
    INNER JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id;
    
    -- Count transactions migrated
    SELECT COUNT(*) INTO v_transactions_migrated
    FROM bestauth_points_transactions bpt
    INNER JOIN user_mapping um ON bpt.user_id = um.bestauth_user_id;
    
    -- Total points in BestAuth
    SELECT COALESCE(SUM(points_balance), 0) INTO v_points_migrated
    FROM bestauth_subscriptions;
    
    RAISE NOTICE '================================================';
    RAISE NOTICE 'MIGRATION SUMMARY';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Subscriptions migrated: %', v_subscriptions_migrated;
    RAISE NOTICE 'Points transactions migrated: %', v_transactions_migrated;
    RAISE NOTICE 'Total credits in BestAuth: %', v_points_migrated;
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Review the results and run COMMIT if everything looks good.';
    RAISE NOTICE 'Or run ROLLBACK to undo all changes.';
    RAISE NOTICE '================================================';
END $$;

-- ============================================================================
-- STEP 6: Verification Queries
-- ============================================================================

-- Show users with different data between systems
SELECT 
    um.email,
    sc.tier as supabase_tier,
    bs.tier::text as bestauth_tier,
    sc.points_balance as supabase_points,
    bs.points_balance as bestauth_points,
    sc.status as supabase_status,
    bs.status::text as bestauth_status
FROM user_mapping um
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id
WHERE sc.id IS NOT NULL OR bs.id IS NOT NULL
ORDER BY um.email;

-- IMPORTANT: Review the output above before committing!
-- If everything looks correct, run: COMMIT;
-- If something is wrong, run: ROLLBACK;

-- DON'T FORGET TO COMMIT OR ROLLBACK!
-- The transaction is still open!
