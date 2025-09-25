-- Comprehensive check of both auth systems

-- 1. Show all BestAuth users with details
SELECT 
  'BESTAUTH USERS' as system,
  id,
  email,
  email_verified,
  created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM bestauth_subscriptions bs WHERE bs.user_id = bu.id) 
    THEN 'Has subscription'
    ELSE 'No subscription'
  END as subscription_status
FROM bestauth_users bu
ORDER BY created_at;

-- 2. Show all Supabase users with details
SELECT 
  'SUPABASE USERS' as system,
  id,
  email,
  email_confirmed_at IS NOT NULL as email_verified,
  created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id) 
    THEN 'Has subscription'
    ELSE 'No subscription'
  END as subscription_status
FROM auth.users u
WHERE email IS NOT NULL
ORDER BY created_at;

-- 3. Show subscription details from Supabase
SELECT 
  'SUPABASE SUBSCRIPTIONS' as system,
  s.id as subscription_id,
  u.email,
  s.status,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.current_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
ORDER BY s.created_at;

-- 4. Show subscription details from BestAuth
SELECT 
  'BESTAUTH SUBSCRIPTIONS' as system,
  bs.id as subscription_id,
  bu.email,
  bs.status,
  bs.stripe_customer_id,
  bs.stripe_subscription_id,
  bs.current_period_end
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bs.user_id = bu.id
ORDER BY bs.created_at;

-- 5. Check which columns exist in bestauth_users
SELECT 
  'BESTAUTH_USERS COLUMNS' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'bestauth_users'
  AND column_name IN ('id', 'email', 'supabase_id', 'metadata')
ORDER BY ordinal_position;