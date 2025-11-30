-- Create atomic function for deducting points with transaction record
-- This ensures that credit deduction and transaction recording happen atomically
-- If transaction record creation fails, the entire operation is rolled back

CREATE OR REPLACE FUNCTION public.deduct_points_for_generation(
  p_user_id UUID,
  p_generation_type VARCHAR(50),
  p_credit_cost INTEGER,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_subscription_id UUID;
  v_previous_balance INTEGER;
  v_new_balance INTEGER;
  v_previous_spent INTEGER;
  v_new_spent INTEGER;
  v_transaction_id UUID;
  v_error_message TEXT;
BEGIN
  -- Validate inputs
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_credit_cost <= 0 THEN
    RAISE EXCEPTION 'Credit cost must be positive';
  END IF;
  
  -- Get subscription record
  SELECT id, points_balance, COALESCE(points_lifetime_spent, 0)
  INTO v_subscription_id, v_previous_balance, v_previous_spent
  FROM bestauth_subscriptions
  WHERE user_id = p_user_id;
  
  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found for user %', p_user_id;
  END IF;
  
  -- Check if user has enough credits
  IF COALESCE(v_previous_balance, 0) < p_credit_cost THEN
    RAISE EXCEPTION 'Insufficient credits. Current: %, Required: %', 
      COALESCE(v_previous_balance, 0), p_credit_cost;
  END IF;
  
  -- Calculate new values
  v_new_balance := v_previous_balance - p_credit_cost;
  v_new_spent := v_previous_spent + p_credit_cost;
  
  -- Update subscription balance atomically
  UPDATE bestauth_subscriptions
  SET 
    points_balance = v_new_balance,
    points_lifetime_spent = v_new_spent,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND points_balance = v_previous_balance  -- Optimistic locking to prevent race conditions
  RETURNING points_balance INTO v_new_balance;
  
  -- Check if update succeeded (optimistic locking check)
  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'Failed to update balance. Possible race condition or balance changed.';
  END IF;
  
  -- Create transaction record (CRITICAL: This must succeed or the entire operation fails)
  INSERT INTO bestauth_points_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    generation_type,
    subscription_id,
    description,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    -p_credit_cost,
    v_new_balance,
    'generation_deduction',
    p_generation_type,
    v_subscription_id,
    COALESCE(p_description, 'Generation: ' || p_generation_type),
    p_metadata,
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- If transaction record creation failed, the INSERT would have raised an exception
  -- But we check anyway for safety
  IF v_transaction_id IS NULL THEN
    -- Rollback the balance update (this should not happen due to transaction, but safety check)
    UPDATE bestauth_subscriptions
    SET 
      points_balance = v_previous_balance,
      points_lifetime_spent = v_previous_spent,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RAISE EXCEPTION 'Failed to create transaction record. Balance update rolled back.';
  END IF;
  
  -- Return success with transaction details
  RETURN jsonb_build_object(
    'success', TRUE,
    'transaction_id', v_transaction_id,
    'user_id', p_user_id,
    'previous_balance', v_previous_balance,
    'new_balance', v_new_balance,
    'credit_cost', p_credit_cost,
    'generation_type', p_generation_type
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    v_error_message := SQLERRM;
    RAISE WARNING 'Error in deduct_points_for_generation: %', v_error_message;
    -- Re-raise the exception to ensure transaction rollback
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.deduct_points_for_generation TO service_role;

-- Add comment
COMMENT ON FUNCTION public.deduct_points_for_generation IS 
  'Atomically deducts credits and creates transaction record. If transaction record creation fails, the entire operation is rolled back.';

