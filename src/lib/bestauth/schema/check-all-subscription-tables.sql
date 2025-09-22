-- Check all subscription-related tables in the database

-- 1. List all tables that might contain subscription data
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
    END as table_category,
    COALESCE(
        pg_size_pretty(pg_relation_size(('public.' || quote_ident(table_name))::regclass)),
        'N/A'
    ) as table_size
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

-- 2. Check if specific important tables exist and their row counts
DO $$
DECLARE
    tbl RECORD;
    row_count INTEGER;
    sql_query TEXT;
BEGIN
    -- Create temp table for results
    CREATE TEMP TABLE IF NOT EXISTS table_check_results (
        table_name TEXT,
        exists BOOLEAN,
        row_count TEXT
    );
    
    -- Clear any existing results
    TRUNCATE table_check_results;
    
    -- Check each table
    FOR tbl IN 
        SELECT table_name 
        FROM (VALUES 
            ('subscriptions_consolidated'),
            ('user_subscriptions'),
            ('user_usage'),
            ('anonymous_usage'),
            ('stripe_customers'),
            ('stripe_invoices')
        ) t(table_name)
    LOOP
        -- Check if table exists
        IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl.table_name) THEN
            -- Get row count dynamically
            sql_query := format('SELECT COUNT(*) FROM public.%I', tbl.table_name);
            EXECUTE sql_query INTO row_count;
            INSERT INTO table_check_results VALUES (tbl.table_name, true, row_count::text);
        ELSE
            INSERT INTO table_check_results VALUES (tbl.table_name, false, 'N/A');
        END IF;
    END LOOP;
    
    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE 'Table Existence and Row Counts:';
    RAISE NOTICE '--------------------------------';
    FOR tbl IN SELECT * FROM table_check_results ORDER BY table_name LOOP
        RAISE NOTICE '% | Exists: % | Rows: %', 
            rpad(tbl.table_name, 30), 
            CASE WHEN tbl.exists THEN 'Yes' ELSE 'No ' END,
            tbl.row_count;
    END LOOP;
    
    -- Also return as result set
    PERFORM * FROM table_check_results ORDER BY table_name;
END $$;

-- Show the results
SELECT * FROM table_check_results ORDER BY table_name;

-- 3. Check what BestAuth tables already exist
SELECT 
    table_name,
    pg_size_pretty(pg_relation_size(quote_ident(table_name)::regclass)) as table_size,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'bestauth' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'bestauth'
ORDER BY table_name;

-- 4. Show sample data from subscriptions_consolidated if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions_consolidated') THEN
        RAISE NOTICE 'Sample data from subscriptions_consolidated:';
        PERFORM COUNT(*) FROM public.subscriptions_consolidated;
    END IF;
END $$;

-- 5. Check for any other tables that might need migration
SELECT DISTINCT
    tc.table_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND (ccu.table_name = 'users' OR kcu.table_name LIKE '%subscription%')
ORDER BY tc.table_name;