-- Add Points System for Credits-Based Subscriptions
-- This migration adds support for a points-based quota system alongside the existing rate limiting

-- 1. Add points balance to subscriptions_consolidated table
ALTER TABLE public.subscriptions_consolidated 
ADD COLUMN IF NOT EXISTS points_balance INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_lifetime_earned INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_lifetime_spent INTEGER NOT NULL DEFAULT 0;

-- Create index for points balance queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_points_balance 
ON public.subscriptions_consolidated(user_id, points_balance);

-- 2. Create points_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  balance_after INTEGER NOT NULL, -- Balance after this transaction
  transaction_type VARCHAR(50) NOT NULL, -- 'signup_bonus', 'subscription_grant', 'purchase', 'generation_cost', 'refund', 'admin_adjustment'
  
  -- Related entities
  subscription_id UUID REFERENCES public.subscriptions_consolidated(id),
  generation_type VARCHAR(50), -- 'nanoBananaImage', 'sora2Video', 'sora2ProVideo'
  
  -- Payment references (for purchases)
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Description and metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CHECK (amount != 0) -- Transaction must have non-zero amount
);

-- Create indexes for points_transactions
CREATE INDEX IF NOT EXISTS idx_points_transactions_user 
ON public.points_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_type 
ON public.points_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_points_transactions_subscription 
ON public.points_transactions(subscription_id) 
WHERE subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_points_transactions_stripe 
ON public.points_transactions(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- Enable RLS for points_transactions
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for points_transactions
CREATE POLICY "Users can view own points transactions" 
ON public.points_transactions
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all points transactions" 
ON public.points_transactions
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- 3. Create function to add points (atomic operation)
CREATE OR REPLACE FUNCTION public.add_points(
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
BEGIN
  -- Validate amount
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Points amount cannot be zero';
  END IF;
  
  -- Get or create subscription record
  SELECT id INTO v_subscription_id
  FROM public.subscriptions_consolidated
  WHERE user_id = p_user_id;
  
  IF v_subscription_id IS NULL THEN
    -- Create default free subscription if not exists
    INSERT INTO public.subscriptions_consolidated (user_id, tier, status)
    VALUES (p_user_id, 'free', 'active')
    RETURNING id INTO v_subscription_id;
  END IF;
  
  -- Update points balance atomically
  UPDATE public.subscriptions_consolidated
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
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING points_balance INTO v_new_balance;
  
  -- Validate balance is not negative
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient points balance. Current: %, Required: %', v_new_balance - p_amount, ABS(p_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO public.points_transactions (
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
    'previous_balance', v_new_balance - p_amount,
    'amount', p_amount,
    'new_balance', v_new_balance,
    'user_id', p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.add_points(UUID, INTEGER, VARCHAR, TEXT, VARCHAR, UUID, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.add_points(UUID, INTEGER, VARCHAR, TEXT, VARCHAR, UUID, TEXT, JSONB) TO authenticated;

-- 4. Create function to check points balance
CREATE OR REPLACE FUNCTION public.get_points_balance(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_balance INTEGER;
  v_lifetime_earned INTEGER;
  v_lifetime_spent INTEGER;
  v_tier VARCHAR(50);
BEGIN
  SELECT 
    points_balance,
    points_lifetime_earned,
    points_lifetime_spent,
    tier
  INTO 
    v_balance,
    v_lifetime_earned,
    v_lifetime_spent,
    v_tier
  FROM public.subscriptions_consolidated
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
GRANT EXECUTE ON FUNCTION public.get_points_balance(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_points_balance(UUID) TO authenticated;

-- 5. Create function to deduct points for generation
CREATE OR REPLACE FUNCTION public.deduct_generation_points(
  p_user_id UUID,
  p_generation_type VARCHAR(50),
  p_points_cost INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_result JSONB;
BEGIN
  -- Check current balance
  SELECT points_balance INTO v_current_balance
  FROM public.subscriptions_consolidated
  WHERE user_id = p_user_id;
  
  -- Free users don't use points, they use rate limits
  -- Only deduct points for paid users or those with bonus points
  IF v_current_balance IS NULL OR v_current_balance = 0 THEN
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
  v_result := public.add_points(
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
GRANT EXECUTE ON FUNCTION public.deduct_generation_points(UUID, VARCHAR, INTEGER, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_generation_points(UUID, VARCHAR, INTEGER, JSONB) TO authenticated;

-- 6. Create helper view for user points summary
CREATE OR REPLACE VIEW public.user_points_summary AS
SELECT 
  s.user_id,
  s.tier,
  s.status,
  s.points_balance,
  s.points_lifetime_earned,
  s.points_lifetime_spent,
  COUNT(pt.id) FILTER (WHERE pt.created_at >= NOW() - INTERVAL '30 days') as transactions_last_30d,
  SUM(pt.amount) FILTER (WHERE pt.created_at >= NOW() - INTERVAL '30 days' AND pt.amount < 0) as points_spent_last_30d,
  SUM(pt.amount) FILTER (WHERE pt.created_at >= NOW() - INTERVAL '30 days' AND pt.amount > 0) as points_earned_last_30d
FROM public.subscriptions_consolidated s
LEFT JOIN public.points_transactions pt ON pt.user_id = s.user_id
GROUP BY s.user_id, s.tier, s.status, s.points_balance, s.points_lifetime_earned, s.points_lifetime_spent;

-- Grant access to view
GRANT SELECT ON public.user_points_summary TO authenticated;
GRANT SELECT ON public.user_points_summary TO service_role;

-- 7. Add comment documentation
COMMENT ON TABLE public.points_transactions IS 'Audit log of all points transactions including grants, purchases, and spending';
COMMENT ON COLUMN public.subscriptions_consolidated.points_balance IS 'Current available points balance for the user';
COMMENT ON COLUMN public.subscriptions_consolidated.points_lifetime_earned IS 'Total points earned over lifetime (purchases + bonuses + grants)';
COMMENT ON COLUMN public.subscriptions_consolidated.points_lifetime_spent IS 'Total points spent over lifetime on generations';
COMMENT ON FUNCTION public.add_points IS 'Atomically add or deduct points from user balance with transaction logging';
COMMENT ON FUNCTION public.get_points_balance IS 'Get current points balance and statistics for a user';
COMMENT ON FUNCTION public.deduct_generation_points IS 'Deduct points for a generation with validation and logging';
