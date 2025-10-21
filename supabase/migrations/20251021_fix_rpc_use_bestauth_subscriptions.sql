-- Fix RPC Functions to Use bestauth_subscriptions Instead of subscriptions_consolidated
-- This migration updates add_points and related RPC functions to use the primary table

-- 1. Update add_points function to use bestauth_subscriptions
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
  v_previous_balance INTEGER;
  v_subscription_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Validate amount
  IF p_amount = 0 THEN
    RAISE EXCEPTION 'Points amount cannot be zero';
  END IF;
  
  -- Get subscription from PRIMARY SOURCE: bestauth_subscriptions
  SELECT id, points_balance INTO v_subscription_id, v_previous_balance
  FROM public.bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  IF v_subscription_id IS NULL THEN
    -- Create default free subscription if not exists
    INSERT INTO public.bestauth_subscriptions (
      user_id, 
      tier, 
      status,
      points_balance,
      points_lifetime_earned,
      points_lifetime_spent
    )
    VALUES (
      p_user_id, 
      'free'::bestauth.subscription_tier, 
      'active'::bestauth.subscription_status,
      0,
      0,
      0
    )
    RETURNING id, points_balance INTO v_subscription_id, v_previous_balance;
  END IF;
  
  -- Calculate new balance
  v_new_balance := COALESCE(v_previous_balance, 0) + p_amount;
  
  -- Validate balance is not negative
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient points balance. Current: %, Required: %', v_previous_balance, ABS(p_amount);
  END IF;
  
  -- Update points balance atomically in bestauth_subscriptions
  UPDATE public.bestauth_subscriptions
  SET 
    points_balance = v_new_balance,
    points_lifetime_earned = CASE 
      WHEN p_amount > 0 THEN COALESCE(points_lifetime_earned, 0) + p_amount 
      ELSE COALESCE(points_lifetime_earned, 0)
    END,
    points_lifetime_spent = CASE 
      WHEN p_amount < 0 THEN COALESCE(points_lifetime_spent, 0) + ABS(p_amount) 
      ELSE COALESCE(points_lifetime_spent, 0)
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction in points_transactions
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
    'success', TRUE,
    'transaction_id', v_transaction_id,
    'previous_balance', COALESCE(v_previous_balance, 0),
    'amount', p_amount,
    'new_balance', v_new_balance,
    'user_id', p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_points_balance function to use bestauth_subscriptions
CREATE OR REPLACE FUNCTION public.get_points_balance(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_balance INTEGER;
  v_lifetime_earned INTEGER;
  v_lifetime_spent INTEGER;
  v_tier VARCHAR(50);
BEGIN
  -- Get balance from PRIMARY SOURCE: bestauth_subscriptions
  SELECT 
    COALESCE(points_balance, 0),
    COALESCE(points_lifetime_earned, 0),
    COALESCE(points_lifetime_spent, 0),
    tier::TEXT
  INTO 
    v_balance,
    v_lifetime_earned,
    v_lifetime_spent,
    v_tier
  FROM public.bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, return default free tier
  IF v_tier IS NULL THEN
    v_tier := 'free';
    v_balance := 0;
    v_lifetime_earned := 0;
    v_lifetime_spent := 0;
  END IF;
  
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'balance', v_balance,
    'lifetime_earned', v_lifetime_earned,
    'lifetime_spent', v_lifetime_spent,
    'tier', v_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add comment documenting the change
COMMENT ON FUNCTION public.add_points IS 
'Adds/deducts points for a user. PRIMARY SOURCE: bestauth_subscriptions. Updates points_balance, points_lifetime_earned, points_lifetime_spent. Creates transaction record in points_transactions.';

COMMENT ON FUNCTION public.get_points_balance IS 
'Gets current points balance for a user. PRIMARY SOURCE: bestauth_subscriptions. Returns balance, lifetime_earned, lifetime_spent, and tier.';

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.add_points TO service_role;
GRANT EXECUTE ON FUNCTION public.get_points_balance TO service_role;
GRANT EXECUTE ON FUNCTION public.add_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_points_balance TO authenticated;
