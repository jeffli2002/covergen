-- Migration: Add session-based usage tracking for unauthenticated users
-- This allows tracking generation usage for users who haven't signed up yet

-- First, add session_id column to the existing bestauth_usage_tracking table
-- This allows tracking usage by session ID for unauthenticated users
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Create index for session-based lookups
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_date 
ON bestauth_usage_tracking(session_id, date) WHERE session_id IS NOT NULL;

-- Drop the existing unique constraint that requires user_id
ALTER TABLE bestauth_usage_tracking DROP CONSTRAINT IF EXISTS bestauth_usage_tracking_user_id_date_key;

-- Create a new unique constraint that allows either user_id OR session_id
-- This ensures one record per user/session per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_unique_user_session_date 
ON bestauth_usage_tracking(date, COALESCE(user_id::text, ''), COALESCE(session_id, ''));

-- Make user_id nullable to support session-only records
ALTER TABLE bestauth_usage_tracking 
ALTER COLUMN user_id DROP NOT NULL;

-- Add check constraint to ensure either user_id or session_id is present
ALTER TABLE bestauth_usage_tracking 
ADD CONSTRAINT check_user_or_session 
CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- Update RLS policies to support session-based access
DROP POLICY IF EXISTS "Users can view their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can view their own usage" 
ON bestauth_usage_tracking FOR SELECT 
USING (
    (auth.uid()::text = user_id::text) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can insert their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can insert their own usage" 
ON bestauth_usage_tracking FOR INSERT 
WITH CHECK (
    (auth.uid()::text = user_id::text) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

DROP POLICY IF EXISTS "Users can update their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can update their own usage" 
ON bestauth_usage_tracking FOR UPDATE 
USING (
    (auth.uid()::text = user_id::text) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
);

-- Add cleanup policy (optional - removes sessions older than 30 days)
-- This can be run periodically to clean up old session data
-- DELETE FROM bestauth_usage_tracking WHERE session_id IS NOT NULL AND updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days';