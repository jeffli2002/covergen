-- Documentation migration: Clarifies the correct usage of subscription columns
-- This migration adds comments to document the proper use of each column

-- Add comments to clarify column usage
COMMENT ON COLUMN public.subscriptions_consolidated.trial_started_at IS 'When the trial period started';
COMMENT ON COLUMN public.subscriptions_consolidated.trial_ended_at IS 'When the trial actually ended (past tense - set when trial converts to paid or expires)';
COMMENT ON COLUMN public.subscriptions_consolidated.expires_at IS 'Expiration date - For trials: when trial will end. For cancelled subscriptions: when access will end';

-- Example usage patterns:
-- 1. Active trial subscription:
--    - status: 'trialing'
--    - trial_started_at: '2025-09-15'
--    - trial_ended_at: NULL (not ended yet)
--    - expires_at: '2025-09-22' (when trial will end)
--
-- 2. Trial converted to paid:
--    - status: 'active'
--    - trial_started_at: '2025-09-15'
--    - trial_ended_at: '2025-09-22' (when it converted)
--    - expires_at: NULL (no expiration for active paid)
--
-- 3. Cancelled paid subscription:
--    - status: 'cancelled'
--    - trial_started_at: '2025-09-15' (if had trial)
--    - trial_ended_at: '2025-09-22' (if had trial)
--    - expires_at: '2025-10-15' (when access ends)