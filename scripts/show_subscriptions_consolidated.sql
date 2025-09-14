-- Show the structure of subscriptions_consolidated table
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'subscriptions_consolidated'
ORDER BY 
    ordinal_position;

-- Show sample data from subscriptions_consolidated table
SELECT 
    sc.id,
    u.email,
    sc.user_id,
    sc.tier,
    sc.status,
    sc.daily_limit,
    sc.trial_started_at,
    sc.trial_ended_at,
    sc.trial_days,
    sc.paid_started_at,
    sc.canceled_at,
    sc.expires_at,
    sc.current_period_start,
    sc.current_period_end,
    sc.next_billing_date,
    sc.billing_cycle,
    sc.creem_customer_id,
    sc.creem_subscription_id,
    sc.stripe_customer_id,
    sc.stripe_subscription_id,
    sc.cancel_at_period_end,
    sc.total_paid_amount,
    sc.previous_tier,
    sc.pause_started_at,
    sc.pause_ended_at,
    sc.metadata,
    sc.created_at,
    sc.updated_at
FROM 
    public.subscriptions_consolidated sc
LEFT JOIN 
    auth.users u ON sc.user_id = u.id
ORDER BY 
    sc.created_at DESC
LIMIT 20;

-- Count of subscriptions by status and tier
SELECT 
    tier,
    status,
    COUNT(*) as count
FROM 
    public.subscriptions_consolidated
GROUP BY 
    tier, status
ORDER BY 
    tier, status;

-- Show active trials
SELECT 
    u.email,
    sc.tier,
    sc.status,
    sc.trial_started_at,
    sc.expires_at as trial_ends_at,
    sc.expires_at - NOW() as time_remaining,
    sc.stripe_subscription_id,
    sc.creem_subscription_id
FROM 
    public.subscriptions_consolidated sc
JOIN 
    auth.users u ON sc.user_id = u.id
WHERE 
    sc.status = 'trialing'
    AND sc.expires_at > NOW()
ORDER BY 
    sc.expires_at ASC;

-- Show paid subscriptions
SELECT 
    u.email,
    sc.tier,
    sc.status,
    sc.paid_started_at,
    sc.current_period_end,
    sc.stripe_subscription_id,
    sc.stripe_customer_id,
    sc.total_paid_amount
FROM 
    public.subscriptions_consolidated sc
JOIN 
    auth.users u ON sc.user_id = u.id
WHERE 
    sc.status = 'active'
    AND sc.tier IN ('pro', 'pro_plus')
ORDER BY 
    sc.paid_started_at DESC;