-- Simple test to check migration readiness

-- 1. Check if columns exist in bestauth_users
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bestauth_users'
ORDER BY ordinal_position;

-- 2. Check current users
SELECT 
  'BestAuth Users:' as info,
  email,
  created_at
FROM bestauth_users
ORDER BY created_at;

-- 3. Check Supabase users
SELECT 
  'Supabase Users:' as info,
  email,
  created_at
FROM auth.users
WHERE email IS NOT NULL
ORDER BY created_at;

-- 4. Check for email conflicts
SELECT 
  'Email Conflicts:' as info,
  email,
  'exists in both systems' as status
FROM (
  SELECT email FROM bestauth_users
  INTERSECT
  SELECT email FROM auth.users WHERE email IS NOT NULL
) conflicts;