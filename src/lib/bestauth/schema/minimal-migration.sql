-- Minimal Migration Script for BestAuth
-- This focuses only on what's needed for subscriptions

-- Step 1: Add only the missing columns we need
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Step 2: Check if supabase_id exists, if not add it
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS supabase_id UUID;

-- Step 3: Update existing BestAuth users with their Supabase IDs
UPDATE bestauth_users bu
SET supabase_id = u.id
FROM auth.users u
WHERE bu.email = u.email
  AND bu.supabase_id IS NULL;

-- Step 4: Show current state after update
SELECT 
  'User Mapping Status' as info,
  bu.email,
  bu.id as bestauth_id,
  bu.supabase_id,
  CASE 
    WHEN bu.supabase_id IS NOT NULL THEN 'Mapped'
    ELSE 'Not Mapped'
  END as mapping_status
FROM bestauth_users bu
ORDER BY bu.email;

-- Step 5: Check if we need to migrate subscriptions
WITH subscription_check AS (
  SELECT 
    s.id as supabase_sub_id,
    u.email,
    bu.id as bestauth_user_id,
    s.status,
    s.stripe_customer_id,
    s.stripe_subscription_id,
    EXISTS (
      SELECT 1 FROM bestauth_subscriptions bs 
      WHERE bs.user_id = bu.id
    ) as already_in_bestauth
  FROM subscriptions s
  JOIN auth.users u ON s.user_id = u.id
  JOIN bestauth_users bu ON bu.email = u.email
)
SELECT 
  'Subscriptions to Migrate' as info,
  email,
  status,
  stripe_customer_id,
  CASE 
    WHEN already_in_bestauth THEN 'Already Migrated'
    ELSE 'Needs Migration'
  END as migration_status
FROM subscription_check
ORDER BY email;

-- Step 6: Actually migrate subscriptions (only run if needed)
-- Uncomment the lines below to perform the actual migration

/*
-- First, check what columns exist in subscriptions table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Migrate subscriptions that don't exist in BestAuth yet
INSERT INTO bestauth_subscriptions (
  id,
  user_id,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  current_period_start,
  current_period_end,
  created_at
)
SELECT 
  s.id,
  bu.id as user_id,
  CASE 
    WHEN s.status = 'trialing' THEN 'trialing'::subscription_status
    WHEN s.status = 'active' THEN 'active'::subscription_status
    WHEN s.status = 'canceled' THEN 'cancelled'::subscription_status
    WHEN s.status = 'incomplete' THEN 'pending'::subscription_status
    WHEN s.status = 'incomplete_expired' THEN 'expired'::subscription_status
    WHEN s.status = 'past_due' THEN 'paused'::subscription_status
    WHEN s.status = 'unpaid' THEN 'paused'::subscription_status
    ELSE 'active'::subscription_status
  END,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end,
  COALESCE(s.created_at, NOW())
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
JOIN bestauth_users bu ON bu.email = u.email
WHERE NOT EXISTS (
  SELECT 1 FROM bestauth_subscriptions bs 
  WHERE bs.user_id = bu.id
)
ON CONFLICT (id) DO NOTHING;
*/