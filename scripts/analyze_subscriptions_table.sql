-- =====================================================
-- SUBSCRIPTIONS_CONSOLIDATED TABLE ANALYSIS
-- =====================================================

-- 1. TABLE STRUCTURE
-- =====================================================
SELECT '=== TABLE STRUCTURE ===' as section;

SELECT 
    ordinal_position as pos,
    column_name,
    data_type || 
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN '(' || character_maximum_length || ')'
        ELSE ''
    END as data_type,
    CASE 
        WHEN is_nullable = 'YES' THEN 'NULL'
        ELSE 'NOT NULL'
    END as nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'subscriptions_consolidated'
ORDER BY 
    ordinal_position;

-- 2. INDEXES
-- =====================================================
SELECT '=== INDEXES ===' as section;

SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public'
    AND tablename = 'subscriptions_consolidated';

-- 3. SUBSCRIPTION SUMMARY
-- =====================================================
SELECT '=== SUBSCRIPTION SUMMARY ===' as section;

SELECT 
    tier,
    status,
    COUNT(*) as user_count,
    COUNT(CASE WHEN stripe_subscription_id IS NOT NULL THEN 1 END) as with_stripe_id,
    COUNT(CASE WHEN creem_subscription_id IS NOT NULL THEN 1 END) as with_creem_id,
    MIN(created_at)::date as oldest_subscription,
    MAX(created_at)::date as newest_subscription
FROM 
    public.subscriptions_consolidated
GROUP BY 
    tier, status
ORDER BY 
    tier, status;

-- 4. TRIAL SUBSCRIPTIONS DETAIL
-- =====================================================
SELECT '=== ACTIVE TRIALS ===' as section;

SELECT 
    u.email,
    sc.tier as plan,
    sc.status,
    sc.daily_limit,
    TO_CHAR(sc.trial_started_at, 'YYYY-MM-DD HH24:MI') as trial_started,
    TO_CHAR(sc.expires_at, 'YYYY-MM-DD HH24:MI') as trial_ends,
    EXTRACT(EPOCH FROM (sc.expires_at - NOW())) / 3600 as hours_remaining,
    sc.stripe_subscription_id IS NOT NULL as has_payment_method,
    COALESCE(sc.stripe_subscription_id, sc.creem_subscription_id, 'MANUAL TRIAL') as subscription_id
FROM 
    public.subscriptions_consolidated sc
JOIN 
    auth.users u ON sc.user_id = u.id
WHERE 
    sc.status = 'trialing'
ORDER BY 
    sc.expires_at ASC;

-- 5. PAID SUBSCRIPTIONS DETAIL
-- =====================================================
SELECT '=== PAID SUBSCRIPTIONS ===' as section;

SELECT 
    u.email,
    sc.tier as plan,
    sc.status,
    TO_CHAR(sc.paid_started_at, 'YYYY-MM-DD') as paid_since,
    TO_CHAR(sc.current_period_end, 'YYYY-MM-DD') as next_billing,
    sc.cancel_at_period_end as will_cancel,
    sc.total_paid_amount as total_paid,
    SUBSTRING(sc.stripe_subscription_id, 1, 20) || '...' as stripe_sub_id,
    SUBSTRING(sc.stripe_customer_id, 1, 20) || '...' as stripe_cust_id
FROM 
    public.subscriptions_consolidated sc
JOIN 
    auth.users u ON sc.user_id = u.id
WHERE 
    sc.status IN ('active', 'canceled')
    AND sc.tier IN ('pro', 'pro_plus')
ORDER BY 
    sc.paid_started_at DESC;

-- 6. SUBSCRIPTION TRANSITIONS
-- =====================================================
SELECT '=== SUBSCRIPTION TRANSITIONS ===' as section;

SELECT 
    u.email,
    sc.previous_tier || ' -> ' || sc.tier as transition,
    sc.status,
    TO_CHAR(sc.updated_at, 'YYYY-MM-DD HH24:MI') as transition_date
FROM 
    public.subscriptions_consolidated sc
JOIN 
    auth.users u ON sc.user_id = u.id
WHERE 
    sc.previous_tier IS NOT NULL
ORDER BY 
    sc.updated_at DESC
LIMIT 10;

-- 7. DATA QUALITY CHECK
-- =====================================================
SELECT '=== DATA QUALITY CHECK ===' as section;

SELECT 
    'Users without subscription' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN public.subscriptions_consolidated sc ON u.id = sc.user_id
WHERE sc.id IS NULL

UNION ALL

SELECT 
    'Expired trials still marked as trialing',
    COUNT(*)
FROM public.subscriptions_consolidated
WHERE status = 'trialing' AND expires_at < NOW()

UNION ALL

SELECT 
    'Active subscriptions without stripe_subscription_id',
    COUNT(*)
FROM public.subscriptions_consolidated
WHERE status = 'active' 
    AND tier IN ('pro', 'pro_plus')
    AND stripe_subscription_id IS NULL

UNION ALL

SELECT 
    'Subscriptions with both stripe and creem IDs',
    COUNT(*)
FROM public.subscriptions_consolidated
WHERE stripe_subscription_id IS NOT NULL 
    AND creem_subscription_id IS NOT NULL;

-- 8. SAMPLE RAW DATA
-- =====================================================
SELECT '=== SAMPLE RAW DATA (5 RECORDS) ===' as section;

SELECT * 
FROM public.subscriptions_consolidated 
ORDER BY created_at DESC 
LIMIT 5;