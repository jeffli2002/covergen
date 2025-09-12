-- Final fix to ensure Jeff is recognized as Pro trial user

-- 1. Update user_usage to ensure it's properly set for current month
UPDATE user_usage
SET 
    subscription_tier = 'pro',
    usage_count = 0,
    daily_generation_count = 0,
    trial_usage_count = 0,
    last_generation_date = NULL,
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com')
AND month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- 2. Ensure Jeff's subscription is properly set as trialing
UPDATE subscriptions_consolidated
SET 
    tier = 'pro',
    status = 'trialing',
    daily_limit = 4,
    trial_started_at = COALESCE(trial_started_at, NOW()),
    expires_at = CASE 
        WHEN expires_at < NOW() THEN NOW() + INTERVAL '3 days'
        ELSE expires_at
    END,
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '3 days',
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com');

-- 3. Test the API response that the frontend would receive
SELECT 
    'API Response Test' as test_type,
    u.email,
    jsonb_pretty((check_generation_limit(u.id))::jsonb) as api_response
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

-- 4. Check what the frontend would see through the views
SELECT 
    'Frontend View Test' as test_type,
    u.email,
    s.tier,
    s.status,
    s.plan_id,
    s.trial_ends_at,
    s.trial_start,
    s.current_period_end
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 5. Verify the subscription tier is correct
SELECT 
    'Subscription Tier Check' as test_type,
    sc.tier as consolidated_tier,
    uu.subscription_tier as usage_tier,
    sc.status,
    sc.expires_at,
    CASE 
        WHEN sc.tier = uu.subscription_tier THEN 'SYNCED ✓'
        ELSE 'MISMATCH ✗'
    END as sync_status
FROM subscriptions_consolidated sc
JOIN user_usage uu ON uu.user_id = sc.user_id
WHERE sc.user_id = (SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com')
AND uu.month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM');