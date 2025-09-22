-- Simple check for subscription-related tables

-- 1. List subscription-related tables in public schema
\echo '=== Subscription-Related Tables in Public Schema ==='
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

\echo ''
\echo '=== Key Tables Status ==='
-- 2. Check specific important tables
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
)
SELECT 
    table_name,
    CASE WHEN exists THEN 'EXISTS' ELSE 'NOT FOUND' END as status
FROM table_checks
ORDER BY table_name;

\echo ''
\echo '=== BestAuth Tables Status ==='
-- 3. Check BestAuth schema and tables
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'bestauth') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END as bestauth_schema_status;

-- List BestAuth tables if schema exists
SELECT 
    table_name
FROM information_schema.tables 
WHERE table_schema = 'bestauth'
ORDER BY table_name;

\echo ''
\echo '=== Detailed Table Information ==='
-- 4. For existing tables, show column info
\echo '--- subscriptions_consolidated columns (if exists) ---'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions_consolidated'
ORDER BY ordinal_position
LIMIT 10;

\echo ''
\echo '--- user_usage columns (if exists) ---'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- 5. Show sample counts for key tables (using dynamic SQL to avoid errors)
\echo ''
\echo '=== Row Counts for Existing Tables ==='
DO $$
DECLARE
    tbl_name TEXT;
    row_count INTEGER;
BEGIN
    -- Check subscriptions_consolidated
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions_consolidated') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.subscriptions_consolidated' INTO row_count;
        RAISE NOTICE 'subscriptions_consolidated: % rows', row_count;
    END IF;
    
    -- Check user_usage
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.user_usage' INTO row_count;
        RAISE NOTICE 'user_usage: % rows', row_count;
    END IF;
    
    -- Check user_subscriptions
    IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        EXECUTE 'SELECT COUNT(*) FROM public.user_subscriptions' INTO row_count;
        RAISE NOTICE 'user_subscriptions: % rows', row_count;
    END IF;
END $$;