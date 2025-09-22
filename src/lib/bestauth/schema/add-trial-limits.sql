-- Add trial-specific limit fields to BestAuth subscriptions table
-- This migration adds explicit trial limit fields for better clarity and tracking

BEGIN;

-- Add trial-specific limit columns if they don't exist
ALTER TABLE bestauth_subscriptions
ADD COLUMN IF NOT EXISTS trial_daily_limit INTEGER,
ADD COLUMN IF NOT EXISTS trial_total_limit INTEGER;

-- Add comment to explain the fields
COMMENT ON COLUMN bestauth_subscriptions.trial_daily_limit IS 'Daily generation limit during trial period (from config)';
COMMENT ON COLUMN bestauth_subscriptions.trial_total_limit IS 'Total generation limit for entire trial period (from config)';

-- Update existing trial subscriptions to have proper limits based on tier
-- This uses the same values from the configuration
UPDATE bestauth_subscriptions
SET 
  trial_daily_limit = CASE
    WHEN tier = 'pro' THEN 4  -- PRO_TRIAL_DAILY_LIMIT
    WHEN tier = 'pro_plus' THEN 6  -- PRO_PLUS_TRIAL_DAILY_LIMIT
    ELSE NULL
  END,
  trial_total_limit = CASE
    WHEN tier = 'pro' THEN 12  -- 3 days * 4/day
    WHEN tier = 'pro_plus' THEN 18  -- 3 days * 6/day
    ELSE NULL
  END
WHERE status = 'trialing' AND trial_daily_limit IS NULL;

-- Create or update function to get subscription status with trial limits
CREATE OR REPLACE FUNCTION bestauth.get_subscription_status(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  tier bestauth.subscription_tier,
  status bestauth.subscription_status,
  is_trialing BOOLEAN,
  trial_days_remaining INTEGER,
  can_generate BOOLEAN,
  usage_today INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  has_payment_method BOOLEAN,
  requires_payment_setup BOOLEAN,
  next_billing_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_payment_method_id TEXT,
  cancel_at_period_end BOOLEAN,
  trial_ends_at TIMESTAMPTZ,
  trial_daily_limit INTEGER,
  trial_total_limit INTEGER
) AS $$
DECLARE
  v_subscription RECORD;
  v_usage_today INTEGER;
  v_is_trialing BOOLEAN;
  v_trial_days_remaining INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_can_generate BOOLEAN;
  v_has_payment_method BOOLEAN;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription
  FROM bestauth_subscriptions
  WHERE bestauth_subscriptions.user_id = p_user_id;
  
  -- If no subscription, create a free one
  IF NOT FOUND THEN
    INSERT INTO bestauth_subscriptions (user_id, tier, status)
    VALUES (p_user_id, 'free', 'active')
    RETURNING * INTO v_subscription;
  END IF;
  
  -- Get today's usage
  v_usage_today := bestauth.get_user_usage_today(p_user_id);
  
  -- Determine if in trial
  v_is_trialing := v_subscription.status = 'trialing' AND 
                   v_subscription.trial_ends_at > NOW();
  
  -- Calculate trial days remaining
  IF v_is_trialing THEN
    v_trial_days_remaining := GREATEST(0, 
      EXTRACT(DAY FROM (v_subscription.trial_ends_at - NOW()))::INTEGER
    );
  ELSE
    v_trial_days_remaining := 0;
  END IF;
  
  -- Determine limits based on trial status
  IF v_is_trialing THEN
    -- Use trial limits from the subscription record
    v_daily_limit := COALESCE(v_subscription.trial_daily_limit, 
      CASE 
        WHEN v_subscription.tier = 'pro' THEN 4
        WHEN v_subscription.tier = 'pro_plus' THEN 6
        ELSE 3
      END
    );
    v_monthly_limit := COALESCE(v_subscription.trial_total_limit,
      CASE 
        WHEN v_subscription.tier = 'pro' THEN 12
        WHEN v_subscription.tier = 'pro_plus' THEN 18
        ELSE 90
      END
    );
  ELSE
    -- Regular limits based on tier
    v_daily_limit := COALESCE(v_subscription.daily_generation_limit,
      CASE 
        WHEN v_subscription.tier = 'free' THEN 3
        WHEN v_subscription.tier = 'pro' THEN 100
        WHEN v_subscription.tier = 'pro_plus' THEN 300
      END
    );
    v_monthly_limit := COALESCE(v_subscription.monthly_generation_limit,
      CASE 
        WHEN v_subscription.tier = 'free' THEN 90
        WHEN v_subscription.tier = 'pro' THEN 3000
        WHEN v_subscription.tier = 'pro_plus' THEN 9000
      END
    );
  END IF;
  
  -- Check payment method
  v_has_payment_method := v_subscription.stripe_payment_method_id IS NOT NULL;
  
  -- Determine if can generate
  v_can_generate := v_subscription.status IN ('active', 'trialing') AND 
                    v_usage_today < v_daily_limit;
  
  RETURN QUERY
  SELECT
    v_subscription.id,
    v_subscription.user_id,
    v_subscription.tier,
    v_subscription.status,
    v_is_trialing,
    v_trial_days_remaining,
    v_can_generate,
    v_usage_today,
    v_daily_limit,
    v_monthly_limit,
    v_has_payment_method,
    (v_subscription.tier != 'free' AND NOT v_has_payment_method) AS requires_payment_setup,
    CASE 
      WHEN v_subscription.status = 'trialing' THEN v_subscription.trial_ends_at
      ELSE v_subscription.current_period_end
    END AS next_billing_date,
    v_subscription.stripe_customer_id,
    v_subscription.stripe_subscription_id,
    v_subscription.stripe_payment_method_id,
    v_subscription.cancel_at_period_end,
    v_subscription.trial_ends_at,
    v_subscription.trial_daily_limit,
    v_subscription.trial_total_limit;
END;
$$ LANGUAGE plpgsql;

-- Create helper function to set trial limits when starting a trial
CREATE OR REPLACE FUNCTION bestauth.set_trial_limits(
  p_user_id UUID,
  p_tier bestauth.subscription_tier,
  p_trial_days INTEGER,
  p_daily_limit INTEGER,
  p_total_limit INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE bestauth_subscriptions
  SET 
    trial_daily_limit = p_daily_limit,
    trial_total_limit = p_total_limit,
    trial_ends_at = NOW() + INTERVAL '1 day' * p_trial_days,
    trial_started_at = NOW(),
    status = 'trialing'
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- Example usage:
-- SELECT * FROM bestauth.get_subscription_status('user-uuid-here');
-- SELECT bestauth.set_trial_limits('user-uuid', 'pro', 3, 4, 12);