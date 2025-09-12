-- Verify migration results

-- 1. Check all data in the new consolidated table
SELECT 
    'Consolidated Table' as source,
    user_id,
    tier,
    status,
    daily_limit,
    trial_started_at,
    trial_ended_at,
    expires_at,
    creem_subscription_id,
    created_at,
    updated_at
FROM public.subscriptions_consolidated
ORDER BY created_at DESC;

-- 2. Check if Jeff's trial is there
SELECT 
    'Jeff Trial Check' as check_type,
    sc.*,
    u.email
FROM public.subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 3. Count comparison between old and new tables
SELECT 
    'user_subscriptions_old_backup' as table_name,
    COUNT(*) as row_count
FROM public.user_subscriptions_old_backup
UNION ALL
SELECT 
    'subscriptions_old_backup' as table_name,
    COUNT(*) as row_count
FROM public.subscriptions_old_backup
UNION ALL
SELECT 
    'subscriptions_consolidated' as table_name,
    COUNT(*) as row_count
FROM public.subscriptions_consolidated;

-- 4. Test the check_generation_limit function for Jeff
SELECT 
    'Generation Limit Check for Jeff' as test_type,
    check_generation_limit(u.id) as result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

-- 5. Check all users with non-free subscriptions
SELECT 
    'Non-Free Subscriptions' as check_type,
    u.email,
    sc.tier,
    sc.status,
    sc.daily_limit,
    sc.expires_at,
    sc.trial_started_at,
    sc.trial_ended_at
FROM public.subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE sc.tier != 'free'
ORDER BY sc.created_at DESC;