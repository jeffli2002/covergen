-- Check all columns referenced in the migration script exist in source tables

-- 1. Check subscriptions_consolidated table columns
SELECT 
    'subscriptions_consolidated' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'subscriptions_consolidated'
ORDER BY ordinal_position;

-- 2. Check which columns are missing that we're trying to reference
WITH required_columns AS (
    SELECT unnest(ARRAY[
        'user_id',
        'tier',
        'status',
        'stripe_customer_id',
        'stripe_subscription_id',
        'trial_started_at',
        'trial_ended_at',
        'expires_at',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'canceled_at',
        'metadata',
        'created_at',
        'updated_at'
    ]) as column_name
),
existing_columns AS (
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' 
        AND table_name = 'subscriptions_consolidated'
)
SELECT 
    rc.column_name as required_column,
    CASE WHEN ec.column_name IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM required_columns rc
LEFT JOIN existing_columns ec ON rc.column_name = ec.column_name
ORDER BY 
    CASE WHEN ec.column_name IS NULL THEN 0 ELSE 1 END,
    rc.column_name;

-- 3. Check user_usage table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_usage'
) as user_usage_table_exists;

-- 4. Check stripe_invoices table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'stripe_invoices'
) as stripe_invoices_table_exists;