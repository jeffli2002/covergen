-- Fix the generation limits to use monthly quotas instead of daily limits

-- Drop the incorrect daily generation function
DROP FUNCTION IF EXISTS increment_daily_generation(UUID, VARCHAR(50));
DROP FUNCTION IF EXISTS get_daily_generation_count(UUID);

-- Update the existing user usage tracking to work with monthly quotas and daily trial limits
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
    v_is_trial BOOLEAN;
    v_can_generate BOOLEAN;
    v_last_generation_date DATE;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Check if user is on trial
    SELECT 
        CASE 
            WHEN creem_trial_ends_at > NOW() THEN TRUE
            ELSE FALSE
        END INTO v_is_trial
    FROM auth.users
    WHERE id = p_user_id;
    
    -- Set monthly and daily limits based on subscription tier and trial status
    IF v_is_trial OR p_subscription_tier = 'free' THEN
        -- Trial users: 3 per day, 10 per month maximum
        v_monthly_limit := 10;
        v_daily_limit := 3;
    ELSIF p_subscription_tier = 'pro' THEN
        -- Pro users: 120 per month, daily = remaining monthly balance
        v_monthly_limit := 120;
        v_daily_limit := NULL; -- Will be calculated from remaining monthly balance
    ELSIF p_subscription_tier = 'pro_plus' THEN
        -- Pro+ users: 300 per month, daily = remaining monthly balance
        v_monthly_limit := 300;
        v_daily_limit := NULL; -- Will be calculated from remaining monthly balance
    ELSE
        -- Default to trial limits
        v_monthly_limit := 10;
        v_daily_limit := 3;
    END IF;
    
    -- Get current usage
    SELECT 
        COALESCE(usage_count, 0),
        COALESCE(daily_generation_count, 0),
        last_generation_date
    INTO v_monthly_usage, v_daily_usage, v_last_generation_date
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = v_month_key;
    
    -- If no record exists, set defaults
    IF v_monthly_usage IS NULL THEN
        v_monthly_usage := 0;
        v_daily_usage := 0;
        v_last_generation_date := NULL;
    END IF;
    
    -- Reset daily usage if it's a new day
    IF v_last_generation_date != v_current_date THEN
        v_daily_usage := 0;
    END IF;
    
    -- Determine if user can generate
    IF v_is_trial OR p_subscription_tier = 'free' THEN
        -- For trial users, check both daily limit AND monthly limit
        v_can_generate := (v_daily_usage < v_daily_limit) AND (v_monthly_usage < v_monthly_limit);
    ELSE
        -- For paid users, check monthly limit (daily is remaining monthly balance)
        v_can_generate := v_monthly_usage < v_monthly_limit;
        -- Daily limit for paid users is their remaining monthly balance
        v_daily_limit := GREATEST(0, v_monthly_limit - v_monthly_usage);
    END IF;
    
    RETURN jsonb_build_object(
        'monthly_usage', v_monthly_usage,
        'monthly_limit', v_monthly_limit,
        'daily_usage', v_daily_usage,
        'daily_limit', v_daily_limit,
        'can_generate', v_can_generate,
        'is_trial', v_is_trial,
        'subscription_tier', p_subscription_tier,
        'remaining_monthly', CASE 
            WHEN v_monthly_limit IS NOT NULL THEN v_monthly_limit - v_monthly_usage 
            ELSE NULL 
        END,
        'remaining_daily', CASE 
            WHEN v_is_trial OR p_subscription_tier = 'free' THEN LEAST(v_daily_limit - v_daily_usage, v_monthly_limit - v_monthly_usage)
            ELSE v_monthly_limit - v_monthly_usage
        END
    );
END;
$$ LANGUAGE plpgsql;

-- Function to increment generation count with proper monthly/daily tracking
CREATE OR REPLACE FUNCTION increment_generation_count(
    p_user_id UUID,
    p_subscription_tier VARCHAR(50)
) RETURNS JSONB AS $$
DECLARE
    v_current_date DATE;
    v_month_key VARCHAR(7);
    v_is_trial BOOLEAN;
    v_result JSONB;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Check if user is on trial
    SELECT 
        CASE 
            WHEN creem_trial_ends_at > NOW() THEN TRUE
            ELSE FALSE
        END INTO v_is_trial
    FROM auth.users
    WHERE id = p_user_id;
    
    -- Insert or update user usage
    INSERT INTO user_usage (
        user_id, 
        month_key, 
        usage_count, 
        daily_generation_count,
        last_generation_date,
        subscription_tier, 
        last_used_at
    )
    VALUES (
        p_user_id, 
        v_month_key, 
        1, 
        1,
        v_current_date,
        p_subscription_tier, 
        NOW()
    )
    ON CONFLICT (user_id, month_key)
    DO UPDATE SET 
        usage_count = user_usage.usage_count + 1,
        daily_generation_count = CASE 
            WHEN user_usage.last_generation_date = v_current_date 
            THEN user_usage.daily_generation_count + 1
            ELSE 1
        END,
        last_generation_date = v_current_date,
        subscription_tier = p_subscription_tier,
        last_used_at = NOW();
    
    -- Return updated status
    SELECT check_generation_limit(p_user_id, p_subscription_tier) INTO v_result;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_generation_limit(UUID, VARCHAR(50)) TO service_role;
GRANT EXECUTE ON FUNCTION check_generation_limit(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_generation_count(UUID, VARCHAR(50)) TO service_role;