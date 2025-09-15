-- Fix subscription trial dates and ensure all operations use subscriptions_consolidated table
-- This migration ensures trial dates are properly stored when stripe_subscription_id is added

-- 1. The consolidated table already has these columns:
-- - trial_started_at: when trial started
-- - trial_ended_at: when trial actually ended (past tense)
-- - expires_at: for trial expiration dates AND cancelled subscription expiration

-- 2. Update any existing trial subscriptions to have proper dates
-- For active trials: expires_at holds when the trial will end
-- For ended trials: trial_ended_at holds when it actually ended
UPDATE public.subscriptions_consolidated
SET 
  trial_started_at = COALESCE(trial_started_at, created_at),
  expires_at = CASE 
    WHEN status = 'trialing' AND expires_at IS NULL 
    THEN created_at + INTERVAL '7 days'
    ELSE expires_at
  END
WHERE status = 'trialing';

-- 3. Create or replace the subscriptions view to ensure it exposes all necessary columns
DROP VIEW IF EXISTS public.subscriptions CASCADE;
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
  expires_at as trial_ends_at,  -- For backward compatibility
  expires_at,
  CASE 
    WHEN tier = 'pro' THEN 'pro'
    WHEN tier = 'pro_plus' THEN 'pro-plus'
    ELSE 'free'
  END as plan_id,
  trial_started_at as trial_start,
  trial_ended_at as trial_end,
  stripe_subscription_id,
  stripe_customer_id,
  trial_started_at
FROM public.subscriptions_consolidated;

-- 4. Create UPDATE trigger for subscriptions view
CREATE OR REPLACE FUNCTION handle_subscriptions_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.subscriptions_consolidated
  SET 
    tier = COALESCE(NEW.tier, tier),
    status = COALESCE(NEW.status, status),
    current_period_start = COALESCE(NEW.current_period_start, current_period_start),
    current_period_end = COALESCE(NEW.current_period_end, current_period_end),
    cancel_at_period_end = COALESCE(NEW.cancel_at_period_end, cancel_at_period_end),
    stripe_subscription_id = COALESCE(NEW.stripe_subscription_id, stripe_subscription_id),
    stripe_customer_id = COALESCE(NEW.stripe_customer_id, stripe_customer_id),
    trial_started_at = COALESCE(NEW.trial_start, NEW.trial_started_at, trial_started_at),
    trial_ended_at = COALESCE(NEW.trial_end, NEW.trial_ended_at, trial_ended_at),
    expires_at = COALESCE(NEW.trial_ends_at, NEW.expires_at, expires_at),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_instead_update ON public.subscriptions;
CREATE TRIGGER subscriptions_instead_update
  INSTEAD OF UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscriptions_update();

-- 5. Create INSERT trigger for subscriptions view
CREATE OR REPLACE FUNCTION handle_subscriptions_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions_consolidated (
    user_id,
    tier,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    creem_subscription_id,
    stripe_subscription_id,
    stripe_customer_id,
    trial_started_at,
    trial_ended_at,
    expires_at,
    daily_limit
  ) VALUES (
    NEW.user_id,
    NEW.tier,
    NEW.status,
    NEW.current_period_start,
    NEW.current_period_end,
    NEW.cancel_at_period_end,
    NEW.creem_subscription_id,
    NEW.stripe_subscription_id,
    NEW.stripe_customer_id,
    COALESCE(NEW.trial_start, NEW.trial_started_at),
    COALESCE(NEW.trial_end, NEW.trial_ended_at),
    COALESCE(NEW.trial_ends_at, NEW.expires_at),  -- trial_ends_at from view maps to expires_at in table
    CASE 
      WHEN NEW.tier = 'pro' THEN 100
      WHEN NEW.tier = 'pro_plus' THEN 500
      ELSE 10
    END
  ) RETURNING * INTO NEW;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_instead_insert ON public.subscriptions;
CREATE TRIGGER subscriptions_instead_insert
  INSTEAD OF INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscriptions_insert();

-- 6. Grant proper permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT INSERT, UPDATE ON public.subscriptions TO authenticated;

-- 7. Fix the specific user's subscription if needed
UPDATE public.subscriptions_consolidated
SET 
  trial_started_at = '2025-09-15'::timestamptz,
  expires_at = '2025-09-22'::timestamptz,  -- For active trials, expires_at holds when trial will end
  trial_ended_at = NULL,  -- Not ended yet
  status = 'trialing'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com'
) AND stripe_subscription_id IS NOT NULL;

-- 8. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_trial_dates 
ON public.subscriptions_consolidated(trial_started_at, expires_at) 
WHERE status = 'trialing';

-- 9. Add comment explaining the table structure
COMMENT ON TABLE public.subscriptions_consolidated IS 'Main subscription table that consolidates all subscription data. Views (subscriptions, user_subscriptions) provide backward compatibility.';
COMMENT ON COLUMN public.subscriptions_consolidated.trial_started_at IS 'When the trial period started';
COMMENT ON COLUMN public.subscriptions_consolidated.trial_ended_at IS 'When the trial actually ended (past tense - set when trial converts to paid or expires)';
COMMENT ON COLUMN public.subscriptions_consolidated.expires_at IS 'Expiration date - For trials: when trial will end. For cancelled subscriptions: when access will end';