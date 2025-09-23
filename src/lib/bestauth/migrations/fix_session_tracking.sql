-- Fix session tracking migration - handles existing constraints

-- 1. Add session_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'bestauth_usage_tracking' 
                  AND column_name = 'session_id') THEN
        ALTER TABLE bestauth_usage_tracking ADD COLUMN session_id VARCHAR(255);
        RAISE NOTICE 'Added session_id column';
    ELSE
        RAISE NOTICE 'session_id column already exists';
    END IF;
END $$;

-- 2. Make user_id nullable if it isn't already
DO $$ 
BEGIN
    -- Check if user_id is nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bestauth_usage_tracking' 
               AND column_name = 'user_id' 
               AND is_nullable = 'NO') THEN
        ALTER TABLE bestauth_usage_tracking ALTER COLUMN user_id DROP NOT NULL;
        RAISE NOTICE 'Made user_id nullable';
    ELSE
        RAISE NOTICE 'user_id is already nullable';
    END IF;
END $$;

-- 3. Create index for session lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_date 
ON bestauth_usage_tracking(session_id, date) 
WHERE session_id IS NOT NULL;

-- 4. Drop and recreate the unique constraint
-- First, drop any existing constraints
ALTER TABLE bestauth_usage_tracking 
DROP CONSTRAINT IF EXISTS bestauth_usage_tracking_user_id_date_key;

DROP INDEX IF EXISTS idx_bestauth_usage_tracking_unique_user_session_date;
DROP INDEX IF EXISTS bestauth_usage_tracking_user_id_date_idx;
DROP INDEX IF EXISTS bestauth_usage_tracking_user_id_date_key;

-- Create new unique constraint
CREATE UNIQUE INDEX idx_bestauth_usage_tracking_unique_user_session_date 
ON bestauth_usage_tracking(
    date,
    COALESCE(user_id::text, 'no-user'),
    COALESCE(session_id, 'no-session')
);

-- 5. Check constraint already exists (skip if error)
DO $$ 
BEGIN
    -- Only add if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'check_user_or_session' 
                   AND conrelid = 'bestauth_usage_tracking'::regclass) THEN
        ALTER TABLE bestauth_usage_tracking 
        ADD CONSTRAINT check_user_or_session 
        CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);
        RAISE NOTICE 'Added check_user_or_session constraint';
    ELSE
        RAISE NOTICE 'check_user_or_session constraint already exists';
    END IF;
END $$;

-- 6. Test by inserting a session-only record
DO $$
DECLARE
    test_session_id VARCHAR(255) := 'test-' || extract(epoch from now())::text;
    test_date DATE := CURRENT_DATE;
BEGIN
    -- Try to insert a session-only record
    INSERT INTO bestauth_usage_tracking (session_id, date, generation_count, created_at, updated_at)
    VALUES (test_session_id, test_date, 0, NOW(), NOW());
    
    -- If successful, delete it
    DELETE FROM bestauth_usage_tracking 
    WHERE session_id = test_session_id AND date = test_date;
    
    RAISE NOTICE 'Session-only records are working correctly!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing session-only records: %', SQLERRM;
END $$;

-- 7. Show final table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bestauth_usage_tracking'
ORDER BY ordinal_position;