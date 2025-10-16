-- ============================================================================
-- Verify Jeff's Current State in Database
-- ============================================================================

-- Check BestAuth subscription
SELECT 
    'BestAuth Current State' as source,
    user_id::text,
    tier::text,
    status::text,
    points_balance,
    updated_at
FROM bestauth_subscriptions
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a';

-- Check Supabase subscription
SELECT 
    'Supabase Current State' as source,
    user_id::text,
    tier,
    status,
    NULL as points_balance,
    updated_at
FROM subscriptions_consolidated
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a';

-- Check recent transactions
SELECT 
    'Recent Transactions' as source,
    amount::text,
    balance_after::text,
    transaction_type,
    description,
    created_at
FROM bestauth_points_transactions
WHERE user_id = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'
ORDER BY created_at DESC
LIMIT 5;
