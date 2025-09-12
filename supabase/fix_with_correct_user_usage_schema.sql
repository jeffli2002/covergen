-- Fix subscription system with correct user_usage schema

-- 1. Update check_generation_limit function to work with existing user_usage columns
CREATE OR REPLACE FUNCTION check_generation_limit(
    p_user_id UUID,
    p_subscription_tier VARCHAR(50) DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_current_date DATE;
    v_month_key VARCHAR(7);
    v_monthly_usage INTEGER;
    v_monthly_limit INTEGER;
    v_daily_usage INTEGER;
    v_daily_limit INTEGER;
    v_trial_usage INTEGER;
    v_trial_limit INTEGER;
    v_is_trial BOOLEAN;
    v_can_generate BOOLEAN;
    v_last_used_date DATE;
    v_subscription RECORD;
    v_config JSONB;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Get subscription info from consolidated table
    SELECT * INTO v_subscription
    FROM public.subscriptions_consolidated
    WHERE user_id = p_user_id;
    
    -- If no subscription found, create default free subscription
    IF v_subscription IS NULL THEN
        INSERT INTO public.subscriptions_consolidated (user_id, tier, status, daily_limit)
        VALUES (p_user_id, 'free', 'active', 3)
        RETURNING * INTO v_subscription;
    END IF;
    
    -- Determine if user is on trial
    v_is_trial := v_subscription.status = 'trialing' AND 
                  (v_subscription.expires_at IS NULL OR v_subscription.expires_at > NOW());
    
    -- Get configuration
    v_config := jsonb_build_object(
        'trial_days', 3,
        'free_daily', 3,
        'free_monthly', 10,
        'pro_monthly', 120,
        'pro_trial_daily', 4,
        'pro_plus_monthly', 300,
        'pro_plus_trial_daily', 6
    );
    
    -- Set limits based on subscription
    IF v_subscription.tier = 'free' THEN
        v_monthly_limit := (v_config->>'free_monthly')::int;
        v_daily_limit := v_subscription.daily_limit;
    ELSIF v_is_trial THEN
        -- Trial users get daily limits and prorated trial total
        IF v_subscription.tier = 'pro' THEN
            v_trial_limit := CEIL(((v_config->>'pro_monthly')::int::float / 30) * (v_config->>'trial_days')::int);
            v_daily_limit := v_subscription.daily_limit;
            v_monthly_limit := NULL;
        ELSIF v_subscription.tier = 'pro_plus' THEN
            v_trial_limit := CEIL(((v_config->>'pro_plus_monthly')::int::float / 30) * (v_config->>'trial_days')::int);
            v_daily_limit := v_subscription.daily_limit;
            v_monthly_limit := NULL;
        END IF;
    ELSE
        -- Paid users get full monthly quotas, no daily limit (999 = unlimited)
        IF v_subscription.tier = 'pro' THEN
            v_monthly_limit := (v_config->>'pro_monthly')::int;
            v_daily_limit := CASE WHEN v_subscription.daily_limit >= 999 THEN NULL ELSE v_subscription.daily_limit END;
        ELSIF v_subscription.tier = 'pro_plus' THEN
            v_monthly_limit := (v_config->>'pro_plus_monthly')::int;
            v_daily_limit := CASE WHEN v_subscription.daily_limit >= 999 THEN NULL ELSE v_subscription.daily_limit END;
        END IF;
    END IF;
    
    -- Get current usage from user_usage table
    SELECT 
        COALESCE(usage_count, 0),
        DATE(last_used_at)
    INTO v_monthly_usage, v_last_used_date
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = v_month_key;
    
    -- Set defaults if no usage record
    IF v_monthly_usage IS NULL THEN
        v_monthly_usage := 0;
    END IF;
    
    -- Calculate daily usage (rough estimate: if last used today, assume some daily usage)
    IF v_last_used_date = v_current_date AND v_daily_limit IS NOT NULL THEN
        -- Estimate daily usage as a fraction of monthly usage
        v_daily_usage := LEAST(GREATEST(1, v_monthly_usage / DAY(v_current_date)), COALESCE(v_daily_limit, 999));
    ELSE
        v_daily_usage := 0;
    END IF;
    
    -- For trial users, trial usage equals monthly usage during trial period
    IF v_is_trial THEN
        v_trial_usage := v_monthly_usage;
    ELSE
        v_trial_usage := 0;
    END IF;
    
    -- Determine if user can generate
    v_can_generate := TRUE;
    
    -- Check limits based on subscription type
    IF v_is_trial THEN
        -- Trial users check both daily and total trial limits
        IF v_daily_limit IS NOT NULL AND v_daily_usage >= v_daily_limit THEN
            v_can_generate := FALSE;
        ELSIF v_trial_limit IS NOT NULL AND v_trial_usage >= v_trial_limit THEN
            v_can_generate := FALSE;
        END IF;
    ELSIF v_subscription.tier = 'free' THEN
        -- Free users check both daily and monthly limits
        IF v_daily_limit IS NOT NULL AND v_daily_usage >= v_daily_limit THEN
            v_can_generate := FALSE;
        ELSIF v_monthly_limit IS NOT NULL AND v_monthly_usage >= v_monthly_limit THEN
            v_can_generate := FALSE;
        END IF;
    ELSE
        -- Paid users only check monthly limit
        IF v_monthly_limit IS NOT NULL AND v_monthly_usage >= v_monthly_limit THEN
            v_can_generate := FALSE;
        END IF;
    END IF;
    
    -- Return comprehensive status
    RETURN jsonb_build_object(
        'can_generate', v_can_generate,
        'monthly_usage', v_monthly_usage,
        'monthly_limit', v_monthly_limit,
        'daily_usage', v_daily_usage,
        'daily_limit', v_daily_limit,
        'trial_usage', v_trial_usage,
        'trial_limit', v_trial_limit,
        'is_trial', v_is_trial,
        'trial_ends_at', v_subscription.expires_at,
        'subscription_tier', v_subscription.tier,
        'subscription_status', v_subscription.status,
        'user_id', p_user_id,
        -- Add computed remaining values for frontend
        'remaining_daily', GREATEST(0, COALESCE(v_daily_limit, 999) - v_daily_usage),
        'remaining_monthly', CASE 
            WHEN v_monthly_limit IS NOT NULL THEN GREATEST(0, v_monthly_limit - v_monthly_usage)
            ELSE NULL
        END,
        'remaining_trial', CASE
            WHEN v_trial_limit IS NOT NULL THEN GREATEST(0, v_trial_limit - v_trial_usage)
            ELSE NULL
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure Jeff has a proper trial subscription
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'jefflee2002@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Set Jeff as Pro trial user
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
            4,
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
            trial_started_at = COALESCE(subscriptions_consolidated.trial_started_at, NOW()),
            expires_at = NOW() + INTERVAL '3 days',
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '3 days',
            updated_at = NOW();
            
        -- Ensure user_usage record exists
        INSERT INTO user_usage (
            user_id,
            month_key,
            usage_count,
            subscription_tier,
            last_used_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
            0,
            'pro',
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id, month_key) DO UPDATE SET
            subscription_tier = 'pro',
            updated_at = NOW();
            
        RAISE NOTICE 'Jeff subscription updated successfully';
    ELSE
        RAISE NOTICE 'Jeff user not found!';
    END IF;
END $$;

-- 3. Drop and recreate views
DROP VIEW IF EXISTS public.subscriptions CASCADE;
DROP VIEW IF EXISTS public.user_subscriptions CASCADE;

-- 4. Create subscriptions view with all required columns
CREATE VIEW public.subscriptions AS
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

-- 5. Create user_subscriptions view
CREATE VIEW public.user_subscriptions AS
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

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION check_generation_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_generation_limit TO anon;

-- 7. Test everything
SELECT 
    'Jeff Function Test' as test,
    u.email,
    (check_generation_limit(u.id))::jsonb as result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

SELECT 
    'Jeff Subscription' as test,
    u.email,
    sc.tier,
    sc.status,
    sc.expires_at
FROM subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

SELECT 
    'Jeff Usage' as test,
    u.email,
    uu.*
FROM user_usage uu
JOIN auth.users u ON u.id = uu.user_id
WHERE u.email = 'jefflee2002@gmail.com'
AND uu.month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM');