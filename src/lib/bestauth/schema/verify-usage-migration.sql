-- Verify usage migration status

-- Check current counts
SELECT 
    'user_usage' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.user_usage
UNION ALL
SELECT 
    'bestauth_usage_tracking' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT user_id) as unique_users
FROM bestauth_usage_tracking;

-- Show side by side comparison
SELECT 
    'Comparison' as status,
    uu.user_id,
    uu.month_key as original_month,
    uu.usage_count as original_count,
    but.date as migrated_date,
    but.generation_count as migrated_count,
    CASE 
        WHEN but.user_id IS NULL THEN 'NOT MIGRATED'
        ELSE 'MIGRATED'
    END as migration_status
FROM public.user_usage uu
LEFT JOIN bestauth_usage_tracking but 
    ON uu.user_id = but.user_id 
    AND but.date = (uu.month_key || '-01')::date
ORDER BY uu.user_id;

-- Check if users exist in bestauth_users
SELECT 
    'User existence check' as status,
    uu.user_id,
    CASE 
        WHEN bu.id IS NOT NULL THEN 'EXISTS in bestauth_users'
        ELSE 'MISSING from bestauth_users'
    END as user_status
FROM public.user_usage uu
LEFT JOIN bestauth_users bu ON uu.user_id = bu.id
WHERE uu.user_id NOT IN (
    SELECT user_id FROM bestauth_usage_tracking
);