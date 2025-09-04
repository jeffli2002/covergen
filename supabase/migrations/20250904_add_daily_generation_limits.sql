-- Add daily generation tracking for free tier users

-- Modify user_usage table to track daily generations
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS daily_generation_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_date DATE;

-- Create index for daily generation queries
CREATE INDEX IF NOT EXISTS idx_user_usage_daily ON user_usage(user_id, last_generation_date);

-- Function to increment daily usage and check limits
CREATE OR REPLACE FUNCTION increment_daily_generation(
    p_user_id UUID,
    p_subscription_tier VARCHAR(50)
) RETURNS JSONB AS $$
DECLARE
    v_daily_count INTEGER;
    v_month_key VARCHAR(7);
    v_current_date DATE;
    v_daily_limit INTEGER;
    v_is_trial BOOLEAN;
    v_trial_end_date TIMESTAMPTZ;
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
    
    -- Set daily limit based on subscription tier and trial status
    IF v_is_trial OR p_subscription_tier = 'free' THEN
        v_daily_limit := 3;
    ELSIF p_subscription_tier = 'pro' THEN
        v_daily_limit := 100; -- Effectively unlimited for Pro
    ELSIF p_subscription_tier = 'pro_plus' THEN
        v_daily_limit := 500; -- Effectively unlimited for Pro+
    ELSE
        v_daily_limit := 3; -- Default to free tier limit
    END IF;
    
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
        last_used_at = NOW()
    RETURNING daily_generation_count INTO v_daily_count;
    
    -- Return result with limit check
    RETURN jsonb_build_object(
        'daily_count', v_daily_count,
        'daily_limit', v_daily_limit,
        'can_generate', v_daily_count <= v_daily_limit,
        'is_trial', v_is_trial,
        'subscription_tier', p_subscription_tier
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get current daily usage
CREATE OR REPLACE FUNCTION get_daily_generation_count(
    p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_daily_count INTEGER;
    v_subscription_tier VARCHAR(50);
    v_daily_limit INTEGER;
    v_is_trial BOOLEAN;
    v_month_key VARCHAR(7);
    v_current_date DATE;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Get user's current usage
    SELECT 
        CASE 
            WHEN last_generation_date = v_current_date 
            THEN daily_generation_count
            ELSE 0
        END,
        subscription_tier
    INTO v_daily_count, v_subscription_tier
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = v_month_key;
    
    -- If no record exists, set defaults
    IF v_daily_count IS NULL THEN
        v_daily_count := 0;
        v_subscription_tier := 'free';
    END IF;
    
    -- Check if user is on trial
    SELECT 
        CASE 
            WHEN creem_trial_ends_at > NOW() THEN TRUE
            ELSE FALSE
        END INTO v_is_trial
    FROM auth.users
    WHERE id = p_user_id;
    
    -- Set daily limit based on subscription tier and trial status
    IF v_is_trial OR v_subscription_tier = 'free' THEN
        v_daily_limit := 3;
    ELSIF v_subscription_tier = 'pro' THEN
        v_daily_limit := 100;
    ELSIF v_subscription_tier = 'pro_plus' THEN
        v_daily_limit := 500;
    ELSE
        v_daily_limit := 3;
    END IF;
    
    RETURN jsonb_build_object(
        'daily_count', v_daily_count,
        'daily_limit', v_daily_limit,
        'can_generate', v_daily_count < v_daily_limit,
        'is_trial', v_is_trial,
        'subscription_tier', v_subscription_tier,
        'remaining', v_daily_limit - v_daily_count
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_daily_generation(UUID, VARCHAR(50)) TO service_role;
GRANT EXECUTE ON FUNCTION get_daily_generation_count(UUID) TO authenticated;