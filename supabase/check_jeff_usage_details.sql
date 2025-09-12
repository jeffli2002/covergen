-- Check Jeff's detailed usage and limits

-- 1. Get Jeff's current usage from user_usage table
SELECT 
    'Current Usage' as check_type,
    u.email,
    uu.month_key,
    uu.usage_count as monthly_usage,
    uu.daily_generation_count,
    uu.trial_usage_count,
    uu.last_generation_date,
    uu.last_used_at,
    uu.updated_at
FROM user_usage uu
JOIN auth.users u ON u.id = uu.user_id
WHERE u.email = 'jefflee2002@gmail.com'
AND uu.month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- 2. Get Jeff's subscription limits
SELECT 
    'Subscription Limits' as check_type,
    u.email,
    sc.tier,
    sc.status,
    sc.daily_limit,
    sc.trial_started_at,
    sc.expires_at
FROM subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 3. Check what the generation limit function returns
SELECT 
    'Generation Limit Check' as check_type,
    u.email,
    (check_generation_limit(u.id))::jsonb as full_result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

-- 4. Extract key values from generation limit check
SELECT 
    'Usage Summary' as check_type,
    u.email,
    (check_generation_limit(u.id)->>'daily_usage')::int as daily_usage,
    (check_generation_limit(u.id)->>'daily_limit')::int as daily_limit,
    (check_generation_limit(u.id)->>'monthly_usage')::int as monthly_usage,
    (check_generation_limit(u.id)->>'trial_usage')::int as trial_usage,
    (check_generation_limit(u.id)->>'trial_limit')::int as trial_limit,
    (check_generation_limit(u.id)->>'can_generate')::boolean as can_generate,
    (check_generation_limit(u.id)->>'remaining_daily')::int as remaining_daily
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';