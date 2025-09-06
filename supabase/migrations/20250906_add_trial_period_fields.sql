-- Add trial period tracking fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS is_trial_active BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS converted_from_trial BOOLEAN DEFAULT false;

-- Add indexes for trial queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON subscriptions(trial_end) WHERE is_trial_active = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_trial_active ON subscriptions(is_trial_active);

-- Update existing active subscriptions to ensure consistency
UPDATE subscriptions 
SET is_trial_active = false 
WHERE is_trial_active IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN subscriptions.trial_start IS 'Timestamp when the free trial started';
COMMENT ON COLUMN subscriptions.trial_end IS 'Timestamp when the free trial ends';
COMMENT ON COLUMN subscriptions.is_trial_active IS 'Whether the subscription is currently in trial period';
COMMENT ON COLUMN subscriptions.converted_from_trial IS 'Whether this subscription was converted from a trial';