-- Delete test user 994235892@qq.com from BestAuth tables
-- Run this in Supabase SQL Editor

-- First, get the user ID
WITH user_to_delete AS (
  SELECT id FROM bestauth_users WHERE email = '994235892@qq.com'
)

-- Delete from all related tables
DELETE FROM bestauth_sessions WHERE user_id IN (SELECT id FROM user_to_delete);
DELETE FROM bestauth_subscriptions WHERE user_id IN (SELECT id FROM user_to_delete);
DELETE FROM bestauth_usage_tracking WHERE user_id IN (SELECT id FROM user_to_delete);
DELETE FROM bestauth_oauth_accounts WHERE user_id IN (SELECT id FROM user_to_delete);
DELETE FROM bestauth_password_reset_tokens WHERE user_id IN (SELECT id FROM user_to_delete);
DELETE FROM bestauth_magic_links WHERE email = '994235892@qq.com';

-- Finally delete the user
DELETE FROM bestauth_users WHERE email = '994235892@qq.com';

-- Verify deletion
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM bestauth_users WHERE email = '994235892@qq.com') 
    THEN 'User still exists - deletion failed!' 
    ELSE 'User successfully deleted!' 
  END as result;