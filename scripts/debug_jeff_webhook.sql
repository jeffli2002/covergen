-- Debug Jeff's subscription issue
-- Check what's actually in the database for Jeff

-- 1. Get Jeff's user ID and subscription data
WITH jeff_data AS (
    SELECT 
        u.id as user_id,
        u.email,
        u.created_at as user_created_at
    FROM auth.users u
    WHERE u.email = 'jefflee2002@gmail.com'
)
SELECT 
    'Jeff Subscription Data' as check_type,
    jd.email,
    sc.*
FROM jeff_data jd
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = jd.user_id;

-- 2. Check if there are any webhook logs or payment logs
-- (This assumes you might have a webhook_logs or payment_logs table)
SELECT 
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%webhook%' OR table_name LIKE '%payment%' OR table_name LIKE '%log%')
ORDER BY table_name;

-- 3. Check Jeff's profile data
WITH jeff_data AS (
    SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com'
)
SELECT 
    'Jeff Profile Data' as check_type,
    p.*
FROM profiles p
JOIN jeff_data jd ON p.id = jd.id;

-- 4. Check what IDs Jeff actually has
WITH jeff_data AS (
    SELECT 
        u.id as user_id,
        u.email
    FROM auth.users u
    WHERE u.email = 'jefflee2002@gmail.com'
),
jeff_sub AS (
    SELECT * FROM subscriptions_consolidated 
    WHERE user_id = (SELECT user_id FROM jeff_data)
)
SELECT 
    'Jeff ID Analysis' as check_type,
    CASE 
        WHEN stripe_subscription_id IS NOT NULL THEN 'Has stripe_subscription_id: ' || stripe_subscription_id
        WHEN creem_subscription_id IS NOT NULL THEN 'Has creem_subscription_id: ' || creem_subscription_id
        ELSE 'No subscription IDs found'
    END as subscription_id_status,
    CASE
        WHEN stripe_customer_id IS NOT NULL THEN 'Has stripe_customer_id: ' || stripe_customer_id
        WHEN creem_customer_id IS NOT NULL THEN 'Has creem_customer_id: ' || creem_customer_id
        ELSE 'No customer IDs found'
    END as customer_id_status,
    status,
    tier,
    created_at,
    updated_at,
    metadata
FROM jeff_sub;

-- 5. Theory: Maybe the subscription was created before webhook integration was complete
-- Check when Jeff's subscription was created vs when the webhook columns were added
WITH jeff_data AS (
    SELECT 
        u.id as user_id,
        u.email,
        u.created_at as user_created
    FROM auth.users u
    WHERE u.email = 'jefflee2002@gmail.com'
),
jeff_sub AS (
    SELECT * FROM subscriptions_consolidated 
    WHERE user_id = (SELECT user_id FROM jeff_data)
)
SELECT 
    'Timeline Analysis' as check_type,
    jd.user_created as user_created_at,
    js.created_at as subscription_created_at,
    js.updated_at as subscription_updated_at,
    CASE 
        WHEN js.created_at < '2025-09-01'::timestamp THEN 'Created before Creem integration'
        ELSE 'Created after Creem integration'
    END as integration_timing
FROM jeff_data jd
JOIN jeff_sub js ON true;