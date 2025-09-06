-- Customer Identity Mapping Table
-- Maps Supabase users to Creem customers with explicit relationship tracking

CREATE TABLE IF NOT EXISTS public.customer_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creem_customer_id TEXT NOT NULL,
  creem_subscription_id TEXT,
  
  -- Identity tracking
  email TEXT NOT NULL,
  provider TEXT DEFAULT 'google',
  
  -- Subscription context
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'pro_plus')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'paused')),
  
  -- Session context preservation
  created_from_session_id TEXT, -- Track which session created this mapping
  last_auth_provider TEXT,
  last_successful_payment_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one mapping per user
  CONSTRAINT unique_user_customer UNIQUE (user_id),
  -- Allow multiple users per creem customer (family plans, etc.)
  CONSTRAINT unique_creem_mapping UNIQUE (creem_customer_id, email)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_customer_mapping_user_id ON public.customer_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_mapping_creem_customer ON public.customer_mapping(creem_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_mapping_email ON public.customer_mapping(email);
CREATE INDEX IF NOT EXISTS idx_customer_mapping_subscription ON public.customer_mapping(subscription_status) WHERE subscription_status != 'canceled';

-- Updated subscriptions table to reference customer mapping
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS customer_mapping_id UUID REFERENCES public.customer_mapping(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_context JSONB DEFAULT '{}'; -- Store payment flow context

-- Function to create or update customer mapping
CREATE OR REPLACE FUNCTION upsert_customer_mapping(
  p_user_id UUID,
  p_email TEXT,
  p_creem_customer_id TEXT,
  p_creem_subscription_id TEXT DEFAULT NULL,
  p_subscription_tier TEXT DEFAULT 'free',
  p_subscription_status TEXT DEFAULT 'active',
  p_provider TEXT DEFAULT 'google',
  p_session_context JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_mapping_id UUID;
  v_session_id TEXT;
BEGIN
  -- Extract session ID from context if provided
  v_session_id := p_session_context->>'session_id';
  
  INSERT INTO public.customer_mapping (
    user_id,
    email,
    creem_customer_id,
    creem_subscription_id,
    subscription_tier,
    subscription_status,
    provider,
    created_from_session_id,
    last_auth_provider,
    updated_at
  )
  VALUES (
    p_user_id,
    p_email,
    p_creem_customer_id,
    p_creem_subscription_id,
    p_subscription_tier,
    p_subscription_status,
    p_provider,
    v_session_id,
    p_provider,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    creem_subscription_id = COALESCE(EXCLUDED.creem_subscription_id, customer_mapping.creem_subscription_id),
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status,
    last_auth_provider = EXCLUDED.last_auth_provider,
    updated_at = NOW()
  RETURNING id INTO v_mapping_id;
  
  RETURN v_mapping_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unified customer data
CREATE OR REPLACE FUNCTION get_unified_customer_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_usage JSONB;
BEGIN
  -- Get customer mapping with subscription data
  SELECT jsonb_build_object(
    'user_id', cm.user_id,
    'email', cm.email,
    'creem_customer_id', cm.creem_customer_id,
    'creem_subscription_id', cm.creem_subscription_id,
    'subscription_tier', cm.subscription_tier,
    'subscription_status', cm.subscription_status,
    'provider', cm.provider,
    'last_successful_payment_at', cm.last_successful_payment_at,
    'created_at', cm.created_at,
    'updated_at', cm.updated_at,
    -- Include subscription details
    'subscription_details', jsonb_build_object(
      'stripe_price_id', s.stripe_price_id,
      'current_period_start', s.current_period_start,
      'current_period_end', s.current_period_end,
      'cancel_at_period_end', s.cancel_at_period_end,
      'status', s.status
    ),
    -- Include trial information
    'trial_info', jsonb_build_object(
      'trial_ends_at', u.creem_trial_ends_at,
      'trial_started_at', u.creem_trial_started_at,
      'subscription_tier', u.creem_subscription_tier
    )
  )
  INTO v_result
  FROM public.customer_mapping cm
  LEFT JOIN public.subscriptions s ON s.user_id = cm.user_id AND s.status = 'active'
  LEFT JOIN auth.users u ON u.id = cm.user_id
  WHERE cm.user_id = p_user_id;
  
  -- Add usage information
  SELECT check_generation_limit(p_user_id, COALESCE(v_result->>'subscription_tier', 'free'))
  INTO v_usage;
  
  -- Combine customer and usage data
  v_result := v_result || jsonb_build_object('usage', v_usage);
  
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle webhook-triggered subscription updates with session context preservation
CREATE OR REPLACE FUNCTION handle_subscription_webhook(
  p_webhook_data JSONB
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_customer_id TEXT;
  v_subscription_id TEXT;
  v_event_type TEXT;
  v_subscription_status TEXT;
  v_subscription_tier TEXT;
  v_mapping_id UUID;
  v_result JSONB;
BEGIN
  -- Extract webhook data
  v_event_type := p_webhook_data->>'type';
  v_customer_id := p_webhook_data->'data'->'object'->>'customer';
  v_subscription_id := p_webhook_data->'data'->'object'->>'id';
  v_subscription_status := p_webhook_data->'data'->'object'->>'status';
  
  -- Determine subscription tier from product/price information
  -- This logic should match your Creem product configuration
  v_subscription_tier := CASE 
    WHEN p_webhook_data->'data'->'object'->>'product' LIKE '%pro_plus%' THEN 'pro_plus'
    WHEN p_webhook_data->'data'->'object'->>'product' LIKE '%pro%' THEN 'pro'
    ELSE 'free'
  END;
  
  -- Find user by customer mapping
  SELECT user_id INTO v_user_id
  FROM public.customer_mapping
  WHERE creem_customer_id = v_customer_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer mapping not found',
      'customer_id', v_customer_id
    );
  END IF;
  
  -- Update customer mapping
  UPDATE public.customer_mapping
  SET 
    creem_subscription_id = COALESCE(v_subscription_id, creem_subscription_id),
    subscription_tier = COALESCE(v_subscription_tier, subscription_tier),
    subscription_status = COALESCE(v_subscription_status, subscription_status),
    last_successful_payment_at = CASE 
      WHEN v_event_type IN ('subscription.paid', 'checkout.completed') THEN NOW()
      ELSE last_successful_payment_at
    END,
    updated_at = NOW()
  WHERE user_id = v_user_id
  RETURNING id INTO v_mapping_id;
  
  -- Update or create subscription record
  INSERT INTO public.subscriptions (
    user_id,
    customer_mapping_id,
    stripe_customer_id,
    stripe_subscription_id,
    subscription_tier,
    status,
    payment_context,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_mapping_id,
    v_customer_id,
    v_subscription_id,
    v_subscription_tier,
    v_subscription_status,
    jsonb_build_object(
      'webhook_event', v_event_type,
      'processed_at', NOW(),
      'creem_data', p_webhook_data->'data'->'object'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    subscription_tier = EXCLUDED.subscription_tier,
    status = EXCLUDED.status,
    payment_context = subscriptions.payment_context || EXCLUDED.payment_context,
    updated_at = NOW();
    
  -- Handle trial updates if applicable
  IF v_event_type = 'checkout.completed' AND p_webhook_data->'data'->'object'->>'mode' = 'trial' THEN
    -- Extract trial end date from webhook data
    PERFORM update_user_trial_status(
      v_user_id,
      (p_webhook_data->'data'->'object'->>'trial_end')::timestamptz,
      v_subscription_tier
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'customer_id', v_customer_id,
    'subscription_id', v_subscription_id,
    'event_type', v_event_type,
    'mapping_id', v_mapping_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for customer_mapping table
ALTER TABLE public.customer_mapping ENABLE ROW LEVEL SECURITY;

-- Users can only view their own customer mapping
CREATE POLICY "Users can view own customer mapping" ON public.customer_mapping
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all customer mappings
CREATE POLICY "Service role can manage customer mappings" ON public.customer_mapping
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON public.customer_mapping TO authenticated;
GRANT ALL ON public.customer_mapping TO service_role;

GRANT EXECUTE ON FUNCTION upsert_customer_mapping(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION get_unified_customer_data(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_subscription_webhook(JSONB) TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.customer_mapping IS 'Explicit mapping between Supabase users and Creem customers with session context preservation';
COMMENT ON FUNCTION upsert_customer_mapping IS 'Creates or updates customer mapping with session context for OAuth + payment flow continuity';
COMMENT ON FUNCTION get_unified_customer_data IS 'Returns complete user profile including subscription and usage data in single call';
COMMENT ON FUNCTION handle_subscription_webhook IS 'Processes Creem webhook events while maintaining user session context';