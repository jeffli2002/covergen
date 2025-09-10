-- Update check_generation_limit function to accept configurable limits
CREATE OR REPLACE FUNCTION check_generation_limit(
    p_user_id UUID,
    p_subscription_tier VARCHAR(50)
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
    v_trial_ends_at TIMESTAMPTZ;
    v_subscription_tier VARCHAR(50);
    v_config JSONB;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Get user's trial status and subscription info
    SELECT 
        creem_trial_ends_at,
        COALESCE(creem_subscription_tier, p_subscription_tier)
    INTO v_trial_ends_at, v_subscription_tier
    FROM auth.users
    WHERE id = p_user_id;
    
    -- Check if user is on Creem trial
    v_is_trial := v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW();
    
    -- Get configuration from environment (passed as settings)
    v_config := current_setting('app.subscription_config', true)::jsonb;
    
    -- If no config provided, use defaults
    IF v_config IS NULL THEN
        v_config := jsonb_build_object(
            'trial_days', 7,
            'free_daily', 3,
            'free_monthly', 10,
            'pro_monthly', 120,
            'pro_trial_daily', 4,
            'pro_plus_monthly', 300,
            'pro_plus_trial_daily', 7
        );
    END IF;
    
    -- Set limits based on subscription tier and trial status
    IF v_subscription_tier = 'free' OR v_subscription_tier IS NULL THEN
        -- Free users
        v_monthly_limit := COALESCE((v_config->>'free_monthly')::int, 10);
        v_daily_limit := COALESCE((v_config->>'free_daily')::int, 3);
        v_trial_limit := NULL;
    ELSIF v_is_trial THEN
        -- Trial users get prorated limits
        IF v_subscription_tier = 'pro' THEN
            v_trial_limit := CEIL((COALESCE((v_config->>'pro_monthly')::int, 120)::float / 30) * COALESCE((v_config->>'trial_days')::int, 7));
            v_daily_limit := COALESCE((v_config->>'pro_trial_daily')::int, 4);
            v_monthly_limit := NULL; -- No monthly limit during trial
        ELSIF v_subscription_tier = 'pro_plus' THEN
            v_trial_limit := CEIL((COALESCE((v_config->>'pro_plus_monthly')::int, 300)::float / 30) * COALESCE((v_config->>'trial_days')::int, 7));
            v_daily_limit := COALESCE((v_config->>'pro_plus_trial_daily')::int, 7);
            v_monthly_limit := NULL; -- No monthly limit during trial
        END IF;
    ELSE
        -- Paid users get full monthly quotas
        IF v_subscription_tier = 'pro' THEN
            v_monthly_limit := COALESCE((v_config->>'pro_monthly')::int, 120);
            v_daily_limit := NULL; -- Daily = remaining monthly
        ELSIF v_subscription_tier = 'pro_plus' THEN
            v_monthly_limit := COALESCE((v_config->>'pro_plus_monthly')::int, 300);
            v_daily_limit := NULL; -- Daily = remaining monthly
        END IF;
    END IF;
    
    -- Get current usage
    SELECT 
        COALESCE(usage_count, 0),
        COALESCE(daily_generation_count, 0),
        COALESCE(trial_usage_count, 0),
        last_generation_date
    INTO v_monthly_usage, v_daily_usage, v_trial_usage, v_last_generation_date
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = v_month_key;
    
    -- Set defaults if no record
    IF v_monthly_usage IS NULL THEN
        v_monthly_usage := 0;
        v_daily_usage := 0;
        v_trial_usage := 0;
    END IF;
    
    -- Reset daily usage if new day
    IF v_last_generation_date != v_current_date THEN
        v_daily_usage := 0;
    END IF;
    
    -- Determine if user can generate
    IF v_subscription_tier = 'free' THEN
        -- Free users check both daily and monthly
        v_can_generate := (v_daily_usage < v_daily_limit) AND (v_monthly_usage < v_monthly_limit);
    ELSIF v_is_trial THEN
        -- Trial users check trial total and daily limit
        v_can_generate := (v_trial_usage < v_trial_limit) AND (v_daily_usage < v_daily_limit);
    ELSE
        -- Paid users check monthly only
        v_can_generate := v_monthly_usage < v_monthly_limit;
        -- Calculate remaining daily allowance
        v_daily_limit := GREATEST(0, v_monthly_limit - v_monthly_usage);
    END IF;
    
    RETURN jsonb_build_object(
        'monthly_usage', v_monthly_usage,
        'monthly_limit', v_monthly_limit,
        'daily_usage', v_daily_usage,
        'daily_limit', v_daily_limit,
        'trial_usage', v_trial_usage,
        'trial_limit', v_trial_limit,
        'can_generate', v_can_generate,
        'is_trial', v_is_trial,
        'trial_ends_at', v_trial_ends_at,
        'subscription_tier', v_subscription_tier,
        'remaining_monthly', CASE 
            WHEN v_monthly_limit IS NOT NULL THEN v_monthly_limit - v_monthly_usage 
            ELSE NULL 
        END,
        'remaining_trial', CASE 
            WHEN v_trial_limit IS NOT NULL THEN v_trial_limit - v_trial_usage 
            ELSE NULL 
        END,
        'remaining_daily', CASE 
            WHEN v_subscription_tier = 'free' THEN LEAST(v_daily_limit - v_daily_usage, v_monthly_limit - v_monthly_usage)
            WHEN v_is_trial THEN LEAST(v_daily_limit - v_daily_usage, v_trial_limit - v_trial_usage)
            ELSE v_monthly_limit - v_monthly_usage
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Create a function to set configuration for current session
CREATE OR REPLACE FUNCTION set_subscription_config(
    p_config JSONB
) RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.subscription_config', p_config::text, false);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION set_subscription_config(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION set_subscription_config(JSONB) TO authenticated;