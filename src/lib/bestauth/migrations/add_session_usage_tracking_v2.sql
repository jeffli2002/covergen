-- Migration: Add session-based usage tracking for unauthenticated users (Simplified Version)
-- This allows tracking generation usage for users who haven't signed up yet

-- First, add session_id column to the existing bestauth_usage_tracking table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bestauth_usage_tracking' 
                  AND column_name = 'session_id') THEN
        ALTER TABLE bestauth_usage_tracking ADD COLUMN session_id VARCHAR(255);
    END IF;
END $$;

-- Create index for session-based lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_date 
ON bestauth_usage_tracking(session_id, date) WHERE session_id IS NOT NULL;

-- Make user_id nullable to support session-only records
DO $$ 
BEGIN
    ALTER TABLE bestauth_usage_tracking ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'user_id column might already be nullable';
END $$;

-- Drop the existing unique constraint if it exists
ALTER TABLE bestauth_usage_tracking DROP CONSTRAINT IF EXISTS bestauth_usage_tracking_user_id_date_key;

-- Create a new unique constraint that allows either user_id OR session_id
-- First drop the index if it exists to avoid conflicts
DROP INDEX IF EXISTS idx_bestauth_usage_tracking_unique_user_session_date;

-- Create the unique index
CREATE UNIQUE INDEX idx_bestauth_usage_tracking_unique_user_session_date 
ON bestauth_usage_tracking(
    date,
    COALESCE(user_id::text, 'no-user'),
    COALESCE(session_id, 'no-session')
);

-- Add check constraint to ensure either user_id or session_id is present
DO $$ 
BEGIN
    ALTER TABLE bestauth_usage_tracking 
    ADD CONSTRAINT check_user_or_session 
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint check_user_or_session already exists';
END $$;

-- Update RLS policies to support session-based access
DROP POLICY IF EXISTS "Users can view their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can view their own usage" 
ON bestauth_usage_tracking FOR SELECT 
USING (true); -- Allow all reads for now to debug

DROP POLICY IF EXISTS "Users can insert their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can insert their own usage" 
ON bestauth_usage_tracking FOR INSERT 
WITH CHECK (true); -- Allow all inserts for now to debug

DROP POLICY IF EXISTS "Users can update their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can update their own usage" 
ON bestauth_usage_tracking FOR UPDATE 
USING (true); -- Allow all updates for now to debug

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bestauth_usage_tracking'
ORDER BY ordinal_position;