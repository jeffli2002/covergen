-- ============================================================================
-- Payment System Tables (matching im2prompt architecture)
-- Created: 2025-10-16
-- Purpose: Comprehensive payment, subscription, and credit management with
--          event deduplication and idempotent operations
-- ============================================================================

-- Create payment table for tracking subscriptions and one-time payments
CREATE TABLE IF NOT EXISTS payment (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'creem' CHECK (provider IN ('stripe', 'creem')),
  price_id TEXT NOT NULL,
  product_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('one_time', 'subscription')),
  interval TEXT CHECK (interval IN ('month', 'year') OR interval IS NULL),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_customer_id ON payment(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_subscription_id ON payment(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_type ON payment(type);

-- Create payment_event table for webhook deduplication
CREATE TABLE IF NOT EXISTS payment_event (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  creem_event_id TEXT UNIQUE,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for event deduplication
CREATE INDEX IF NOT EXISTS idx_payment_event_payment_id ON payment_event(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_event_stripe_id ON payment_event(stripe_event_id) WHERE stripe_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_event_creem_id ON payment_event(creem_event_id) WHERE creem_event_id IS NOT NULL;

-- Create user_credits table for credit balance tracking
CREATE TABLE IF NOT EXISTS user_credits (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  frozen_balance INTEGER NOT NULL DEFAULT 0 CHECK (frozen_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Create credit_transactions table for transaction history with idempotency
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'admin_adjust', 'freeze', 'unfreeze')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  source TEXT NOT NULL CHECK (source IN ('subscription', 'api_call', 'admin', 'storage', 'bonus', 'one_time_payment')),
  description TEXT,
  reference_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite unique index for idempotency (prevent duplicate transactions with same reference_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_user_reference_unique 
  ON credit_transactions(user_id, reference_id) 
  WHERE reference_id IS NOT NULL;

-- Index for user transaction history
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Create user_quota_usage table for quota tracking by service and period
CREATE TABLE IF NOT EXISTS user_quota_usage (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('api_call', 'storage', 'custom', 'image_generation', 'video_generation', 'image_extraction')),
  period TEXT NOT NULL, -- Format: YYYY-MM
  used_amount INTEGER NOT NULL DEFAULT 0 CHECK (used_amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite unique index for user, service, and period
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_service_period 
  ON user_quota_usage(user_id, service, period);

-- Index for period-based queries
CREATE INDEX IF NOT EXISTS idx_quota_usage_period ON user_quota_usage(period);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_updated_at ON payment;
CREATE TRIGGER update_payment_updated_at
  BEFORE UPDATE ON payment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_quota_usage_updated_at ON user_quota_usage;
CREATE TRIGGER update_user_quota_usage_updated_at
  BEFORE UPDATE ON user_quota_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quota_usage ENABLE ROW LEVEL SECURITY;

-- Payment table policies
CREATE POLICY "Users can view their own payments"
  ON payment FOR SELECT
  USING (auth.uid() = user_id);

-- Payment event policies (service-only access)
CREATE POLICY "Service role can manage payment events"
  ON payment_event FOR ALL
  USING (auth.role() = 'service_role');

-- User credits policies
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Quota usage policies
CREATE POLICY "Users can view their own quota usage"
  ON user_quota_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE payment IS 'Stores payment records for subscriptions and one-time payments with support for multiple providers (Stripe, Creem)';
COMMENT ON TABLE payment_event IS 'Stores webhook events for deduplication - prevents duplicate processing of webhook retries';
COMMENT ON TABLE user_credits IS 'Stores user credit balances for usage-based billing and prepaid credits';
COMMENT ON TABLE credit_transactions IS 'Stores credit transaction history with idempotency via reference_id to prevent duplicate credits';
COMMENT ON TABLE user_quota_usage IS 'Stores quota usage by service and period for rate limiting and analytics';

COMMENT ON COLUMN credit_transactions.reference_id IS 'Unique reference for idempotency - e.g., creem_sub_123_initial_20251016 - prevents duplicate credit grants';
COMMENT ON COLUMN payment_event.stripe_event_id IS 'Stripe webhook event ID for deduplication';
COMMENT ON COLUMN payment_event.creem_event_id IS 'Creem webhook event ID for deduplication';
