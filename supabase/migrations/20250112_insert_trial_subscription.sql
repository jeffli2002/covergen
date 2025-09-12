-- This migration helps create a trial subscription for users who signed up for trials
-- but don't have a record in the subscriptions table

-- First, let's create a function to create trial subscriptions
CREATE OR REPLACE FUNCTION create_trial_subscription(
    p_user_id UUID,
    p_tier VARCHAR(50) DEFAULT 'pro',
    p_trial_days INTEGER DEFAULT 3
) RETURNS void AS $$
DECLARE
    v_existing_subscription UUID;
    v_trial_end TIMESTAMPTZ;
BEGIN
    -- Check if subscription already exists
    SELECT id INTO v_existing_subscription
    FROM subscriptions
    WHERE user_id = p_user_id;
    
    IF v_existing_subscription IS NOT NULL THEN
        RAISE NOTICE 'Subscription already exists for user %', p_user_id;
        RETURN;
    END IF;
    
    -- Calculate trial end date
    v_trial_end := NOW() + INTERVAL '1 day' * p_trial_days;
    
    -- Insert trial subscription
    INSERT INTO subscriptions (
        user_id,
        tier,
        status,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_tier,
        'trialing',
        NOW(),
        v_trial_end,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Created trial subscription for user % with tier % ending at %', p_user_id, p_tier, v_trial_end;
END;
$$ LANGUAGE plpgsql;

-- To use this function for your user, run:
-- SELECT create_trial_subscription('YOUR_USER_ID'::uuid, 'pro', 3);
-- Replace YOUR_USER_ID with your actual user ID from auth.users

-- You can find your user ID by running:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';