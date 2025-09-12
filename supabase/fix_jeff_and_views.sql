-- Fix Jeff's subscription and update views

-- 1. First ensure Jeff has a proper trial subscription
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
            current_period_start,
            current_period_end,
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
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '3 days',
            updated_at = NOW();
            
        RAISE NOTICE 'Jeff subscription updated successfully';
    ELSE
        RAISE NOTICE 'Jeff user not found!';
    END IF;
END $$;

-- 2. Drop existing views to recreate them with all columns
DROP VIEW IF EXISTS public.subscriptions CASCADE;
DROP VIEW IF EXISTS public.user_subscriptions CASCADE;

-- 3. Recreate the subscriptions view with ALL necessary columns
CREATE OR REPLACE VIEW public.subscriptions AS
SELECT 
  id,
  user_id,
  creem_subscription_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at,
  -- Add missing columns that frontend expects
  expires_at as trial_ends_at,
  CASE 
    WHEN tier = 'pro' THEN 'pro'
    WHEN tier = 'pro_plus' THEN 'pro-plus'
    ELSE 'free'
  END as plan_id,
  trial_started_at as trial_start,
  trial_ended_at as trial_end,
  stripe_subscription_id,
  stripe_customer_id
FROM public.subscriptions_consolidated;

-- 4. Recreate user_subscriptions view
CREATE OR REPLACE VIEW public.user_subscriptions AS
SELECT 
  id,
  user_id,
  tier as plan_type,
  status,
  daily_limit,
  created_at,
  updated_at,
  expires_at,
  cancel_at_period_end,
  creem_customer_id,
  current_period_start,
  current_period_end,
  metadata,
  creem_subscription_id
FROM public.subscriptions_consolidated;

-- 5. Grant permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;

-- 6. Test Jeff's subscription through the function
SELECT 
    'Jeff Subscription Check' as test_type,
    u.email,
    check_generation_limit(u.id) as generation_limit_result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

-- 7. Check Jeff's data in the consolidated table
SELECT 
    'Jeff in Consolidated Table' as check_type,
    u.email,
    sc.*
FROM subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

-- 8. Test the view returns correct data
SELECT 
    'Jeff through Subscriptions View' as check_type,
    u.email,
    s.*
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'jefflee2002@gmail.com';