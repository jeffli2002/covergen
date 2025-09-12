-- Comprehensive fix for all subscription issues (v2 - handles missing columns)

-- 1. First ensure user_usage table has all required columns
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS daily_generation_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_usage_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_date DATE;

-- 2. Ensure Jeff has a proper trial subscription
DO $$
DECLARE
    v_user_id UUID;
    v_columns TEXT;
BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'jefflee2002@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO subscriptions_consolidated (
            user_id,
            tier,
            status,
            daily_limit,
            trial_started_at,
            expires_at,
            current_period_start,
            current_period_end,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'pro',
            'trialing',
            4,
            NOW(),
            NOW() + INTERVAL '3 days',
            NOW(),
            NOW() + INTERVAL '3 days',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            tier = 'pro',
            status = 'trialing',
            daily_limit = 4,
            trial_started_at = COALESCE(subscriptions_consolidated.trial_started_at, NOW()),
            expires_at = NOW() + INTERVAL '3 days',
            current_period_start = NOW(),
            current_period_end = NOW() + INTERVAL '3 days',
            updated_at = NOW();
            
        -- Check which columns exist in user_usage
        SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) INTO v_columns
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'user_usage'
        AND column_name IN ('user_id', 'month_key', 'usage_count', 'created_at', 'updated_at');
        
        -- Insert user_usage record with only existing columns
        EXECUTE format('
            INSERT INTO user_usage (%s)
            VALUES ($1, $2, 0, NOW(), NOW())
            ON CONFLICT (user_id, month_key) DO NOTHING',
            v_columns
        ) USING v_user_id, TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    END IF;
END $$;

-- 3. Drop and recreate views with all columns needed by frontend
DROP VIEW IF EXISTS public.subscriptions CASCADE;
DROP VIEW IF EXISTS public.user_subscriptions CASCADE;

-- 4. Create comprehensive subscriptions view
CREATE VIEW public.subscriptions AS
SELECT 
  id,
  user_id,
  creem_subscription_id,
  tier,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at,
  expires_at as trial_ends_at,
  CASE 
    WHEN tier = 'pro' THEN 'pro'
    WHEN tier = 'pro_plus' THEN 'pro-plus'
    ELSE 'free'
  END as plan_id,
  trial_started_at as trial_start,
  trial_ended_at as trial_end,
  stripe_subscription_id,
  stripe_customer_id
FROM public.subscriptions_consolidated;

-- 5. Create user_subscriptions view
CREATE VIEW public.user_subscriptions AS
SELECT 
  id,
  user_id,
  tier as plan_type,
  status,
  daily_limit,
  created_at,
  updated_at,
  expires_at,
  cancel_at_period_end,
  creem_customer_id,
  current_period_start,
  current_period_end,
  metadata,
  creem_subscription_id
FROM public.subscriptions_consolidated;

-- 6. Create INSTEAD OF triggers for views
CREATE OR REPLACE FUNCTION handle_subscriptions_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions_consolidated (
    user_id,
    tier,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    creem_subscription_id,
    stripe_subscription_id,
    stripe_customer_id,
    trial_started_at,
    expires_at,
    daily_limit
  ) VALUES (
    NEW.user_id,
    NEW.tier,
    NEW.status,
    NEW.current_period_start,
    NEW.current_period_end,
    NEW.cancel_at_period_end,
    NEW.creem_subscription_id,
    NEW.stripe_subscription_id,
    NEW.stripe_customer_id,
    CASE WHEN NEW.status = 'trialing' THEN COALESCE(NEW.trial_start, NOW()) ELSE NULL END,
    CASE WHEN NEW.status = 'trialing' THEN COALESCE(NEW.trial_ends_at, NOW() + INTERVAL '3 days') ELSE NULL END,
    CASE
      WHEN NEW.tier = 'free' THEN 3
      WHEN NEW.tier = 'pro' AND NEW.status = 'trialing' THEN 4
      WHEN NEW.tier = 'pro' AND NEW.status != 'trialing' THEN 999
      WHEN NEW.tier = 'pro_plus' AND NEW.status = 'trialing' THEN 6
      WHEN NEW.tier = 'pro_plus' AND NEW.status != 'trialing' THEN 999
      ELSE 3
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    creem_subscription_id = COALESCE(EXCLUDED.creem_subscription_id, subscriptions_consolidated.creem_subscription_id),
    stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscriptions_consolidated.stripe_subscription_id),
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions_consolidated.stripe_customer_id),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_instead_insert ON public.subscriptions;
CREATE TRIGGER subscriptions_instead_insert
  INSTEAD OF INSERT ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscriptions_insert();

CREATE OR REPLACE FUNCTION handle_user_subscriptions_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions_consolidated (
    user_id,
    tier,
    status,
    daily_limit,
    expires_at,
    cancel_at_period_end,
    creem_customer_id,
    creem_subscription_id,
    current_period_start,
    current_period_end,
    metadata
  ) VALUES (
    NEW.user_id,
    NEW.plan_type,
    NEW.status,
    COALESCE(NEW.daily_limit, 3),
    NEW.expires_at,
    NEW.cancel_at_period_end,
    NEW.creem_customer_id,
    NEW.creem_subscription_id,
    NEW.current_period_start,
    NEW.current_period_end,
    NEW.metadata
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tier = EXCLUDED.tier,
    status = EXCLUDED.status,
    daily_limit = EXCLUDED.daily_limit,
    expires_at = EXCLUDED.expires_at,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    creem_customer_id = EXCLUDED.creem_customer_id,
    creem_subscription_id = EXCLUDED.creem_subscription_id,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_subscriptions_instead_insert ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_instead_insert
  INSTEAD OF INSERT ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_subscriptions_insert();

-- 7. Grant permissions
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT INSERT, UPDATE ON public.user_subscriptions TO authenticated;

-- 8. Create the set_subscription_config function if missing
CREATE OR REPLACE FUNCTION set_subscription_config(p_config JSONB)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.subscription_config', p_config::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_subscription_config TO authenticated;

-- 9. Test everything works
SELECT 
    'Final Check - Jeff Function' as test_type,
    u.email,
    (check_generation_limit(u.id))::jsonb as result
FROM auth.users u
WHERE u.email = 'jefflee2002@gmail.com';

SELECT 
    'Final Check - Jeff Consolidated' as test_type,
    u.email,
    sc.tier,
    sc.status,
    sc.daily_limit,
    sc.trial_started_at,
    sc.expires_at
FROM subscriptions_consolidated sc
JOIN auth.users u ON u.id = sc.user_id
WHERE u.email = 'jefflee2002@gmail.com';

SELECT 
    'Final Check - Jeff View' as test_type,
    u.email,
    s.tier,
    s.status,
    s.plan_id,
    s.trial_ends_at
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'jefflee2002@gmail.com';

SELECT 
    'Final Check - User Usage' as test_type,
    u.email,
    uu.user_id,
    uu.month_key,
    uu.usage_count,
    uu.created_at
FROM user_usage uu
JOIN auth.users u ON u.id = uu.user_id
WHERE u.email = 'jefflee2002@gmail.com'
AND uu.month_key = TO_CHAR(CURRENT_DATE, 'YYYY-MM');