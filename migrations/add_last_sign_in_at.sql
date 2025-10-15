-- Add last_sign_in_at column to track user authorization activity
-- This addresses the issue where updated_at doesn't reflect sign-in events

-- Add column (works with both schema.table and underscore naming)
ALTER TABLE IF EXISTS bestauth.users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS bestauth_users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Create index for querying users by last sign-in time
CREATE INDEX IF NOT EXISTS idx_bestauth_users_last_sign_in ON bestauth.users(last_sign_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_bestauth_users_last_sign_in_2 ON bestauth_users(last_sign_in_at DESC);

-- Backfill existing users with their most recent session creation time (schema version)
UPDATE bestauth.users u
SET last_sign_in_at = (
  SELECT MAX(s.created_at)
  FROM bestauth.sessions s
  WHERE s.user_id = u.id
)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'bestauth' AND table_name = 'users')
  AND last_sign_in_at IS NULL;

-- Backfill existing users with their most recent session creation time (underscore version)
UPDATE bestauth_users u
SET last_sign_in_at = (
  SELECT MAX(s.created_at)
  FROM bestauth_sessions s
  WHERE s.user_id = u.id
)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bestauth_users')
  AND last_sign_in_at IS NULL;

-- Add comments
COMMENT ON COLUMN bestauth.users.last_sign_in_at IS 'Timestamp of the user''s most recent successful authentication (sign-in)';
COMMENT ON COLUMN bestauth_users.last_sign_in_at IS 'Timestamp of the user''s most recent successful authentication (sign-in)';
