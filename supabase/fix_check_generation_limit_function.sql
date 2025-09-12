-- Fix the check_generation_limit function to use correct column names

-- First, let's check what columns exist in user_usage table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- Create or replace the function with correct column names
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
    v_last_generation_date DATE;
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
    v_config := current_setting('app.subscription_config', true)::jsonb;
    IF v_config IS NULL THEN
        v_config := jsonb_build_object(
            'trial_days', 3,
            'free_daily', 3,
            'free_monthly', 10,
            'pro_monthly', 120,
            'pro_trial_daily', 4,
            'pro_plus_monthly', 300,
            'pro_plus_trial_daily', 6
        );
    END IF;
    
    -- Set limits based on subscription
    IF v_subscription.tier = 'free' THEN
        v_monthly_limit := COALESCE((v_config->>'free_monthly')::int, 10);
        v_daily_limit := COALESCE(v_subscription.daily_limit, (v_config->>'free_daily')::int, 3);
    ELSIF v_is_trial THEN
        -- Trial users get daily limits and prorated trial total
        IF v_subscription.tier = 'pro' THEN
            v_trial_limit := CEIL((COALESCE((v_config->>'pro_monthly')::int, 120)::float / 30) * COALESCE((v_config->>'trial_days')::int, 3));
            v_daily_limit := COALESCE(v_subscription.daily_limit, (v_config->>'pro_trial_daily')::int, 4);
            v_monthly_limit := NULL;
        ELSIF v_subscription.tier = 'pro_plus' THEN
            v_trial_limit := CEIL((COALESCE((v_config->>'pro_plus_monthly')::int, 300)::float / 30) * COALESCE((v_config->>'trial_days')::int, 3));
            v_daily_limit := COALESCE(v_subscription.daily_limit, (v_config->>'pro_plus_trial_daily')::int, 6);
            v_monthly_limit := NULL;
        END IF;
    ELSE
        -- Paid users get full monthly quotas, no daily limit (999 = unlimited)
        IF v_subscription.tier = 'pro' THEN
            v_monthly_limit := COALESCE((v_config->>'pro_monthly')::int, 120);
            v_daily_limit := CASE WHEN v_subscription.daily_limit >= 999 THEN NULL ELSE v_subscription.daily_limit END;
        ELSIF v_subscription.tier = 'pro_plus' THEN
            v_monthly_limit := COALESCE((v_config->>'pro_plus_monthly')::int, 300);
            v_daily_limit := CASE WHEN v_subscription.daily_limit >= 999 THEN NULL ELSE v_subscription.daily_limit END;
        END IF;
    END IF;
    
    -- Get current usage - using correct column names
    SELECT 
        COALESCE(usage_count, 0) as monthly_usage,
        -- Calculate daily usage from today's generations
        COALESCE(
            CASE 
                WHEN last_generation_date = v_current_date 
                THEN LEAST(usage_count, v_daily_limit) -- Approximate daily usage
                ELSE 0 
            END, 
            0
        ) as daily_usage,
        -- For trial usage, use the monthly usage if in trial
        CASE 
            WHEN v_is_trial THEN COALESCE(usage_count, 0)
            ELSE 0
        END as trial_usage,
        last_generation_date
    INTO v_monthly_usage, v_daily_usage, v_trial_usage, v_last_generation_date
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = v_month_key;
    
    -- Set defaults if no usage record
    IF v_monthly_usage IS NULL THEN
        v_monthly_usage := 0;
        v_daily_usage := 0;
        v_trial_usage := 0;
    END IF;
    
    -- For simplicity, if we don't have exact daily tracking, estimate based on date
    IF v_last_generation_date != v_current_date OR v_last_generation_date IS NULL THEN
        v_daily_usage := 0;
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_generation_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_generation_limit TO anon;

-- Test the function with Jeff
SELECT 
    'Test Fixed Function' as test_type,
    u.email,
    (check_generation_limit(u.id))::jsonb as result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';