-- Migration: Add checkout session tracking to prevent concurrent sessions
-- This migration adds comprehensive tracking for payment checkout sessions

-- Create enum for checkout session status
CREATE TYPE checkout_session_status AS ENUM ('pending', 'completed', 'expired', 'cancelled');

-- Create table for tracking active checkout sessions
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL UNIQUE, -- Creem/Stripe session ID
  plan_id VARCHAR(50) NOT NULL,
  status checkout_session_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Partial unique index to ensure only one active session per user
  CONSTRAINT unique_active_session_per_user EXCLUDE USING btree (
    user_id WITH =
  ) WHERE (status = 'pending')
);

-- Create indexes for performance
CREATE INDEX idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_expires_at ON checkout_sessions(expires_at) WHERE status = 'pending';
CREATE INDEX idx_checkout_sessions_session_id ON checkout_sessions(session_id);

-- Create updated_at trigger
CREATE TRIGGER update_checkout_sessions_updated_at
  BEFORE UPDATE ON checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add rate limiting table for checkout attempts
CREATE TABLE IF NOT EXISTS checkout_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()) + INTERVAL '1 hour',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Unique constraint for user within time window
  UNIQUE(user_id, window_start)
);

-- Create index for rate limit lookups
CREATE INDEX idx_checkout_rate_limits_user_window ON checkout_rate_limits(user_id, window_end);

-- Function to check if user can create checkout session
CREATE OR REPLACE FUNCTION can_create_checkout_session(
  p_user_id UUID,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  active_session_id UUID,
  attempts_remaining INTEGER
) AS $$
DECLARE
  v_active_session RECORD;
  v_rate_limit RECORD;
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempts_count INTEGER;
BEGIN
  -- Check for active checkout sessions
  SELECT cs.id, cs.session_id, cs.expires_at, cs.plan_id
  INTO v_active_session
  FROM checkout_sessions cs
  WHERE cs.user_id = p_user_id
    AND cs.status = 'pending'
    AND cs.expires_at > NOW()
  LIMIT 1;
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      FALSE,
      'Active checkout session exists. Please complete or wait for it to expire.',
      v_active_session.id,
      0;
    RETURN;
  END IF;
  
  -- Check rate limits
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count attempts in current window
  SELECT COUNT(*)::INTEGER
  INTO v_attempts_count
  FROM checkout_rate_limits
  WHERE user_id = p_user_id
    AND window_start >= v_window_start;
  
  IF v_attempts_count >= p_max_attempts THEN
    RETURN QUERY SELECT 
      FALSE,
      'Too many checkout attempts. Please try again later.',
      NULL::UUID,
      0;
    RETURN;
  END IF;
  
  -- User can create checkout session
  RETURN QUERY SELECT 
    TRUE,
    'Checkout session can be created',
    NULL::UUID,
    (p_max_attempts - v_attempts_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record checkout session creation
CREATE OR REPLACE FUNCTION record_checkout_session(
  p_user_id UUID,
  p_session_id VARCHAR(255),
  p_plan_id VARCHAR(50),
  p_expires_minutes INTEGER DEFAULT 30,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiration time
  v_expires_at := NOW() + (p_expires_minutes || ' minutes')::INTERVAL;
  
  -- Insert checkout session
  INSERT INTO checkout_sessions (
    user_id, session_id, plan_id, expires_at, metadata, status
  ) VALUES (
    p_user_id, p_session_id, p_plan_id, v_expires_at, p_metadata, 'pending'
  ) RETURNING id INTO v_session_id;
  
  -- Record rate limit attempt
  INSERT INTO checkout_rate_limits (user_id, window_start, window_end)
  VALUES (
    p_user_id, 
    NOW(), 
    NOW() + INTERVAL '1 hour'
  )
  ON CONFLICT (user_id, window_start) DO UPDATE
  SET attempt_count = checkout_rate_limits.attempt_count + 1;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete checkout session
CREATE OR REPLACE FUNCTION complete_checkout_session(
  p_session_id VARCHAR(255),
  p_subscription_id VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE checkout_sessions
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW(),
    metadata = metadata || jsonb_build_object('subscription_id', p_subscription_id)
  WHERE session_id = p_session_id
    AND status = 'pending';
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old checkout sessions (run periodically)
CREATE OR REPLACE FUNCTION expire_old_checkout_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE checkout_sessions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM checkout_rate_limits
  WHERE window_end < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for monitoring checkout sessions
CREATE OR REPLACE VIEW checkout_session_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_sessions,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CASE 
    WHEN status = 'completed' AND completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (completed_at - created_at))
    ELSE NULL 
  END) as avg_completion_time_seconds
FROM checkout_sessions
GROUP BY DATE(created_at);

-- Add permissions
GRANT SELECT ON checkout_sessions TO authenticated;
GRANT SELECT ON checkout_rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_checkout_session TO authenticated;
GRANT EXECUTE ON FUNCTION record_checkout_session TO service_role;
GRANT EXECUTE ON FUNCTION complete_checkout_session TO service_role;
GRANT EXECUTE ON FUNCTION expire_old_checkout_sessions TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO service_role;
GRANT SELECT ON checkout_session_analytics TO service_role;

-- Add RLS policies
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own checkout sessions
CREATE POLICY "Users can view own checkout sessions" ON checkout_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can modify checkout sessions
CREATE POLICY "Service role can manage checkout sessions" ON checkout_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can see their own rate limits
CREATE POLICY "Users can view own rate limits" ON checkout_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Add comment documentation
COMMENT ON TABLE checkout_sessions IS 'Tracks all payment checkout sessions to prevent concurrent sessions and monitor conversion';
COMMENT ON TABLE checkout_rate_limits IS 'Implements rate limiting for checkout session creation';
COMMENT ON FUNCTION can_create_checkout_session IS 'Checks if a user is allowed to create a new checkout session based on active sessions and rate limits';
COMMENT ON FUNCTION record_checkout_session IS 'Records a new checkout session and updates rate limits';
COMMENT ON FUNCTION complete_checkout_session IS 'Marks a checkout session as completed when payment is confirmed';
COMMENT ON FUNCTION expire_old_checkout_sessions IS 'Expires checkout sessions that have exceeded their expiration time';