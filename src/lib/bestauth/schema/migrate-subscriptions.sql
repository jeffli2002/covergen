-- Migration Script: Supabase to BestAuth Subscription Data
-- This script migrates all subscription data from Supabase tables to BestAuth tables
-- Run this after creating the BestAuth schema

-- Start transaction for safety
BEGIN;

-- 1. First ensure all Supabase users exist in BestAuth
INSERT INTO bestauth_users (id, email, email_verified, name, avatar_url, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(email_confirmed_at IS NOT NULL, false) as email_verified,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name') as name,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email_verified = EXCLUDED.email_verified,
  name = COALESCE(bestauth_users.name, EXCLUDED.name),
  avatar_url = COALESCE(bestauth_users.avatar_url, EXCLUDED.avatar_url),
  updated_at = EXCLUDED.updated_at
WHERE EXCLUDED.updated_at > bestauth_users.updated_at;

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Migrate user profiles
INSERT INTO bestauth_user_profiles (user_id, full_name, avatar_url, phone, metadata, created_at, updated_at)
SELECT 
  u.id as user_id,
  COALESCE(
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name',
    p.full_name
  ) as full_name,
  COALESCE(
    raw_user_meta_data->>'avatar_url',
    p.avatar_url
  ) as avatar_url,
  COALESCE(u.phone, p.phone) as phone,
  COALESCE(p.metadata, raw_user_meta_data) as metadata,
  COALESCE(p.created_at, u.created_at) as created_at,
  COALESCE(p.updated_at, u.updated_at) as updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id IN (SELECT user_id FROM public.subscriptions_consolidated)
ON CONFLICT (user_id) DO UPDATE SET
  full_name = COALESCE(EXCLUDED.full_name, bestauth_user_profiles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, bestauth_user_profiles.avatar_url),
  phone = COALESCE(EXCLUDED.phone, bestauth_user_profiles.phone),
  metadata = COALESCE(EXCLUDED.metadata, bestauth_user_profiles.metadata),
  updated_at = GREATEST(EXCLUDED.updated_at, bestauth_user_profiles.updated_at);

-- 4. Migrate subscriptions (CRITICAL - preserves all trial and billing data)
INSERT INTO bestauth_subscriptions (
  user_id,
  tier,
  status,
  stripe_customer_id,
  stripe_subscription_id,
  trial_started_at,
  trial_ended_at,
  trial_ends_at,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  cancel_at,
  cancelled_at,
  expires_at,
  monthly_generation_limit,
  daily_generation_limit,
  metadata,
  created_at,
  updated_at
)
SELECT 
  sc.user_id,
  COALESCE(sc.tier::text, 'free')::bestauth.subscription_tier,
  COALESCE(sc.status::text, 'active')::bestauth.subscription_status,
  sc.stripe_customer_id,
  sc.stripe_subscription_id,
  sc.trial_started_at,
  sc.trial_ended_at,
  sc.expires_at as trial_ends_at, -- Use expires_at as trial_ends_at
  sc.current_period_start,
  sc.current_period_end,
  COALESCE(sc.cancel_at_period_end, false),
  sc.canceled_at as cancel_at,
  sc.canceled_at as cancelled_at,
  sc.expires_at,
  -- Set generation limits based on tier
  CASE 
    WHEN sc.tier = 'pro' THEN 500
    WHEN sc.tier = 'pro_plus' THEN 2000
    ELSE 90
  END as monthly_generation_limit,
  CASE 
    WHEN sc.tier = 'pro' THEN 1000
    WHEN sc.tier = 'pro_plus' THEN 2000
    ELSE 3
  END as daily_generation_limit,
  -- Preserve any metadata
  jsonb_build_object(
    'migrated_from', 'supabase',
    'migration_date', NOW(),
    'original_metadata', sc.metadata
  ) as metadata,
  sc.created_at,
  sc.updated_at
FROM public.subscriptions_consolidated sc
WHERE sc.user_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  tier = EXCLUDED.tier,
  status = EXCLUDED.status,
  stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, bestauth_subscriptions.stripe_customer_id),
  stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, bestauth_subscriptions.stripe_subscription_id),
  trial_started_at = COALESCE(EXCLUDED.trial_started_at, bestauth_subscriptions.trial_started_at),
  trial_ended_at = COALESCE(EXCLUDED.trial_ended_at, bestauth_subscriptions.trial_ended_at),
  trial_ends_at = COALESCE(EXCLUDED.trial_ends_at, bestauth_subscriptions.trial_ends_at),
  current_period_start = COALESCE(EXCLUDED.current_period_start, bestauth_subscriptions.current_period_start),
  current_period_end = COALESCE(EXCLUDED.current_period_end, bestauth_subscriptions.current_period_end),
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  cancel_at = EXCLUDED.cancel_at,
  cancelled_at = EXCLUDED.cancelled_at,
  expires_at = EXCLUDED.expires_at,
  metadata = bestauth_subscriptions.metadata || EXCLUDED.metadata,
  updated_at = GREATEST(EXCLUDED.updated_at, bestauth_subscriptions.updated_at);

-- 5. Migrate usage data (if user_usage table exists)
DO $$
DECLARE
  has_date_column BOOLEAN;
  has_usage_date_column BOOLEAN;
  has_month_key_column BOOLEAN;
  has_generation_count_column BOOLEAN;
  has_generations_count_column BOOLEAN;
  has_usage_count_column BOOLEAN;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage') THEN
    -- Check which columns exist
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'date'
    ) INTO has_date_column;
    
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'usage_date'
    ) INTO has_usage_date_column;
    
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'month_key'
    ) INTO has_month_key_column;
    
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'generation_count'
    ) INTO has_generation_count_column;
    
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'generations_count'
    ) INTO has_generations_count_column;
    
    SELECT EXISTS(
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'usage_count'
    ) INTO has_usage_count_column;
    
    -- Migrate based on which columns exist
    IF has_date_column AND has_generation_count_column THEN
      -- Schema with date and generation_count columns
      INSERT INTO bestauth_usage_tracking (user_id, date, generation_count, created_at, updated_at)
      SELECT 
        user_id,
        date::date,
        generation_count,
        created_at,
        updated_at
      FROM public.user_usage
      WHERE user_id IN (SELECT id FROM bestauth_users)
      ON CONFLICT (user_id, date) DO UPDATE SET
        generation_count = GREATEST(
          bestauth_usage_tracking.generation_count,
          EXCLUDED.generation_count
        ),
        updated_at = GREATEST(
          bestauth_usage_tracking.updated_at,
          EXCLUDED.updated_at
        );
      RAISE NOTICE 'Migrated usage data from user_usage table (date/generation_count schema)';
    
    ELSIF has_usage_date_column AND has_generations_count_column THEN
      -- Schema with usage_date and generations_count columns
      INSERT INTO bestauth_usage_tracking (user_id, date, generation_count, created_at, updated_at)
      SELECT 
        user_id,
        usage_date::date,
        generations_count,
        created_at,
        updated_at
      FROM public.user_usage
      WHERE user_id IN (SELECT id FROM bestauth_users)
      ON CONFLICT (user_id, date) DO UPDATE SET
        generation_count = GREATEST(
          bestauth_usage_tracking.generation_count,
          EXCLUDED.generation_count
        ),
        updated_at = GREATEST(
          bestauth_usage_tracking.updated_at,
          EXCLUDED.updated_at
        );
      RAISE NOTICE 'Migrated usage data from user_usage table (usage_date/generations_count schema)';
    
    ELSIF has_month_key_column AND has_usage_count_column THEN
      -- Schema with month_key and usage_count columns (aggregate by month)
      INSERT INTO bestauth_usage_tracking (user_id, date, generation_count, created_at, updated_at)
      SELECT 
        user_id,
        -- Convert month_key to first day of month
        (month_key || '-01')::date as date,
        usage_count,
        created_at,
        updated_at
      FROM public.user_usage
      WHERE user_id IN (SELECT id FROM bestauth_users)
      ON CONFLICT (user_id, date) DO UPDATE SET
        generation_count = GREATEST(
          bestauth_usage_tracking.generation_count,
          EXCLUDED.generation_count
        ),
        updated_at = GREATEST(
          bestauth_usage_tracking.updated_at,
          EXCLUDED.updated_at
        );
      RAISE NOTICE 'Migrated usage data from user_usage table (month_key/usage_count schema)';
      
    ELSE
      RAISE NOTICE 'user_usage table has unexpected schema, skipping usage data migration';
    END IF;
  ELSE
    RAISE NOTICE 'user_usage table not found, skipping usage data migration';
  END IF;
END $$;

-- 6. Migrate payment history from Stripe webhooks/events (if stripe_invoices table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stripe_invoices') THEN
    INSERT INTO bestauth_payment_history (
      user_id,
      stripe_payment_intent_id,
      stripe_invoice_id,
      amount,
      currency,
      status,
      description,
      metadata,
      created_at
    )
    SELECT DISTINCT
      sc.user_id,
      inv.payment_intent as stripe_payment_intent_id,
      inv.id as stripe_invoice_id,
      inv.amount_paid as amount,
      UPPER(inv.currency) as currency,
      inv.status,
      COALESCE(inv.description, 'Subscription payment') as description,
      jsonb_build_object(
        'stripe_invoice_number', inv.number,
        'billing_reason', inv.billing_reason,
        'migrated_from', 'stripe_invoices'
      ) as metadata,
      to_timestamp(inv.created) as created_at
    FROM public.stripe_invoices inv
    JOIN public.subscriptions_consolidated sc ON sc.stripe_customer_id = inv.customer
    WHERE inv.status = 'paid'
      AND sc.user_id IS NOT NULL
      AND sc.user_id IN (SELECT id FROM bestauth_users)
    ON CONFLICT DO NOTHING; -- Avoid duplicates
    
    RAISE NOTICE 'Migrated payment history from stripe_invoices table';
  ELSE
    RAISE NOTICE 'stripe_invoices table not found, skipping payment history migration';
  END IF;
END $$;

-- 7. Create default free subscriptions for users without subscriptions
INSERT INTO bestauth_subscriptions (user_id, tier, status, created_at)
SELECT 
  u.id,
  'free'::bestauth.subscription_tier,
  'active'::bestauth.subscription_status,
  u.created_at
FROM bestauth_users u
LEFT JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- 8. Fix any OAuth account mappings
INSERT INTO bestauth_oauth_accounts (
  user_id,
  provider,
  provider_account_id,
  created_at
)
SELECT DISTINCT
  u.id as user_id,
  COALESCE(
    CASE 
      WHEN u.raw_app_meta_data->>'provider' = 'google' THEN 'google'
      WHEN u.raw_app_meta_data->>'provider' = 'github' THEN 'github'
      WHEN u.raw_user_meta_data->>'iss' LIKE '%google%' THEN 'google'
      ELSE NULL
    END,
    'email'
  ) as provider,
  COALESCE(
    u.raw_user_meta_data->>'sub',
    u.raw_user_meta_data->>'provider_id',
    u.id::text
  ) as provider_account_id,
  u.created_at
FROM auth.users u
WHERE u.id IN (SELECT id FROM bestauth_users)
  AND (
    u.raw_app_meta_data->>'provider' IS NOT NULL
    OR u.raw_user_meta_data->>'iss' IS NOT NULL
  )
ON CONFLICT (provider, provider_account_id) DO UPDATE SET
  user_id = EXCLUDED.user_id;

-- 9. Verify migration
DO $$
DECLARE
  supabase_count INTEGER;
  bestauth_count INTEGER;
  usage_count INTEGER;
BEGIN
  -- Count original subscriptions
  SELECT COUNT(*) INTO supabase_count FROM public.subscriptions_consolidated;
  
  -- Count migrated subscriptions
  SELECT COUNT(*) INTO bestauth_count FROM bestauth_subscriptions WHERE tier != 'free';
  
  -- Count usage records
  SELECT COUNT(DISTINCT user_id) INTO usage_count FROM bestauth_usage_tracking;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Original subscriptions: %', supabase_count;
  RAISE NOTICE '  Migrated subscriptions: %', bestauth_count;
  RAISE NOTICE '  Users with usage data: %', usage_count;
  
  -- Verify critical trial subscriptions
  RAISE NOTICE 'Trial subscriptions:';
  PERFORM COUNT(*) FROM bestauth_subscriptions WHERE status = 'trialing';
  GET DIAGNOSTICS bestauth_count = ROW_COUNT;
  RAISE NOTICE '  Active trials: %', bestauth_count;
END $$;

-- Commit transaction
COMMIT;

-- Additional verification queries (run manually after migration)
/*
-- Check trial subscriptions
SELECT 
  u.email,
  s.tier,
  s.status,
  s.trial_started_at,
  s.trial_ends_at,
  s.stripe_subscription_id
FROM bestauth_subscriptions s
JOIN bestauth_users u ON s.user_id = u.id
WHERE s.status = 'trialing'
ORDER BY s.trial_ends_at;

-- Check active paid subscriptions
SELECT 
  u.email,
  s.tier,
  s.status,
  s.current_period_end,
  s.cancel_at_period_end
FROM bestauth_subscriptions s
JOIN bestauth_users u ON s.user_id = u.id
WHERE s.tier IN ('pro', 'pro_plus')
  AND s.status = 'active'
ORDER BY s.current_period_end;

-- Check usage data migration
SELECT 
  u.email,
  COUNT(DISTINCT ut.date) as days_with_usage,
  SUM(ut.generation_count) as total_generations,
  MAX(ut.date) as last_usage_date
FROM bestauth_usage_tracking ut
JOIN bestauth_users u ON ut.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_generations DESC
LIMIT 20;
*/