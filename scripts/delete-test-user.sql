-- Delete test user 994235892@qq.com from BestAuth tables
-- Run this in Supabase SQL Editor

-- First, check which BestAuth tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'bestauth_%'
ORDER BY table_name;

-- Check if user exists
SELECT id, email FROM bestauth_users WHERE email = '994235892@qq.com';

-- Delete from existing related tables (run these one by one if needed)
-- Sessions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_sessions') THEN
    DELETE FROM bestauth_sessions WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');
  END IF;
END $$;

-- Subscriptions
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_subscriptions') THEN
    DELETE FROM bestauth_subscriptions WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');
  END IF;
END $$;

-- Usage tracking
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_usage_tracking') THEN
    DELETE FROM bestauth_usage_tracking WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');
  END IF;
END $$;

-- OAuth accounts
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_oauth_accounts') THEN
    DELETE FROM bestauth_oauth_accounts WHERE user_id = (SELECT id FROM bestauth_users WHERE email = '994235892@qq.com');
  END IF;
END $$;

-- Magic links
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_magic_links') THEN
    DELETE FROM bestauth_magic_links WHERE email = '994235892@qq.com';
  END IF;
END $$;

-- Finally delete the user
DELETE FROM bestauth_users WHERE email = '994235892@qq.com';

-- Verify deletion
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM bestauth_users WHERE email = '994235892@qq.com') 
    THEN 'User still exists - deletion failed!' 
    ELSE 'User successfully deleted!' 
  END as result;