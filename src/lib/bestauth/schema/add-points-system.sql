-- Add Points System to BestAuth Database
-- This migration adds credits/points support to BestAuth for paid subscriptions
-- Free users use rate limits (bestauth_usage_tracking), paid users use credits

-- 1. Add points columns to bestauth_subscriptions table
ALTER TABLE bestauth_subscriptions 
ADD COLUMN IF NOT EXISTS points_balance INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_lifetime_earned INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_lifetime_spent INTEGER NOT NULL DEFAULT 0;

-- Create index for points balance queries
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_points_balance 
ON bestauth_subscriptions(user_id, points_balance);

-- Add comment
COMMENT ON COLUMN bestauth_subscriptions.points_balance IS 'Current available credits balance (for Pro/Pro+ users)';
COMMENT ON COLUMN bestauth_subscriptions.points_lifetime_earned IS 'Total credits earned over lifetime';
COMMENT ON COLUMN bestauth_subscriptions.points_lifetime_spent IS 'Total credits spent over lifetime';

-- 2. Create bestauth_points_transactions table for audit trail
CREATE TABLE IF NOT EXISTS bestauth_points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  balance_after INTEGER NOT NULL, -- Balance after this transaction
  transaction_type VARCHAR(50) NOT NULL, -- 'signup_bonus', 'subscription_grant', 'purchase', 'generation_cost', 'refund', 'admin_adjustment'
  
  -- Related entities
  subscription_id UUID REFERENCES bestauth_subscriptions(id),
  generation_type VARCHAR(50), -- 'nanoBananaImage', 'sora2Video', 'sora2ProVideo'
  
  -- Payment references (for purchases)
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Description and metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  -- Constraints
  CHECK (amount != 0) -- Transaction must have non-zero amount
);

-- Create indexes for bestauth_points_transactions
CREATE INDEX IF NOT EXISTS idx_bestauth_points_transactions_user 
ON bestauth_points_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bestauth_points_transactions_type 
ON bestauth_points_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_bestauth_points_transactions_subscription 
ON bestauth_points_transactions(subscription_id) 
WHERE subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bestauth_points_transactions_stripe 
ON bestauth_points_transactions(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- Grant permissions
GRANT ALL ON bestauth_points_transactions TO authenticated;
GRANT ALL ON bestauth_points_transactions TO service_role;

-- 3. Create function to add points (atomic operation)
CREATE OR REPLACE FUNCTION bestauth.add_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_generation_type VARCHAR(50) DEFAULT NULL,
  p_subscription_id UUID DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_subscription_id UUID;
  v_transaction_id UUID;
  v_previous_balance INTEGER;
BEGIN
  -- Validate amount
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Points amount cannot be zero';
  END IF;
  
  -- Get or create subscription record
  SELECT id, points_balance INTO v_subscription_id, v_previous_balance
  FROM bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  IF v_subscription_id IS NULL THEN
    -- Create default free subscription if not exists
    INSERT INTO bestauth_subscriptions (user_id, tier, status, points_balance)
    VALUES (p_user_id, 'free', 'active', 0)
    RETURNING id, points_balance INTO v_subscription_id, v_previous_balance;
  END IF;
  
  -- Update points balance atomically
  UPDATE bestauth_subscriptions
  SET 
    points_balance = points_balance + p_amount,
    points_lifetime_earned = CASE 
      WHEN p_amount > 0 THEN points_lifetime_earned + p_amount 
      ELSE points_lifetime_earned 
    END,
    points_lifetime_spent = CASE 
      WHEN p_amount < 0 THEN points_lifetime_spent + ABS(p_amount) 
      ELSE points_lifetime_spent 
    END,
    updated_at = timezone('utc'::text, now())
  WHERE user_id = p_user_id
  RETURNING points_balance INTO v_new_balance;
  
  -- Validate balance is not negative
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient points balance. Current: %, Required: %', v_previous_balance, ABS(p_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO bestauth_points_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    subscription_id,
    generation_type,
    stripe_payment_intent_id,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    v_new_balance,
    p_transaction_type,
    COALESCE(p_subscription_id, v_subscription_id),
    p_generation_type,
    p_stripe_payment_intent_id,
    p_description,
    p_metadata
  ) RETURNING id INTO v_transaction_id;
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'previous_balance', v_previous_balance,
    'amount', p_amount,
    'new_balance', v_new_balance,
    'user_id', p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bestauth.add_points TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.add_points TO service_role;

-- 4. Create function to check points balance
CREATE OR REPLACE FUNCTION bestauth.get_points_balance(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_balance INTEGER;
  v_lifetime_earned INTEGER;
  v_lifetime_spent INTEGER;
  v_tier TEXT;
BEGIN
  SELECT 
    points_balance,
    points_lifetime_earned,
    points_lifetime_spent,
    tier::TEXT
  INTO 
    v_balance,
    v_lifetime_earned,
    v_lifetime_spent,
    v_tier
  FROM bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  -- Return 0 balance for users without subscription
  IF v_balance IS NULL THEN
    v_balance := 0;
    v_lifetime_earned := 0;
    v_lifetime_spent := 0;
    v_tier := 'free';
  END IF;
  
  RETURN jsonb_build_object(
    'balance', v_balance,
    'lifetime_earned', v_lifetime_earned,
    'lifetime_spent', v_lifetime_spent,
    'tier', v_tier,
    'user_id', p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bestauth.get_points_balance TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.get_points_balance TO service_role;

-- 5. Create function to deduct points for generation
CREATE OR REPLACE FUNCTION bestauth.deduct_generation_points(
  p_user_id UUID,
  p_generation_type VARCHAR(50),
  p_points_cost INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_tier TEXT;
  v_result JSONB;
BEGIN
  -- Check current balance and tier
  SELECT points_balance, tier::TEXT INTO v_current_balance, v_tier
  FROM bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  -- Free users don't use points, they use rate limits (bestauth_usage_tracking)
  IF v_tier = 'free' OR v_current_balance IS NULL OR v_current_balance = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'used_points', false,
      'message', 'Free tier user - using rate limits instead of points'
    );
  END IF;
  
  -- Check if user has enough points
  IF v_current_balance < p_points_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_points',
      'message', 'Insufficient points balance',
      'current_balance', v_current_balance,
      'required', p_points_cost,
      'shortfall', p_points_cost - v_current_balance
    );
  END IF;
  
  -- Deduct points
  v_result := bestauth.add_points(
    p_user_id,
    -p_points_cost,
    'generation_cost',
    'Generation: ' || p_generation_type,
    p_generation_type,
    NULL,
    NULL,
    p_metadata
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'used_points', true,
    'transaction', v_result
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bestauth.deduct_generation_points TO authenticated;
GRANT EXECUTE ON FUNCTION bestauth.deduct_generation_points TO service_role;

-- 6. Add trigger to update updated_at on points transactions
CREATE TRIGGER update_bestauth_points_transactions_updated_at BEFORE UPDATE
  ON bestauth_points_transactions FOR EACH ROW 
  EXECUTE FUNCTION bestauth.update_updated_at_column();

-- 7. Add comments for documentation
COMMENT ON TABLE bestauth_points_transactions IS 'BestAuth: Audit log of all credits/points transactions';
COMMENT ON FUNCTION bestauth.add_points IS 'BestAuth: Atomically add or deduct credits with transaction logging';
COMMENT ON FUNCTION bestauth.get_points_balance IS 'BestAuth: Get current credits balance and statistics';
COMMENT ON FUNCTION bestauth.deduct_generation_points IS 'BestAuth: Deduct credits for generation with validation';
