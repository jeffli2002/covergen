-- Debug Jeff's subscription issue

-- 1. Get Jeff's user ID
WITH jeff_user AS (
    SELECT id, email, created_at
    FROM auth.users
    WHERE email = 'jefflee2002@gmail.com'
)

-- 2. Check Jeff's subscription in consolidated table
SELECT 
    'Jeff in Consolidated Table' as check_type,
    sc.*,
    ju.email
FROM subscriptions_consolidated sc
RIGHT JOIN jeff_user ju ON ju.id = sc.user_id;

-- 3. Test check_generation_limit function for Jeff
SELECT 
    'Generation Limit Result' as check_type,
    u.email,
    check_generation_limit(u.id) as function_result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

-- 4. Check if Jeff exists in old backup tables
SELECT 
    'Jeff in user_subscriptions_old_backup' as check_type,
    us.*,
    u.email
FROM user_subscriptions_old_backup us
JOIN auth.users u ON u.id = us.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 5. Check if Jeff exists in subscriptions_old_backup
SELECT 
    'Jeff in subscriptions_old_backup' as check_type,
    s.*,
    u.email
FROM subscriptions_old_backup s  
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 6. Direct insert/update Jeff's trial subscription
-- First get Jeff's user ID
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'jefflee2002@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Insert or update Jeff's trial subscription
        INSERT INTO subscriptions_consolidated (
            user_id,
            tier,
            status,
            daily_limit,
            trial_started_at,
            expires_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'pro',
            'trialing',
            4, -- Pro trial daily limit
            NOW(),
            NOW() + INTERVAL '3 days',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            tier = 'pro',
            status = 'trialing',
            daily_limit = 4,
            trial_started_at = NOW(),
            expires_at = NOW() + INTERVAL '3 days',
            updated_at = NOW();
            
        RAISE NOTICE 'Jeff subscription updated successfully';
    ELSE
        RAISE NOTICE 'Jeff user not found!';
    END IF;
END $$;

-- 7. Verify the fix
SELECT 
    'After Fix - Jeff Subscription' as check_type,
    u.email,
    sc.*
FROM subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 8. Test function again after fix
SELECT 
    'After Fix - Generation Limit' as check_type,
    u.email,
    check_generation_limit(u.id) as function_result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';