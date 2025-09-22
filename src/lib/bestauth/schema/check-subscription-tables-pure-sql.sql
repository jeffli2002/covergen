-- Check subscription-related tables (Pure SQL version)

-- 1. List subscription-related tables in public schema
SELECT 
    '=== Subscription-Related Tables in Public Schema ===' as section;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('subscriptions_consolidated', 'user_subscriptions', 'subscriptions') THEN 'Main subscription table'
        WHEN table_name LIKE '%usage%' THEN 'Usage tracking'
        WHEN table_name LIKE '%payment%' THEN 'Payment data'
        WHEN table_name LIKE '%stripe%' THEN 'Stripe integration'
        WHEN table_name LIKE '%invoice%' THEN 'Invoice data'
        WHEN table_name LIKE '%billing%' THEN 'Billing data'
        WHEN table_name LIKE '%quota%' THEN 'Quota management'
        WHEN table_name LIKE '%credit%' THEN 'Credit system'
        WHEN table_name LIKE '%customer%' THEN 'Customer data'
        ELSE 'Other'
    END as table_category
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (
    table_name LIKE '%subscription%'
    OR table_name LIKE '%usage%'
    OR table_name LIKE '%payment%'
    OR table_name LIKE '%stripe%'
    OR table_name LIKE '%invoice%'
    OR table_name LIKE '%billing%'
    OR table_name LIKE '%quota%'
    OR table_name LIKE '%credit%'
    OR table_name LIKE '%customer%'
)
ORDER BY table_category, table_name;

-- 2. Check specific important tables
SELECT '=== Key Tables Status ===' as section;

WITH table_checks AS (
    SELECT 
        'subscriptions_consolidated' as table_name,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions_consolidated') as exists
    UNION ALL
    SELECT 'user_subscriptions', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions')
    UNION ALL
    SELECT 'user_usage', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage')
    UNION ALL
    SELECT 'anonymous_usage', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_usage')
    UNION ALL
    SELECT 'stripe_customers', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stripe_customers')
    UNION ALL
    SELECT 'stripe_invoices', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stripe_invoices')
    UNION ALL
    SELECT 'profiles', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
)
SELECT 
    table_name,
    CASE WHEN exists THEN 'EXISTS' ELSE 'NOT FOUND' END as status
FROM table_checks
ORDER BY table_name;

-- 3. Check BestAuth schema and tables
SELECT '=== BestAuth Schema Status ===' as section;

SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'bestauth') 
        THEN 'BestAuth schema EXISTS' 
        ELSE 'BestAuth schema NOT FOUND' 
    END as bestauth_status;

-- List BestAuth tables if schema exists
SELECT '=== BestAuth Tables (if schema exists) ===' as section;

SELECT 
    table_name as bestauth_table
FROM information_schema.tables 
WHERE table_schema = 'bestauth'
ORDER BY table_name;

-- 4. Show user_usage columns (if exists)
SELECT '=== user_usage Table Structure (if exists) ===' as section;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- 5. Show subscriptions_consolidated columns (if exists)  
SELECT '=== subscriptions_consolidated Table Structure (if exists) ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions_consolidated'
ORDER BY ordinal_position
LIMIT 15;

-- 6. Row counts using dynamic SQL
DO $$
DECLARE
    row_count INTEGER;
    output_text TEXT := '';
BEGIN
    output_text := E'\n=== Row Counts for Existing Tables ===\n';
    
    -- Check subscriptions_consolidated
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions_consolidated') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.subscriptions_consolidated' INTO row_count;
        output_text := output_text || 'subscriptions_consolidated: ' || row_count || E' rows\n';
    ELSE
        output_text := output_text || E'subscriptions_consolidated: NOT FOUND\n';
    END IF;
    
    -- Check user_usage
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.user_usage' INTO row_count;
        output_text := output_text || 'user_usage: ' || row_count || E' rows\n';
    ELSE
        output_text := output_text || E'user_usage: NOT FOUND\n';
    END IF;
    
    -- Check user_subscriptions
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.user_subscriptions' INTO row_count;
        output_text := output_text || 'user_subscriptions: ' || row_count || E' rows\n';
    ELSE
        output_text := output_text || E'user_subscriptions: NOT FOUND\n';
    END IF;
    
    -- Check anonymous_usage
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_usage') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.anonymous_usage' INTO row_count;
        output_text := output_text || 'anonymous_usage: ' || row_count || E' rows\n';
    ELSE
        output_text := output_text || E'anonymous_usage: NOT FOUND\n';
    END IF;
    
    -- Check profiles
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.profiles' INTO row_count;
        output_text := output_text || 'profiles: ' || row_count || E' rows\n';
    ELSE
        output_text := output_text || E'profiles: NOT FOUND\n';
    END IF;
    
    -- Check BestAuth tables
    IF EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'bestauth') THEN
        output_text := output_text || E'\n=== BestAuth Tables Row Counts ===\n';
        
        IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'bestauth' AND table_name = 'bestauth_users') THEN
            EXECUTE 'SELECT COUNT(*) FROM bestauth.bestauth_users' INTO row_count;
            output_text := output_text || 'bestauth_users: ' || row_count || E' rows\n';
        END IF;
        
        IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'bestauth' AND table_name = 'bestauth_subscriptions') THEN
            EXECUTE 'SELECT COUNT(*) FROM bestauth.bestauth_subscriptions' INTO row_count;
            output_text := output_text || 'bestauth_subscriptions: ' || row_count || E' rows\n';
        END IF;
        
        IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'bestauth' AND table_name = 'bestauth_usage_tracking') THEN
            EXECUTE 'SELECT COUNT(*) FROM bestauth.bestauth_usage_tracking' INTO row_count;
            output_text := output_text || 'bestauth_usage_tracking: ' || row_count || E' rows\n';
        END IF;
    END IF;
    
    RAISE NOTICE '%', output_text;
END $$;