-- ============================================================================
-- Fix Jeff's Pro+ Upgrade: Sync Both BestAuth and Supabase
-- ============================================================================
-- User: jefflee2002@gmail.com
-- Issue: Pro → Pro+ upgrade failed due to split-brain (Supabase=free, BestAuth=pro)
-- Solution: Manually sync both systems to pro_plus and grant credits
-- ============================================================================

BEGIN;

-- User identification
DO $$
DECLARE
    v_user_id UUID := '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a';
    v_email TEXT := 'jefflee2002@gmail.com';
    v_new_tier TEXT := 'pro_plus';
    v_credits_to_grant INT := 100; -- Pro+ monthly credits
BEGIN
    RAISE NOTICE 'Starting Pro+ upgrade for user: %', v_email;
    RAISE NOTICE 'User ID: %', v_user_id;
    
    -- ========================================================================
    -- STEP 1: Update BestAuth Subscription
    -- ========================================================================
    RAISE NOTICE 'Updating BestAuth subscription to Pro+...';
    
    UPDATE bestauth_subscriptions
    SET 
        tier = v_new_tier::bestauth.subscription_tier,
        points_balance = points_balance + v_credits_to_grant,
        points_lifetime_earned = points_lifetime_earned + v_credits_to_grant,
        status = 'active'::bestauth.subscription_status,
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BestAuth subscription not found for user %', v_user_id;
    END IF;
    
    RAISE NOTICE 'BestAuth subscription updated successfully';
    
    -- ========================================================================
    -- STEP 2: Update Supabase Subscription (if exists)
    -- ========================================================================
    RAISE NOTICE 'Updating Supabase subscriptions_consolidated to Pro+...';
    
    UPDATE subscriptions_consolidated
    SET 
        tier = v_new_tier,
        status = 'active',
        updated_at = NOW()
    WHERE user_id = v_user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'Supabase subscription updated successfully';
    ELSE
        RAISE NOTICE 'No Supabase subscription found (this is OK if migrated to BestAuth)';
    END IF;
    
    -- ========================================================================
    -- STEP 3: Record Credit Grant Transaction
    -- ========================================================================
    RAISE NOTICE 'Recording credit grant transaction...';
    
    INSERT INTO bestauth_points_transactions (
        id,
        user_id,
        amount,
        balance_after,
        transaction_type,
        description,
        created_at
    ) 
    SELECT 
        gen_random_uuid(),
        v_user_id,
        v_credits_to_grant,
        points_balance, -- Current balance after update
        'admin_adjustment',
        'Pro+ upgrade: Manual fix for failed webhook sync',
        NOW()
    FROM bestauth_subscriptions
    WHERE user_id = v_user_id;
    
    RAISE NOTICE 'Credit grant transaction recorded';
    
    -- ========================================================================
    -- STEP 4: Verification
    -- ========================================================================
    RAISE NOTICE '================================================';
    RAISE NOTICE 'VERIFICATION - Current State After Update:';
    RAISE NOTICE '================================================';
    
END $$;

-- Show final state
SELECT 
    'BestAuth' as system,
    tier::text as current_tier,
    points_balance as credits,
    status::text as status,
    updated_at
FROM bestauth_subscriptions
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'

UNION ALL

SELECT 
    'Supabase' as system,
    tier as current_tier,
    NULL as credits,
    status as status,
    updated_at
FROM subscriptions_consolidated
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a';

-- Show recent credit transactions
SELECT 
    'Recent Credits' as info,
    amount::text,
    transaction_type,
    description,
    created_at::text
FROM bestauth_points_transactions
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- IMPORTANT: Review the output above!
-- If everything looks correct: COMMIT;
-- If something is wrong: ROLLBACK;
-- ============================================================================

-- Uncomment to auto-commit (or run manually after review):
-- COMMIT;
