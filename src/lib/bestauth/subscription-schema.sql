-- BestAuth Compatible Subscription Schema
-- This creates subscription tables that work with BestAuth users

-- Drop existing foreign key constraints if needed
-- ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Subscription types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'pro_plus');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending', 'trialing', 'paused');

-- Main subscriptions table for BestAuth
CREATE TABLE IF NOT EXISTS bestauth_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id),
  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

-- Indexes for performance
CREATE INDEX idx_bestauth_subscriptions_user_id ON bestauth_subscriptions(user_id);
CREATE INDEX idx_bestauth_subscriptions_status ON bestauth_subscriptions(status);
CREATE INDEX idx_bestauth_subscriptions_stripe_customer_id ON bestauth_subscriptions(stripe_customer_id);

-- Generation limits tracking
CREATE TABLE IF NOT EXISTS bestauth_usage_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'image_generation', 'video_generation', etc.
  used_count INTEGER DEFAULT 0,
  limit_count INTEGER NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, resource_type, period_start)
);

-- Payment history
CREATE TABLE IF NOT EXISTS bestauth_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL, -- 'succeeded', 'pending', 'failed'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bestauth_subscriptions_updated_at BEFORE UPDATE ON bestauth_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bestauth_usage_limits_updated_at BEFORE UPDATE ON bestauth_usage_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS (BestAuth handles auth at API level)
ALTER TABLE bestauth_subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_usage_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_payments DISABLE ROW LEVEL SECURITY;

-- Migration helper view to map old subscription data
-- This helps during transition from Supabase Auth to BestAuth
CREATE OR REPLACE VIEW subscription_migration_helper AS
SELECT 
  s.*,
  u.email as user_email,
  bu.id as bestauth_user_id
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
LEFT JOIN bestauth_users bu ON bu.email = u.email;

COMMENT ON VIEW subscription_migration_helper IS 'Helper view for migrating subscriptions from Supabase Auth to BestAuth';

-- Grant necessary permissions
GRANT ALL ON bestauth_subscriptions TO postgres, service_role;
GRANT ALL ON bestauth_usage_limits TO postgres, service_role;
GRANT ALL ON bestauth_payments TO postgres, service_role;
GRANT SELECT ON subscription_migration_helper TO postgres, service_role;