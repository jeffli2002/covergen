-- Show actual usage data

-- Show all data from user_usage
SELECT * FROM public.user_usage ORDER BY user_id, month_key;

-- Show all data from bestauth_usage_tracking  
SELECT * FROM bestauth_usage_tracking ORDER BY user_id, date;

-- Show which user_ids exist in both tables
SELECT 
    uu.user_id,
    uu.month_key,
    uu.usage_count,
    but.date as migrated_date,
    but.generation_count as migrated_count
FROM public.user_usage uu
LEFT JOIN bestauth_usage_tracking but ON uu.user_id = but.user_id
ORDER BY uu.user_id, uu.month_key;