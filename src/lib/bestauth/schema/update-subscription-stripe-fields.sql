-- Update BestAuth subscription function to include Stripe customer ID
-- This extends the get_subscription_status function to return all Stripe-related fields

-- Drop the existing function to recreate with new signature
DROP FUNCTION IF EXISTS bestauth.get_subscription_status(UUID);

-- Function to get subscription with computed fields including Stripe IDs
CREATE OR REPLACE FUNCTION bestauth.get_subscription_status(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  user_id UUID,
  tier TEXT,
  status TEXT,
  is_trialing BOOLEAN,
  trial_days_remaining INTEGER,
  can_generate BOOLEAN,
  usage_today INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  has_payment_method BOOLEAN,
  requires_payment_setup BOOLEAN,
  next_billing_date TIMESTAMPTZ,
  -- Add Stripe fields
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_payment_method_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  cancelled_at TIMESTAMPTZ
) AS $$
DECLARE
  v_subscription bestauth_subscriptions%ROWTYPE;
  v_usage_today INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_is_trialing BOOLEAN;
  v_trial_days_remaining INTEGER;
  v_has_payment_method BOOLEAN;
BEGIN
  -- Get subscription
  SELECT * INTO v_subscription
  FROM bestauth_subscriptions
  WHERE bestauth_subscriptions.user_id = p_user_id;
  
  -- If no subscription, create default
  IF NOT FOUND THEN
    INSERT INTO bestauth_subscriptions (user_id, tier, status)
    VALUES (p_user_id, 'free', 'active')
    RETURNING * INTO v_subscription;
  END IF;
  
  -- Calculate values
  v_usage_today := bestauth.get_user_usage_today(p_user_id);
  v_is_trialing := v_subscription.status = 'trialing';
  v_has_payment_method := v_subscription.stripe_payment_method_id IS NOT NULL;
  
  -- Calculate trial days remaining
  IF v_is_trialing AND v_subscription.trial_ends_at IS NOT NULL THEN
    v_trial_days_remaining := GREATEST(0, 
      EXTRACT(DAY FROM v_subscription.trial_ends_at - CURRENT_TIMESTAMP)::INTEGER
    );
  ELSE
    v_trial_days_remaining := 0;
  END IF;
  
  -- Determine limits based on subscription configuration
  -- These should match the values in subscription-config.ts
  IF v_is_trialing THEN
    CASE v_subscription.tier
      WHEN 'pro' THEN 
        v_daily_limit := 10;  -- Pro trial daily
        v_monthly_limit := 70;  -- Pro trial total (7 days * 10)
      WHEN 'pro_plus' THEN 
        v_daily_limit := 20;  -- Pro+ trial daily
        v_monthly_limit := 140;  -- Pro+ trial total (7 days * 20)
      ELSE 
        v_daily_limit := 3;  -- Free daily
        v_monthly_limit := 90;  -- Free monthly
    END CASE;
  ELSE
    CASE v_subscription.tier
      WHEN 'pro' THEN 
        v_daily_limit := 300;  -- Pro monthly / 30 days
        v_monthly_limit := 300;  -- Pro monthly
      WHEN 'pro_plus' THEN 
        v_daily_limit := 600;  -- Pro+ monthly / 30 days
        v_monthly_limit := 600;  -- Pro+ monthly
      ELSE 
        v_daily_limit := 3;  -- Free daily
        v_monthly_limit := 90;  -- Free monthly
    END CASE;
  END IF;
  
  RETURN QUERY SELECT
    v_subscription.id,
    v_subscription.user_id,
    v_subscription.tier::TEXT,
    v_subscription.status::TEXT,
    v_is_trialing,
    v_trial_days_remaining,
    v_usage_today < v_daily_limit,
    v_usage_today,
    v_daily_limit,
    v_monthly_limit,
    v_has_payment_method,
    v_is_trialing AND NOT v_has_payment_method,
    v_subscription.current_period_end,
    -- Return Stripe fields
    v_subscription.stripe_customer_id,
    v_subscription.stripe_subscription_id,
    v_subscription.stripe_price_id,
    v_subscription.stripe_payment_method_id,
    v_subscription.trial_ends_at,
    v_subscription.cancel_at_period_end,
    v_subscription.cancelled_at;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bestauth.get_subscription_status TO authenticated;