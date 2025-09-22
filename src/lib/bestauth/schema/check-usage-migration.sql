-- Check usage data migration details

-- 1. Show what's in user_usage
SELECT '=== Original user_usage data ===' as section;
SELECT 
    user_id,
    month_key,
    usage_count,
    subscription_tier,
    created_at::date as created_date
FROM public.user_usage
ORDER BY user_id, month_key;

-- 2. Show what's in bestauth_usage_tracking
SELECT '=== Migrated bestauth_usage_tracking data ===' as section;
SELECT 
    user_id,
    date,
    generation_count,
    created_at::date as created_date
FROM bestauth_usage_tracking
ORDER BY user_id, date;

-- 3. Compare user IDs
SELECT '=== User ID comparison ===' as section;
SELECT 
    'user_usage' as source,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_rows
FROM public.user_usage
UNION ALL
SELECT 
    'bestauth_usage_tracking' as source,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_rows
FROM bestauth_usage_tracking;

-- 4. Check which users from user_usage are missing in bestauth
SELECT '=== Users in user_usage but not in bestauth_usage_tracking ===' as section;
SELECT DISTINCT
    uu.user_id,
    uu.month_key,
    uu.usage_count,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM bestauth_users bu WHERE bu.id = uu.user_id) 
        THEN 'User not in bestauth_users'
        ELSE 'User exists in bestauth_users'
    END as status
FROM public.user_usage uu
WHERE NOT EXISTS (
    SELECT 1 
    FROM bestauth_usage_tracking but 
    WHERE but.user_id = uu.user_id
)
ORDER BY uu.user_id;

-- 5. Check if there are any constraints or issues
SELECT '=== Potential issues ===' as section;
SELECT 
    'Users in user_usage not in bestauth_users' as issue,
    COUNT(*) as count
FROM public.user_usage uu
WHERE NOT EXISTS (SELECT 1 FROM bestauth_users bu WHERE bu.id = uu.user_id)
UNION ALL
SELECT 
    'Duplicate month_key entries for same user' as issue,
    COUNT(*) - COUNT(DISTINCT user_id || '-' || month_key) as count
FROM public.user_usage;