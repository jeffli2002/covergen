-- Mark Deprecated Subscription Tables
-- This migration adds comments to clarify which subscription table should be used

-- 1. Mark bestauth_subscriptions as the PRIMARY source of truth
COMMENT ON TABLE public.bestauth_subscriptions IS 
'PRIMARY: Single source of truth for all user subscriptions. Use this table exclusively for all subscription operations.';

COMMENT ON COLUMN public.bestauth_subscriptions.tier IS 
'Subscription tier: ''free'', ''pro'', or ''pro_plus''. This is the authoritative tier value.';

COMMENT ON COLUMN public.bestauth_subscriptions.points_balance IS 
'Current credit balance for the user. Updated by subscription webhooks and credit operations.';

COMMENT ON COLUMN public.bestauth_subscriptions.upgrade_history IS 
'JSONB array tracking all tier changes. Each entry contains from_tier, to_tier, upgraded_at, etc.';

-- 2. Mark subscriptions_consolidated as DEPRECATED
COMMENT ON TABLE public.subscriptions_consolidated IS 
'DEPRECATED: DO NOT USE. This table has broken foreign key constraints (references auth.users instead of bestauth_users). Cannot insert BestAuth users. Use bestauth_subscriptions instead.';

-- 3. Mark subscriptions as LEGACY
COMMENT ON TABLE public.subscriptions IS 
'LEGACY: For old Supabase Auth users only. New users and all BestAuth users use bestauth_subscriptions. This table exists only for backwards compatibility with pre-BestAuth users.';

-- 4. Create read-only view as a safety measure (optional)
-- This allows old code that queries subscriptions_consolidated to still work,
-- but it reads from bestauth_subscriptions
CREATE OR REPLACE VIEW public.subscriptions_consolidated_readonly AS
SELECT 
  id,
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  billing_cycle,
  points_balance,
  created_at,
  updated_at
FROM public.bestauth_subscriptions;

COMMENT ON VIEW public.subscriptions_consolidated_readonly IS 
'READ-ONLY VIEW: Displays data from bestauth_subscriptions for backwards compatibility. DO NOT INSERT/UPDATE this view. Update bestauth_subscriptions directly.';

-- 5. Optionally prevent writes to deprecated table (WARNING: This will break any code still writing to it)
-- Uncomment these lines after you've confirmed no code is writing to subscriptions_consolidated
-- 
-- REVOKE INSERT, UPDATE, DELETE ON public.subscriptions_consolidated FROM authenticated;
-- REVOKE INSERT, UPDATE, DELETE ON public.subscriptions_consolidated FROM service_role;
-- 
-- COMMENT ON TABLE public.subscriptions_consolidated IS 
-- 'DEPRECATED & READ-ONLY: Writes disabled. Use bestauth_subscriptions instead.';
