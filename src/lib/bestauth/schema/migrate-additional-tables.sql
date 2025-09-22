-- Additional Migration Script: Missing Tables from Supabase to BestAuth
-- This script handles tables not covered in the main migration

-- Start transaction for safety
BEGIN;

-- 1. Migrate anonymous usage data (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'anonymous_usage') THEN
    -- Create anonymous usage tracking table in BestAuth if needed
    CREATE TABLE IF NOT EXISTS bestauth_anonymous_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      anonymous_id VARCHAR(64) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      generation_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
      CONSTRAINT unique_anon_date UNIQUE(anonymous_id, date)
    );
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_bestauth_anonymous_usage_id_date ON bestauth_anonymous_usage(anonymous_id, date);
    
    -- Migrate data based on schema
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'anonymous_usage' AND column_name = 'month_key') THEN
      -- Month-based schema
      INSERT INTO bestauth_anonymous_usage (anonymous_id, date, generation_count, created_at, updated_at)
      SELECT 
        anonymous_id,
        (month_key || '-01')::date as date,
        usage_count,
        created_at,
        updated_at
      FROM public.anonymous_usage
      ON CONFLICT (anonymous_id, date) DO UPDATE SET
        generation_count = GREATEST(
          bestauth_anonymous_usage.generation_count,
          EXCLUDED.generation_count
        ),
        updated_at = GREATEST(
          bestauth_anonymous_usage.updated_at,
          EXCLUDED.updated_at
        );
      
      RAISE NOTICE 'Migrated % anonymous usage records', (SELECT COUNT(*) FROM public.anonymous_usage);
    END IF;
  ELSE
    RAISE NOTICE 'anonymous_usage table not found, skipping';
  END IF;
END $$;

-- 2. Check for user_subscriptions table (older version)
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
    SELECT COUNT(*) INTO row_count FROM public.user_subscriptions;
    
    IF row_count > 0 THEN
      -- Migrate from user_subscriptions if not already in subscriptions_consolidated
      INSERT INTO bestauth_subscriptions (
        user_id,
        tier,
        status,
        trial_started_at,
        expires_at,
        monthly_generation_limit,
        daily_generation_limit,
        metadata,
        created_at,
        updated_at
      )
      SELECT 
        us.user_id,
        COALESCE(us.plan_type::text, 'free')::bestauth.subscription_tier,
        COALESCE(us.status::text, 'active')::bestauth.subscription_status,
        -- Use created_at as trial_started_at if status indicates trial
        CASE 
          WHEN us.status = 'trialing' THEN us.created_at
          ELSE NULL
        END as trial_started_at,
        us.expires_at,
        -- Set generation limits based on tier
        CASE 
          WHEN us.plan_type = 'pro' THEN 500
          WHEN us.plan_type = 'pro_plus' THEN 2000
          ELSE 90
        END as monthly_generation_limit,
        CASE 
          WHEN us.plan_type = 'pro' THEN 1000
          WHEN us.plan_type = 'pro_plus' THEN 2000
          WHEN us.daily_limit IS NOT NULL THEN us.daily_limit
          ELSE 3
        END as daily_generation_limit,
        jsonb_build_object(
          'migrated_from', 'user_subscriptions',
          'migration_date', NOW(),
          'original_daily_limit', us.daily_limit
        ) as metadata,
        us.created_at,
        us.updated_at
      FROM public.user_subscriptions us
      WHERE us.user_id IS NOT NULL
        AND us.user_id IN (SELECT id FROM bestauth_users)
        -- Only migrate if not already migrated from subscriptions_consolidated
        AND NOT EXISTS (
          SELECT 1 FROM bestauth_subscriptions bs 
          WHERE bs.user_id = us.user_id 
          AND bs.metadata->>'migrated_from' = 'supabase'
        )
      ON CONFLICT (user_id) DO UPDATE SET
        tier = CASE 
          WHEN bestauth_subscriptions.metadata->>'migrated_from' = 'user_subscriptions' 
          THEN EXCLUDED.tier 
          ELSE bestauth_subscriptions.tier 
        END,
        status = CASE 
          WHEN bestauth_subscriptions.metadata->>'migrated_from' = 'user_subscriptions' 
          THEN EXCLUDED.status 
          ELSE bestauth_subscriptions.status 
        END,
        metadata = bestauth_subscriptions.metadata || EXCLUDED.metadata;
      
      RAISE NOTICE 'Migrated/updated % records from user_subscriptions', row_count;
    ELSE
      RAISE NOTICE 'user_subscriptions table is empty, skipping';
    END IF;
  ELSE
    RAISE NOTICE 'user_subscriptions table not found, skipping';
  END IF;
END $$;

-- 3. Create Stripe webhook events table if needed (for future webhook processing)
CREATE TABLE IF NOT EXISTS bestauth_stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bestauth_stripe_webhook_events_type ON bestauth_stripe_webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_bestauth_stripe_webhook_events_processed ON bestauth_stripe_webhook_events(processed);

-- 4. Create subscription events/history table for audit trail
CREATE TABLE IF NOT EXISTS bestauth_subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'cancelled', 'expired', 'trial_started', 'trial_ended'
  from_tier bestauth.subscription_tier,
  to_tier bestauth.subscription_tier,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_bestauth_subscription_events_user_id ON bestauth_subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_subscription_events_type ON bestauth_subscription_events(event_type);

-- 5. Migrate any existing Stripe customer data (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stripe_customers') THEN
    -- Update BestAuth subscriptions with additional Stripe customer info
    UPDATE bestauth_subscriptions bs
    SET metadata = bs.metadata || jsonb_build_object(
      'stripe_customer_email', sc.email,
      'stripe_customer_created', sc.created,
      'stripe_default_payment_method', sc.default_payment_method
    )
    FROM public.stripe_customers sc
    WHERE bs.stripe_customer_id = sc.id
      AND sc.default_payment_method IS NOT NULL;
    
    RAISE NOTICE 'Updated % subscriptions with Stripe customer data', 
      (SELECT COUNT(*) FROM bestauth_subscriptions WHERE stripe_customer_id IN (SELECT id FROM public.stripe_customers));
  END IF;
END $$;

-- 6. Summary of migration
DO $$
DECLARE
  user_count INTEGER;
  subscription_count INTEGER;
  usage_count INTEGER;
  anon_usage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM bestauth_users;
  SELECT COUNT(*) INTO subscription_count FROM bestauth_subscriptions;
  SELECT COUNT(DISTINCT user_id) INTO usage_count FROM bestauth_usage_tracking;
  SELECT COUNT(DISTINCT anonymous_id) INTO anon_usage_count 
  FROM bestauth_anonymous_usage 
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bestauth' AND table_name = 'bestauth_anonymous_usage');
  
  RAISE NOTICE '';
  RAISE NOTICE '=== BestAuth Migration Summary ===';
  RAISE NOTICE 'Total users migrated: %', user_count;
  RAISE NOTICE 'Total subscriptions: %', subscription_count;
  RAISE NOTICE 'Users with usage data: %', usage_count;
  RAISE NOTICE 'Anonymous users tracked: %', COALESCE(anon_usage_count, 0);
  RAISE NOTICE '';
  
  -- Check for potential issues
  RAISE NOTICE '=== Potential Issues to Review ===';
  
  -- Users without subscriptions
  PERFORM COUNT(*) FROM bestauth_users u 
  WHERE NOT EXISTS (SELECT 1 FROM bestauth_subscriptions s WHERE s.user_id = u.id);
  IF FOUND THEN
    RAISE NOTICE 'Users without subscriptions: %', 
      (SELECT COUNT(*) FROM bestauth_users u WHERE NOT EXISTS (SELECT 1 FROM bestauth_subscriptions s WHERE s.user_id = u.id));
  END IF;
  
  -- Active subscriptions without Stripe IDs
  PERFORM COUNT(*) FROM bestauth_subscriptions 
  WHERE status = 'active' AND tier != 'free' AND stripe_subscription_id IS NULL;
  IF FOUND THEN
    RAISE NOTICE 'Paid subscriptions without Stripe IDs: %', 
      (SELECT COUNT(*) FROM bestauth_subscriptions WHERE status = 'active' AND tier != 'free' AND stripe_subscription_id IS NULL);
  END IF;
END $$;

-- Commit transaction
COMMIT;