-- Consolidate subscription tables to avoid confusion (Version 2 - Safer approach)
-- This migration merges user_subscriptions and subscriptions tables into a single comprehensive table

-- First, create the new consolidated subscriptions table with ALL needed columns
CREATE TABLE IF NOT EXISTS public.subscriptions_consolidated (
  -- Core fields
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan and status
  tier VARCHAR(50) NOT NULL DEFAULT 'free', -- 'free', 'pro', 'pro_plus'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'canceled', 'expired', 'paused'
  daily_limit INTEGER NOT NULL DEFAULT 3, -- Daily generation limit based on tier (999 = unlimited)
  
  -- Trial tracking
  trial_started_at TIMESTAMPTZ,
  trial_ended_at TIMESTAMPTZ,
  trial_days INTEGER DEFAULT 3, -- Number of trial days given
  
  -- Paid subscription tracking
  paid_started_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- When subscription expires (for trials or canceled subs)
  
  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'yearly'
  
  -- Payment provider references
  creem_customer_id TEXT,
  creem_subscription_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Billing state
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  total_paid_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- History tracking
  previous_tier VARCHAR(50),
  pause_started_at TIMESTAMPTZ,
  pause_ended_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one subscription per user
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_user ON public.subscriptions_consolidated(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_status ON public.subscriptions_consolidated(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_tier ON public.subscriptions_consolidated(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_trial ON public.subscriptions_consolidated(trial_started_at, trial_ended_at) WHERE trial_started_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_consolidated_creem ON public.subscriptions_consolidated(creem_subscription_id) WHERE creem_subscription_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.subscriptions_consolidated ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions_consolidated
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions_consolidated
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Check if user_subscriptions table exists and has data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
    -- Migrate data from user_subscriptions table
    INSERT INTO public.subscriptions_consolidated (
      user_id,
      tier,
      status,
      daily_limit,
      expires_at,
      cancel_at_period_end,
      creem_customer_id,
      creem_subscription_id,
      current_period_start,
      current_period_end,
      metadata,
      created_at,
      updated_at,
      -- Set trial dates for trialing subscriptions
      trial_started_at,
      trial_ended_at
    )
    SELECT 
      user_id,
      plan_type as tier,
      status,
      COALESCE(daily_limit, 3), -- Default to 3 if null
      expires_at,
      COALESCE(cancel_at_period_end, false),
      creem_customer_id,
      creem_subscription_id,
      current_period_start,
      current_period_end,
      COALESCE(metadata, '{}'::jsonb),
      created_at,
      updated_at,
      -- For trialing status, assume trial started at creation
      CASE WHEN status = 'trialing' THEN created_at ELSE NULL END,
      CASE WHEN status = 'trialing' AND expires_at < NOW() THEN expires_at ELSE NULL END
    FROM public.user_subscriptions
    ON CONFLICT (user_id) DO UPDATE SET
      tier = EXCLUDED.tier,
      status = EXCLUDED.status,
      daily_limit = EXCLUDED.daily_limit,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW();
  END IF;
END $$;

-- Check if subscriptions table exists and has data
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
    -- Migrate data from subscriptions table
    INSERT INTO public.subscriptions_consolidated (
      user_id,
      tier,
      status,
      daily_limit,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      creem_subscription_id,
      created_at,
      updated_at,
      -- Set trial dates based on status
      trial_started_at,
      trial_ended_at,
      paid_started_at
    )
    SELECT 
      user_id,
      tier,
      status,
      -- Set daily limit based on tier and status
      CASE
        WHEN tier = 'free' THEN 3
        WHEN tier = 'pro' AND status = 'trialing' THEN 4
        WHEN tier = 'pro' AND status != 'trialing' THEN 999 -- Effectively unlimited
        WHEN tier = 'pro_plus' AND status = 'trialing' THEN 6
        WHEN tier = 'pro_plus' AND status != 'trialing' THEN 999 -- Effectively unlimited
        ELSE 3
      END as daily_limit,
      current_period_start,
      current_period_end,
      COALESCE(cancel_at_period_end, false),
      creem_subscription_id,
      created_at,
      updated_at,
      -- For trialing status, use period start as trial start
      CASE WHEN status = 'trialing' THEN current_period_start ELSE NULL END,
      CASE WHEN status = 'trialing' AND current_period_end < NOW() THEN current_period_end ELSE NULL END,
      CASE WHEN status = 'active' AND tier != 'free' THEN current_period_start ELSE NULL END
    FROM public.subscriptions
    ON CONFLICT (user_id) DO UPDATE SET
      -- Only update if the record in subscriptions table is newer
      tier = CASE 
        WHEN public.subscriptions_consolidated.updated_at < EXCLUDED.updated_at 
        THEN EXCLUDED.tier 
        ELSE public.subscriptions_consolidated.tier 
      END,
      status = CASE 
        WHEN public.subscriptions_consolidated.updated_at < EXCLUDED.updated_at 
        THEN EXCLUDED.status 
        ELSE public.subscriptions_consolidated.status 
      END,
      daily_limit = CASE 
        WHEN public.subscriptions_consolidated.updated_at < EXCLUDED.updated_at 
        THEN EXCLUDED.daily_limit 
        ELSE public.subscriptions_consolidated.daily_limit 
      END,
      current_period_start = COALESCE(EXCLUDED.current_period_start, public.subscriptions_consolidated.current_period_start),
      current_period_end = COALESCE(EXCLUDED.current_period_end, public.subscriptions_consolidated.current_period_end),
      updated_at = NOW();
  END IF;
END $$;

-- Set correct daily limits based on tier
UPDATE public.subscriptions_consolidated
SET daily_limit = CASE
  WHEN tier = 'free' THEN 3
  WHEN tier = 'pro' AND status = 'trialing' THEN 4
  WHEN tier = 'pro' AND status != 'trialing' THEN 999 -- Unlimited daily for paid pro
  WHEN tier = 'pro_plus' AND status = 'trialing' THEN 6
  WHEN tier = 'pro_plus' AND status != 'trialing' THEN 999 -- Unlimited daily for paid pro_plus
  ELSE 3
END;

-- Create updated check_generation_limit function that uses the consolidated table
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
    
    -- Get current usage
    SELECT 
        COALESCE(usage_count, 0),
        COALESCE(daily_generation_count, 0),
        COALESCE(trial_usage_count, 0),
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
    
    -- Reset daily usage if new day
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
        'user_id', p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_generation_limit TO authenticated;
GRANT EXECUTE ON FUNCTION check_generation_limit TO anon;
GRANT ALL ON public.subscriptions_consolidated TO service_role;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default free subscription for new users
  INSERT INTO public.subscriptions_consolidated (user_id, tier, status, daily_limit)
  VALUES (NEW.id, 'free', 'active', 3)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER handle_subscriptions_consolidated_updated_at
  BEFORE UPDATE ON public.subscriptions_consolidated
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Rename old tables to backup (safer than dropping)
DO $$
BEGIN
  -- Backup user_subscriptions table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.user_subscriptions RENAME TO user_subscriptions_old_backup';
  END IF;
  
  -- Backup subscriptions table if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
    EXECUTE 'ALTER TABLE public.subscriptions RENAME TO subscriptions_old_backup';
  END IF;
END $$;

-- Now create views for backward compatibility
CREATE OR REPLACE VIEW public.user_subscriptions AS
SELECT 
  id,
  user_id,
  tier as plan_type,
  status,
  daily_limit,
  created_at,
  updated_at,
  expires_at,
  cancel_at_period_end,
  creem_customer_id,
  current_period_start,
  current_period_end,
  metadata,
  creem_subscription_id
FROM public.subscriptions_consolidated;

CREATE OR REPLACE VIEW public.subscriptions AS
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
  updated_at
FROM public.subscriptions_consolidated;

-- Grant permissions on views
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

-- Create INSTEAD OF triggers for the views to handle inserts/updates
CREATE OR REPLACE FUNCTION handle_user_subscriptions_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions_consolidated (
    user_id,
    tier,
    status,
    daily_limit,
    expires_at,
    cancel_at_period_end,
    creem_customer_id,
    creem_subscription_id,
    current_period_start,
    current_period_end,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.plan_type,
    NEW.status,
    NEW.daily_limit,
    NEW.expires_at,
    NEW.cancel_at_period_end,
    NEW.creem_customer_id,
    NEW.creem_subscription_id,
    NEW.current_period_start,
    NEW.current_period_end,
    NEW.metadata
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    status = EXCLUDED.status,
    daily_limit = EXCLUDED.daily_limit,
    expires_at = EXCLUDED.expires_at,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    creem_customer_id = EXCLUDED.creem_customer_id,
    creem_subscription_id = EXCLUDED.creem_subscription_id,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscriptions_instead_insert
  INSTEAD OF INSERT ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_subscriptions_insert();

-- Optional: After verifying everything works, you can drop the backup tables
-- DROP TABLE IF EXISTS public.user_subscriptions_old_backup CASCADE;
-- DROP TABLE IF EXISTS public.subscriptions_old_backup CASCADE;