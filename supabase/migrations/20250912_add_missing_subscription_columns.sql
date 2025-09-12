-- Add missing columns for comprehensive subscription tracking
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pause_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pause_ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS previous_plan_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_paid_amount DECIMAL(10, 2) DEFAULT 0;

-- Add index for trial tracking
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_trial_dates 
ON public.user_subscriptions(trial_started_at, trial_ended_at) 
WHERE trial_started_at IS NOT NULL;

-- Add index for canceled subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_canceled 
ON public.user_subscriptions(canceled_at) 
WHERE canceled_at IS NOT NULL;

-- Create function to handle trial start
CREATE OR REPLACE FUNCTION public.handle_trial_start()
RETURNS TRIGGER AS $$
BEGIN
  -- When status changes to 'trialing', set trial_started_at
  IF NEW.status = 'trialing' AND OLD.status != 'trialing' THEN
    NEW.trial_started_at = NOW();
  END IF;
  
  -- When expires_at is set for the first time (trial creation)
  IF NEW.expires_at IS NOT NULL AND OLD.expires_at IS NULL AND NEW.status = 'trialing' THEN
    NEW.trial_started_at = COALESCE(NEW.trial_started_at, NOW());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trial start
DROP TRIGGER IF EXISTS track_trial_start ON public.user_subscriptions;
CREATE TRIGGER track_trial_start
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_trial_start();

-- Create function to handle subscription state changes
CREATE OR REPLACE FUNCTION public.handle_subscription_state_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Track trial end
  IF OLD.status = 'trialing' AND NEW.status != 'trialing' THEN
    NEW.trial_ended_at = NOW();
    
    -- If converting to paid, set paid_started_at
    IF NEW.status = 'active' AND NEW.plan_type IN ('pro', 'pro_plus') THEN
      NEW.paid_started_at = NOW();
    END IF;
  END IF;
  
  -- Track cancellation
  IF NEW.cancel_at_period_end = true AND OLD.cancel_at_period_end = false THEN
    NEW.canceled_at = NOW();
  END IF;
  
  -- Track plan changes
  IF NEW.plan_type != OLD.plan_type THEN
    NEW.previous_plan_type = OLD.plan_type;
  END IF;
  
  -- Track pause/resume
  IF NEW.status = 'paused' AND OLD.status != 'paused' THEN
    NEW.pause_started_at = NOW();
  ELSIF OLD.status = 'paused' AND NEW.status != 'paused' THEN
    NEW.pause_ended_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for state changes
DROP TRIGGER IF EXISTS track_subscription_state_changes ON public.user_subscriptions;
CREATE TRIGGER track_subscription_state_changes
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_state_change();

-- Update existing trialing subscriptions to set trial_started_at
UPDATE public.user_subscriptions
SET trial_started_at = created_at
WHERE status = 'trialing' AND trial_started_at IS NULL;

-- Create view for subscription analytics
CREATE OR REPLACE VIEW public.subscription_analytics AS
SELECT 
  us.user_id,
  us.plan_type,
  us.status,
  us.created_at as subscription_created,
  us.trial_started_at,
  us.trial_ended_at,
  us.paid_started_at,
  us.canceled_at,
  us.expires_at,
  CASE 
    WHEN us.status = 'trialing' THEN us.expires_at - NOW()
    ELSE NULL
  END as trial_time_remaining,
  CASE
    WHEN us.trial_started_at IS NOT NULL AND us.trial_ended_at IS NOT NULL 
    THEN us.trial_ended_at - us.trial_started_at
    ELSE NULL
  END as trial_duration,
  CASE
    WHEN us.paid_started_at IS NOT NULL 
    THEN NOW() - us.paid_started_at
    ELSE NULL
  END as paid_subscription_age,
  us.total_paid_amount,
  us.billing_cycle,
  us.next_billing_date,
  au.email as user_email
FROM public.user_subscriptions us
JOIN auth.users au ON us.user_id = au.id;

-- Grant permissions
GRANT SELECT ON public.subscription_analytics TO authenticated;

-- Add RLS policy for the view
ALTER VIEW public.subscription_analytics OWNER TO postgres;

-- Function to properly handle trial creation
CREATE OR REPLACE FUNCTION public.create_trial_subscription(
  p_user_id UUID,
  p_plan_type VARCHAR,
  p_trial_days INTEGER DEFAULT 3
)
RETURNS public.user_subscriptions AS $$
DECLARE
  v_subscription public.user_subscriptions;
  v_trial_ends_at TIMESTAMPTZ;
  v_daily_limit INTEGER;
BEGIN
  -- Calculate trial end date
  v_trial_ends_at := NOW() + (p_trial_days || ' days')::INTERVAL;
  
  -- Set daily limit based on plan
  v_daily_limit := CASE p_plan_type
    WHEN 'pro' THEN 4
    WHEN 'pro_plus' THEN 6
    ELSE 3
  END;
  
  -- Update or insert subscription
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    status,
    daily_limit,
    expires_at,
    trial_started_at
  ) VALUES (
    p_user_id,
    p_plan_type,
    'trialing',
    v_daily_limit,
    v_trial_ends_at,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    daily_limit = EXCLUDED.daily_limit,
    expires_at = EXCLUDED.expires_at,
    trial_started_at = COALESCE(user_subscriptions.trial_started_at, EXCLUDED.trial_started_at),
    previous_plan_type = user_subscriptions.plan_type,
    updated_at = NOW()
  RETURNING * INTO v_subscription;
  
  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_trial_subscription TO service_role;
GRANT EXECUTE ON FUNCTION public.create_trial_subscription TO authenticated;