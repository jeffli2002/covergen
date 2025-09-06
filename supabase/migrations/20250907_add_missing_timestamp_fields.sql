-- Add missing timestamp fields for comprehensive subscription tracking
-- These fields ensure we track all critical time points in the subscription lifecycle

-- Add fields for tracking subscription history
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_renewal_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS downgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS previous_tier VARCHAR(50),
ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- Add created_at if it doesn't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create subscription history table for audit trail
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type VARCHAR(50) NOT NULL, -- 'created', 'trial_started', 'trial_converted', 'renewed', 'upgraded', 'downgraded', 'cancelled', 'expired'
  from_tier VARCHAR(50),
  to_tier VARCHAR(50),
  from_period_end TIMESTAMP WITH TIME ZONE,
  to_period_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event_type ON subscription_history(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at DESC);

-- Function to record subscription events
CREATE OR REPLACE FUNCTION record_subscription_event(
  p_subscription_id UUID,
  p_user_id UUID,
  p_event_type VARCHAR(50),
  p_from_tier VARCHAR(50) DEFAULT NULL,
  p_to_tier VARCHAR(50) DEFAULT NULL,
  p_from_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_to_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  INSERT INTO subscription_history (
    subscription_id,
    user_id,
    event_type,
    from_tier,
    to_tier,
    from_period_end,
    to_period_end,
    metadata
  ) VALUES (
    p_subscription_id,
    p_user_id,
    p_event_type,
    p_from_tier,
    p_to_tier,
    p_from_period_end,
    p_to_period_end,
    p_metadata
  ) RETURNING id INTO v_history_id;
  
  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing subscriptions to set subscription_started_at
UPDATE subscriptions 
SET subscription_started_at = COALESCE(
  trial_start,
  current_period_start,
  created_at,
  NOW()
)
WHERE subscription_started_at IS NULL;

-- Comments for documentation
COMMENT ON COLUMN subscriptions.subscription_started_at IS 'When the subscription first started (including trial)';
COMMENT ON COLUMN subscriptions.last_renewal_at IS 'Last time the subscription was renewed';
COMMENT ON COLUMN subscriptions.upgraded_at IS 'When the subscription was last upgraded';
COMMENT ON COLUMN subscriptions.downgraded_at IS 'When the subscription was last downgraded';
COMMENT ON COLUMN subscriptions.previous_tier IS 'Previous subscription tier (for upgrades/downgrades)';
COMMENT ON COLUMN subscriptions.renewal_count IS 'Number of successful renewals';

COMMENT ON TABLE subscription_history IS 'Audit trail of all subscription events';
COMMENT ON COLUMN subscription_history.event_type IS 'Type of subscription event';

-- Grant permissions
GRANT SELECT ON subscription_history TO authenticated;
GRANT ALL ON subscription_history TO service_role;
GRANT EXECUTE ON FUNCTION record_subscription_event TO service_role;

-- RLS policies for subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscription history" ON subscription_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');