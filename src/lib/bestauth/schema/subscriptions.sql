-- BestAuth Subscription Schema
-- This file contains all the subscription-related tables and functions for BestAuth

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS bestauth;

-- Drop existing types if they exist (for clean migration)
DROP TYPE IF EXISTS bestauth.subscription_tier CASCADE;
DROP TYPE IF EXISTS bestauth.subscription_status CASCADE;

-- Create subscription enums
CREATE TYPE bestauth.subscription_tier AS ENUM ('free', 'pro', 'pro_plus');
CREATE TYPE bestauth.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending', 'trialing', 'paused');

-- Subscriptions table (main subscription data)
CREATE TABLE IF NOT EXISTS bestauth_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  
  -- Subscription details
  tier bestauth.subscription_tier NOT NULL DEFAULT 'free',
  status bestauth.subscription_status NOT NULL DEFAULT 'active',
  
  -- Stripe/Creem integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_payment_method_id TEXT,
  
  -- Trial information (matching subscriptions_consolidated columns)
  trial_started_at TIMESTAMPTZ,
  trial_ended_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Billing periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  -- Usage limits
  monthly_generation_limit INTEGER,
  daily_generation_limit INTEGER,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  -- Ensure one subscription per user
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_user_id ON bestauth_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_status ON bestauth_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_stripe_customer_id ON bestauth_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_stripe_subscription_id ON bestauth_subscriptions(stripe_subscription_id);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS bestauth_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  -- Ensure one record per user per day
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_user_id_date ON bestauth_usage_tracking(user_id, date);

-- User profiles (additional user data)
CREATE TABLE IF NOT EXISTS bestauth_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT unique_user_profile UNIQUE(user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_bestauth_user_profiles_user_id ON bestauth_user_profiles(user_id);

-- Payment history
CREATE TABLE IF NOT EXISTS bestauth_payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bestauth_payment_history_user_id ON bestauth_payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_payment_history_stripe_invoice_id ON bestauth_payment_history(stripe_invoice_id);

-- Function to get user's current usage
CREATE OR REPLACE FUNCTION bestauth.get_user_usage_today(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(generation_count, 0)
  INTO v_count
  FROM bestauth_usage_tracking
  WHERE user_id = p_user_id
  AND date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage
CREATE OR REPLACE FUNCTION bestauth.increment_usage(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  INSERT INTO bestauth_usage_tracking (user_id, date, generation_count)
  VALUES (p_user_id, CURRENT_DATE, p_amount)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    generation_count = bestauth_usage_tracking.generation_count + p_amount,
    updated_at = timezone('utc'::text, now())
  RETURNING generation_count INTO v_new_count;
  
  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can generate
CREATE OR REPLACE FUNCTION bestauth.check_generation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription bestauth_subscriptions%ROWTYPE;
  v_usage_today INTEGER;
  v_daily_limit INTEGER;
BEGIN
  -- Get user's subscription
  SELECT * INTO v_subscription
  FROM bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription, create default free subscription
  IF NOT FOUND THEN
    INSERT INTO bestauth_subscriptions (user_id, tier, status)
    VALUES (p_user_id, 'free', 'active')
    RETURNING * INTO v_subscription;
  END IF;
  
  -- Get today's usage
  v_usage_today := bestauth.get_user_usage_today(p_user_id);
  
  -- Determine daily limit based on subscription
  IF v_subscription.status = 'trialing' THEN
    -- Trial limits
    CASE v_subscription.tier
      WHEN 'pro' THEN v_daily_limit := 10;
      WHEN 'pro_plus' THEN v_daily_limit := 20;
      ELSE v_daily_limit := 3; -- Free trial
    END CASE;
  ELSE
    -- Regular limits
    CASE v_subscription.tier
      WHEN 'pro' THEN v_daily_limit := 1000; -- High daily limit for monthly quota
      WHEN 'pro_plus' THEN v_daily_limit := 2000;
      ELSE v_daily_limit := 3; -- Free tier
    END CASE;
  END IF;
  
  RETURN v_usage_today < v_daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription with computed fields
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
  next_billing_date TIMESTAMPTZ
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
  
  -- Determine limits
  IF v_is_trialing THEN
    CASE v_subscription.tier
      WHEN 'pro' THEN 
        v_daily_limit := 10;
        v_monthly_limit := 300;
      WHEN 'pro_plus' THEN 
        v_daily_limit := 20;
        v_monthly_limit := 600;
      ELSE 
        v_daily_limit := 3;
        v_monthly_limit := 90;
    END CASE;
  ELSE
    CASE v_subscription.tier
      WHEN 'pro' THEN 
        v_daily_limit := 1000;
        v_monthly_limit := 500;
      WHEN 'pro_plus' THEN 
        v_daily_limit := 2000;
        v_monthly_limit := 2000;
      ELSE 
        v_daily_limit := 3;
        v_monthly_limit := 90;
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
    v_subscription.current_period_end;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION bestauth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_bestauth_subscriptions_updated_at BEFORE UPDATE
  ON bestauth_subscriptions FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at_column();
  
CREATE TRIGGER update_bestauth_usage_tracking_updated_at BEFORE UPDATE
  ON bestauth_usage_tracking FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at_column();
  
CREATE TRIGGER update_bestauth_user_profiles_updated_at BEFORE UPDATE
  ON bestauth_user_profiles FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at_column();

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON bestauth_subscriptions TO authenticated;
GRANT ALL ON bestauth_usage_tracking TO authenticated;
GRANT ALL ON bestauth_user_profiles TO authenticated;
GRANT ALL ON bestauth_payment_history TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.get_user_usage_today TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.increment_usage TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.check_generation_limit TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.get_subscription_status TO authenticated;