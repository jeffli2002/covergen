-- Verification Script: Check data state before migration
-- Run this BEFORE the migration to understand the current state

-- 1. Check existing BestAuth users
SELECT 
  'Existing BestAuth Users' as check_type,
  count(*) as count,
  string_agg(email, ', ') as emails
FROM bestauth_users;

-- 2. Check Supabase users
SELECT 
  'Supabase Users' as check_type,
  count(*) as count,
  string_agg(email, ', ') as emails
FROM auth.users
WHERE email IS NOT NULL;

-- 3. Find users that exist in both systems
SELECT 
  'Users in Both Systems' as check_type,
  bu.email,
  bu.id as bestauth_id,
  u.id as supabase_id
FROM bestauth_users bu
JOIN auth.users u ON u.email = bu.email;

-- 4. Find users only in Supabase (need to be migrated)
SELECT 
  'Users Only in Supabase' as check_type,
  u.email,
  u.id as supabase_id
FROM auth.users u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM bestauth_users bu WHERE bu.email = u.email
  );

-- 5. Check existing subscriptions in Supabase
SELECT 
  'Supabase Subscriptions' as check_type,
  s.id,
  u.email,
  s.status,
  s.stripe_customer_id,
  s.stripe_subscription_id
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id;

-- 6. Check existing subscriptions in BestAuth
SELECT 
  'BestAuth Subscriptions' as check_type,
  bs.id,
  bu.email,
  bs.status,
  bs.stripe_customer_id,
  bs.stripe_subscription_id
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bu.id = bs.user_id;

-- 7. Check for duplicate emails
SELECT 
  'Duplicate Emails Check' as check_type,
  email,
  count(*) as count
FROM (
  SELECT email FROM bestauth_users
  UNION ALL
  SELECT email FROM auth.users WHERE email IS NOT NULL
) all_emails
GROUP BY email
HAVING count(*) > 1;