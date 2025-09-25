-- Fixed Migration Script for BestAuth Subscriptions
-- This script handles existing users and merges subscription data

-- Step 0: Add supabase_id column if it doesn't exist
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS supabase_id UUID;

-- Add metadata column if it doesn't exist
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Step 1: Update existing BestAuth users with Supabase data
WITH supabase_users AS (
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data
  FROM auth.users u
  WHERE u.email IS NOT NULL
)
UPDATE bestauth_users bu
SET 
  supabase_id = su.id,
  metadata = COALESCE(bu.metadata, '{}'::jsonb) || 
    CASE 
      WHEN su.raw_user_meta_data IS NOT NULL THEN su.raw_user_meta_data
      ELSE '{}'::jsonb
    END
FROM supabase_users su
WHERE bu.email = su.email
  AND bu.supabase_id IS NULL;

-- Step 2: Insert new users that don't exist in BestAuth
INSERT INTO bestauth_users (id, email, supabase_id, created_at, metadata)
SELECT 
  gen_random_uuid() as id,  -- Generate new BestAuth ID
  u.email,
  u.id as supabase_id,      -- Store original Supabase ID
  u.created_at,
  COALESCE(u.raw_user_meta_data, '{}'::jsonb) as metadata
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM bestauth_users bu WHERE bu.email = u.email
  )
ON CONFLICT (email) DO NOTHING;  -- Skip if email already exists

-- Step 3: Create user ID mapping table for reference
CREATE TABLE IF NOT EXISTS supabase_bestauth_user_mapping (
  supabase_id uuid PRIMARY KEY,
  bestauth_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Step 4: Populate mapping table
INSERT INTO supabase_bestauth_user_mapping (supabase_id, bestauth_id)
SELECT 
  u.id as supabase_id,
  bu.id as bestauth_id
FROM auth.users u
JOIN bestauth_users bu ON bu.email = u.email
ON CONFLICT (supabase_id) DO UPDATE
SET bestauth_id = EXCLUDED.bestauth_id;

-- Step 5: Migrate subscriptions with proper user mapping
WITH subscription_data AS (
  SELECT 
    s.id,
    s.user_id as supabase_user_id,
    bu.id as bestauth_user_id,
    s.status,
    s.price_id,
    s.quantity,
    s.cancel_at_period_end,
    s.created,
    s.current_period_start,
    s.current_period_end,
    s.ended_at,
    s.cancel_at,
    s.canceled_at,
    s.trial_start,
    s.trial_end,
    s.stripe_customer_id,
    s.stripe_subscription_id,
    s.metadata
  FROM subscriptions s
  JOIN auth.users u ON u.id = s.user_id
  JOIN bestauth_users bu ON bu.email = u.email
)
INSERT INTO bestauth_subscriptions (
  id,
  user_id,
  status,
  price_id,
  quantity,
  cancel_at_period_end,
  created,
  current_period_start,
  current_period_end,
  ended_at,
  cancel_at,
  canceled_at,
  trial_start,
  trial_end,
  stripe_customer_id,
  stripe_subscription_id,
  metadata
)
SELECT 
  id,
  bestauth_user_id as user_id,
  status,
  price_id,
  quantity,
  cancel_at_period_end,
  created,
  current_period_start,
  current_period_end,
  ended_at,
  cancel_at,
  canceled_at,
  trial_start,
  trial_end,
  stripe_customer_id,
  stripe_subscription_id,
  metadata
FROM subscription_data
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  status = EXCLUDED.status,
  price_id = EXCLUDED.price_id,
  stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, bestauth_subscriptions.stripe_customer_id),
  stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, bestauth_subscriptions.stripe_subscription_id);

-- Step 6: Migrate customers with proper user mapping
WITH customer_data AS (
  SELECT 
    c.id,
    c.stripe_customer_id,
    bu.id as bestauth_user_id
  FROM customers c
  JOIN auth.users u ON u.id = c.id
  JOIN bestauth_users bu ON bu.email = u.email
)
INSERT INTO bestauth_customers (
  id,
  user_id,
  stripe_customer_id
)
SELECT 
  gen_random_uuid() as id,
  bestauth_user_id as user_id,
  stripe_customer_id
FROM customer_data
WHERE stripe_customer_id IS NOT NULL
ON CONFLICT (stripe_customer_id) DO UPDATE SET
  user_id = EXCLUDED.user_id;

-- Step 7: Migrate prices
INSERT INTO bestauth_prices (
  id,
  product_id,
  active,
  description,
  unit_amount,
  currency,
  type,
  interval,
  interval_count,
  trial_period_days,
  metadata
)
SELECT 
  id,
  product_id,
  active,
  description,
  unit_amount,
  currency,
  type,
  interval,
  interval_count,
  trial_period_days,
  metadata
FROM prices
ON CONFLICT (id) DO NOTHING;

-- Step 8: Migrate products
INSERT INTO bestauth_products (
  id,
  active,
  name,
  description,
  image,
  metadata
)
SELECT 
  id,
  active,
  name,
  description,
  image,
  metadata
FROM products
ON CONFLICT (id) DO NOTHING;

-- Step 9: Display migration results
SELECT 
  'Migration Summary' as info,
  (SELECT count(*) FROM bestauth_users) as total_users,
  (SELECT count(*) FROM bestauth_subscriptions) as total_subscriptions,
  (SELECT count(*) FROM bestauth_customers) as total_customers,
  (SELECT count(*) FROM supabase_bestauth_user_mapping) as mapped_users;

-- Step 10: Show subscriptions that need Stripe customer IDs
SELECT 
  bu.email,
  bs.id as subscription_id,
  bs.status,
  bs.stripe_customer_id,
  bs.stripe_subscription_id,
  'Needs Stripe Customer ID' as action_required
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bu.id = bs.user_id
WHERE bs.status IN ('active', 'trialing')
  AND bs.stripe_customer_id IS NULL;