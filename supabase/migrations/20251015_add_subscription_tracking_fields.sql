-- Add missing subscription tracking fields for upgrade history and renewals
-- Migration created: 2025-10-15
-- NOTE: All subscription data is stored in BestAuth database only

-- Add new columns to bestauth_subscriptions table
ALTER TABLE public.bestauth_subscriptions
ADD COLUMN IF NOT EXISTS last_renewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS upgrade_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS proration_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS last_proration_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS previous_tier VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly';

-- Add helpful comments for documentation
COMMENT ON COLUMN public.bestauth_subscriptions.last_renewed_at IS 'Timestamp of the last subscription renewal (payment success for existing subscription)';
COMMENT ON COLUMN public.bestauth_subscriptions.upgrade_history IS 'Array of upgrade events: [{from_tier, to_tier, upgraded_at, proration_amount, billing_cycle}]';
COMMENT ON COLUMN public.bestauth_subscriptions.proration_amount IS 'Amount charged/credited for last proration event (in cents)';
COMMENT ON COLUMN public.bestauth_subscriptions.last_proration_date IS 'Timestamp of last proration charge';
COMMENT ON COLUMN public.bestauth_subscriptions.previous_tier IS 'Previous subscription tier before last upgrade';
COMMENT ON COLUMN public.bestauth_subscriptions.billing_cycle IS 'Billing cycle: monthly or yearly';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_last_renewed 
ON public.bestauth_subscriptions(last_renewed_at) 
WHERE last_renewed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_upgrade_history 
ON public.bestauth_subscriptions USING gin(upgrade_history) 
WHERE upgrade_history != '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_billing_cycle 
ON public.bestauth_subscriptions(billing_cycle);

CREATE INDEX IF NOT EXISTS idx_bestauth_subscriptions_previous_tier 
ON public.bestauth_subscriptions(previous_tier) 
WHERE previous_tier IS NOT NULL;

-- Grant permissions (BestAuth tables are typically accessed by service role)
-- No RLS policies needed as BestAuth handles authorization at application layer

-- Add migration completion log
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251015_add_subscription_tracking_fields completed at %', NOW();
  RAISE NOTICE 'Added tracking fields to bestauth_subscriptions table:';
  RAISE NOTICE '  - last_renewed_at: Track subscription renewals';
  RAISE NOTICE '  - upgrade_history: JSON array of all upgrades';
  RAISE NOTICE '  - proration_amount: Amount charged for prorations';
  RAISE NOTICE '  - last_proration_date: Timestamp of last proration';
  RAISE NOTICE '  - previous_tier: Previous tier before upgrade';
  RAISE NOTICE '  - billing_cycle: Monthly or yearly';
END $$;
