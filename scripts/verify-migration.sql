-- ============================================================================
-- Verification Script: Check Supabase -> BestAuth Migration
-- ============================================================================
-- Run this BEFORE and AFTER migration to verify data integrity
-- ============================================================================

-- ============================================================================
-- PRE-MIGRATION: Data Inventory
-- ============================================================================

\echo '================================================'
\echo 'SUPABASE AUTH SYSTEM - CURRENT DATA'
\echo '================================================'

SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM auth.users
WHERE email IS NOT NULL

UNION ALL

SELECT 
    'Total Subscriptions',
    COUNT(*)
FROM subscriptions_consolidated

UNION ALL

SELECT 
    'Total Subscriptions with Data',
    COUNT(*)
FROM subscriptions_consolidated
WHERE tier IS NOT NULL;

\echo ''
\echo '================================================'
\echo 'BESTAUTH SYSTEM - CURRENT DATA'
\echo '================================================'

SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM bestauth_users
WHERE email IS NOT NULL

UNION ALL

SELECT 
    'Total Subscriptions',
    COUNT(*)
FROM bestauth_subscriptions

UNION ALL

SELECT 
    'Total Points Balance',
    COALESCE(SUM(points_balance), 0)
FROM bestauth_subscriptions

UNION ALL

SELECT 
    'Total Points Transactions',
    COUNT(*)
FROM bestauth_points_transactions;

-- ============================================================================
-- USER MAPPING CHECK
-- ============================================================================

\echo ''
\echo '================================================'
\echo 'USER MAPPING ANALYSIS'
\echo '================================================'

WITH user_mapping AS (
    SELECT 
        au.id as supabase_user_id,
        bu.id as bestauth_user_id,
        au.email
    FROM auth.users au
    INNER JOIN bestauth_users bu ON LOWER(TRIM(au.email)) = LOWER(TRIM(bu.email))
    WHERE au.email IS NOT NULL
)
SELECT 
    'Users in Supabase' as metric,
    COUNT(DISTINCT id) as count
FROM auth.users WHERE email IS NOT NULL

UNION ALL

SELECT 
    'Users in BestAuth',
    COUNT(DISTINCT id)
FROM bestauth_users WHERE email IS NOT NULL

UNION ALL

SELECT 
    'Users mappable by email',
    COUNT(*)
FROM user_mapping

UNION ALL

SELECT 
    'Unmapped Supabase users',
    COUNT(*)
FROM auth.users au
WHERE email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM bestauth_users bu 
    WHERE LOWER(TRIM(bu.email)) = LOWER(TRIM(au.email))
);

-- ============================================================================
-- SUBSCRIPTION COMPARISON
-- ============================================================================

\echo ''
\echo '================================================'
\echo 'SUBSCRIPTION DATA COMPARISON'
\echo '================================================'

WITH user_mapping AS (
    SELECT 
        au.id as supabase_user_id,
        bu.id as bestauth_user_id,
        au.email
    FROM auth.users au
    INNER JOIN bestauth_users bu ON LOWER(TRIM(au.email)) = LOWER(TRIM(bu.email))
)
SELECT 
    um.email,
    sc.tier as supabase_tier,
    bs.tier::text as bestauth_tier,
    sc.status as supabase_status,
    bs.status::text as bestauth_status,
    bs.points_balance as bestauth_credits,
    CASE 
        WHEN sc.tier::text = bs.tier::text THEN '✓ Match'
        ELSE '✗ Mismatch'
    END as tier_match
FROM user_mapping um
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id
WHERE sc.id IS NOT NULL OR bs.id IS NOT NULL
ORDER BY um.email
LIMIT 50;

-- ============================================================================
-- POINTS BALANCE VERIFICATION
-- ============================================================================

\echo ''
\echo '================================================'
\echo 'CREDITS/POINTS BALANCE CHECK'
\echo '================================================'

SELECT 
    'Users with credits in BestAuth' as metric,
    COUNT(*) as count
FROM bestauth_subscriptions
WHERE points_balance > 0

UNION ALL

SELECT 
    'Total credits in BestAuth',
    COALESCE(SUM(points_balance), 0)
FROM bestauth_subscriptions

UNION ALL

SELECT 
    'Users with Pro tier',
    COUNT(*)
FROM bestauth_subscriptions
WHERE tier IN ('pro', 'pro_plus');

-- ============================================================================
-- FIND DISCREPANCIES
-- ============================================================================

\echo ''
\echo '================================================'
\echo 'DATA DISCREPANCIES (Need Attention)'
\echo '================================================'

WITH user_mapping AS (
    SELECT 
        au.id as supabase_user_id,
        bu.id as bestauth_user_id,
        au.email
    FROM auth.users au
    INNER JOIN bestauth_users bu ON LOWER(TRIM(au.email)) = LOWER(TRIM(bu.email))
)
SELECT 
    um.email,
    'Tier Mismatch' as issue,
    sc.tier || ' (Supabase) vs ' || bs.tier::text || ' (BestAuth)' as details
FROM user_mapping um
INNER JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id
INNER JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id
WHERE sc.tier::text != bs.tier::text

UNION ALL

SELECT 
    um.email,
    'User in Supabase but not BestAuth',
    'Subscription exists in Supabase only'
FROM user_mapping um
INNER JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id
WHERE NOT EXISTS (
    SELECT 1 FROM bestauth_subscriptions 
    WHERE user_id = um.bestauth_user_id
);

-- ============================================================================
-- SPECIFIC USER LOOKUP
-- ============================================================================

\echo ''
\echo '================================================'
\echo 'SPECIFIC USER CHECK: jefflee2002@gmail.com'
\echo '================================================'

WITH user_mapping AS (
    SELECT 
        au.id as supabase_user_id,
        bu.id as bestauth_user_id,
        au.email
    FROM auth.users au
    INNER JOIN bestauth_users bu ON LOWER(TRIM(au.email)) = LOWER(TRIM(bu.email))
    WHERE LOWER(au.email) = 'jefflee2002@gmail.com'
)
SELECT 
    'Email' as field,
    um.email as value
FROM user_mapping um

UNION ALL

SELECT 
    'Supabase User ID',
    um.supabase_user_id::text
FROM user_mapping um

UNION ALL

SELECT 
    'BestAuth User ID',
    um.bestauth_user_id::text
FROM user_mapping um

UNION ALL

SELECT 
    'Supabase Tier',
    sc.tier
FROM user_mapping um
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id

UNION ALL

SELECT 
    'BestAuth Tier',
    bs.tier::text
FROM user_mapping um
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id

UNION ALL

SELECT 
    'BestAuth Credits',
    COALESCE(bs.points_balance, 0)::text
FROM user_mapping um
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = um.bestauth_user_id;

\echo ''
\echo '================================================'
\echo 'Verification complete!'
\echo '================================================'
