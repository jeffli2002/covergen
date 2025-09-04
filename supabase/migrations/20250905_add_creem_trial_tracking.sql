-- Add Creem trial tracking to auth.users table
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS creem_trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS creem_subscription_tier VARCHAR(50),
ADD COLUMN IF NOT EXISTS creem_trial_started_at TIMESTAMPTZ;

-- Add trial usage tracking to user_usage table
ALTER TABLE user_usage
ADD COLUMN IF NOT EXISTS trial_usage_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_trial_period BOOLEAN DEFAULT FALSE;

-- Create function to check and track generation limits with Creem trial support
CREATE OR REPLACE FUNCTION check_generation_limit_v2(
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
    
    -- Set limits based on subscription tier and trial status
    IF v_subscription_tier = 'free' OR v_subscription_tier IS NULL THEN
        -- Free users: 10/month, 3/day
        v_monthly_limit := 10;
        v_daily_limit := 3;
        v_trial_limit := NULL;
    ELSIF v_is_trial THEN
        -- Trial users get prorated limits
        IF v_subscription_tier = 'pro' THEN
            v_trial_limit := 28;  -- 7 days of 120/month
            v_daily_limit := 4;   -- 120/30
            v_monthly_limit := NULL; -- No monthly limit during trial
        ELSIF v_subscription_tier = 'pro_plus' THEN
            v_trial_limit := 70;  -- 7 days of 300/month
            v_daily_limit := 10;  -- 300/30
            v_monthly_limit := NULL; -- No monthly limit during trial
        END IF;
    ELSE
        -- Paid users get full monthly quotas
        IF v_subscription_tier = 'pro' THEN
            v_monthly_limit := 120;
            v_daily_limit := NULL; -- Daily = remaining monthly
        ELSIF v_subscription_tier = 'pro_plus' THEN
            v_monthly_limit := 300;
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

-- Function to increment generation count with trial support
CREATE OR REPLACE FUNCTION increment_generation_count_v2(
    p_user_id UUID,
    p_subscription_tier VARCHAR(50)
) RETURNS JSONB AS $$
DECLARE
    v_current_date DATE;
    v_month_key VARCHAR(7);
    v_is_trial BOOLEAN;
    v_result JSONB;
    v_trial_ends_at TIMESTAMPTZ;
BEGIN
    -- Get current date and month key
    v_current_date := CURRENT_DATE;
    v_month_key := TO_CHAR(v_current_date, 'YYYY-MM');
    
    -- Check if user is on trial
    SELECT creem_trial_ends_at INTO v_trial_ends_at
    FROM auth.users
    WHERE id = p_user_id;
    
    v_is_trial := v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW();
    
    -- Insert or update user usage
    INSERT INTO user_usage (
        user_id, 
        month_key, 
        usage_count,
        trial_usage_count,
        daily_generation_count,
        last_generation_date,
        subscription_tier,
        is_trial_period,
        last_used_at
    )
    VALUES (
        p_user_id, 
        v_month_key, 
        CASE WHEN v_is_trial THEN 0 ELSE 1 END,  -- Don't count against monthly during trial
        CASE WHEN v_is_trial THEN 1 ELSE 0 END,  -- Count trial usage separately
        1,
        v_current_date,
        p_subscription_tier,
        v_is_trial,
        NOW()
    )
    ON CONFLICT (user_id, month_key)
    DO UPDATE SET 
        usage_count = CASE 
            WHEN v_is_trial THEN user_usage.usage_count  -- Don't increment monthly during trial
            ELSE user_usage.usage_count + 1
        END,
        trial_usage_count = CASE 
            WHEN v_is_trial THEN user_usage.trial_usage_count + 1
            ELSE user_usage.trial_usage_count
        END,
        daily_generation_count = CASE 
            WHEN user_usage.last_generation_date = v_current_date 
            THEN user_usage.daily_generation_count + 1
            ELSE 1
        END,
        last_generation_date = v_current_date,
        subscription_tier = p_subscription_tier,
        is_trial_period = v_is_trial,
        last_used_at = NOW();
    
    -- Return updated status
    SELECT check_generation_limit_v2(p_user_id, p_subscription_tier) INTO v_result;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Drop old functions
DROP FUNCTION IF EXISTS check_generation_limit(UUID, VARCHAR(50));
DROP FUNCTION IF EXISTS increment_generation_count(UUID, VARCHAR(50));

-- Rename new functions
ALTER FUNCTION check_generation_limit_v2(UUID, VARCHAR(50)) RENAME TO check_generation_limit;
ALTER FUNCTION increment_generation_count_v2(UUID, VARCHAR(50)) RENAME TO increment_generation_count;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_generation_limit(UUID, VARCHAR(50)) TO service_role;
GRANT EXECUTE ON FUNCTION check_generation_limit(UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_generation_count(UUID, VARCHAR(50)) TO service_role;

-- Create index for faster trial queries
CREATE INDEX IF NOT EXISTS idx_users_creem_trial ON auth.users(creem_trial_ends_at) WHERE creem_trial_ends_at IS NOT NULL;

-- Create RPC function to update user trial status (only accessible by service role)
CREATE OR REPLACE FUNCTION update_user_trial_status(
    p_user_id UUID,
    p_trial_ends_at TIMESTAMPTZ,
    p_subscription_tier VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    UPDATE auth.users 
    SET 
        creem_trial_ends_at = p_trial_ends_at,
        creem_subscription_tier = p_subscription_tier,
        creem_trial_started_at = CASE 
            WHEN p_trial_ends_at IS NOT NULL THEN NOW()
            ELSE creem_trial_started_at
        END,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute only to service role
REVOKE EXECUTE ON FUNCTION update_user_trial_status(UUID, TIMESTAMPTZ, VARCHAR(50)) FROM public, authenticated, anon;
GRANT EXECUTE ON FUNCTION update_user_trial_status(UUID, TIMESTAMPTZ, VARCHAR(50)) TO service_role;