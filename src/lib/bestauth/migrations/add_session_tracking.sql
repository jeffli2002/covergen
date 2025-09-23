-- Add session_id column and make user_id nullable in bestauth_usage_tracking table
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ALTER COLUMN user_id DROP NOT NULL;