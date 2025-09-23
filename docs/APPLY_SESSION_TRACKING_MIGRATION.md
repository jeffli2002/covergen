# Apply Session Tracking Migration

Since you're getting "Error: Unauthorized" when trying to run the SQL directly, here are alternative ways to apply the migration:

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Add session_id column if it doesn't exist
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Make user_id nullable to support session-only records
ALTER TABLE bestauth_usage_tracking 
ALTER COLUMN user_id DROP NOT NULL;

-- Create index for session lookups
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_date 
ON bestauth_usage_tracking(session_id, date) 
WHERE session_id IS NOT NULL;

-- Drop the old unique constraint
ALTER TABLE bestauth_usage_tracking 
DROP CONSTRAINT IF EXISTS bestauth_usage_tracking_user_id_date_key;

-- Create new unique constraint allowing either user_id OR session_id
DROP INDEX IF EXISTS idx_bestauth_usage_tracking_unique_user_session_date;

CREATE UNIQUE INDEX idx_bestauth_usage_tracking_unique_user_session_date 
ON bestauth_usage_tracking(
    date,
    COALESCE(user_id::text, 'no-user'),
    COALESCE(session_id, 'no-session')
);

-- Add check constraint
ALTER TABLE bestauth_usage_tracking 
DROP CONSTRAINT IF EXISTS check_user_or_session;

ALTER TABLE bestauth_usage_tracking 
ADD CONSTRAINT check_user_or_session 
CHECK (user_id IS NOT NULL OR session_id IS NOT NULL);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bestauth_usage_tracking'
ORDER BY ordinal_position;
```

4. Click **Run** to execute the migration

## Option 2: Using Node.js Script

Run the migration check script:

```bash
node scripts/apply-session-migration.js
```

This will:
- Check if the session_id column exists
- Test if session tracking works
- Give you specific SQL to run if needed

## Option 3: Using Environment Variables

If you have the database URL in your environment:

```bash
# First, check your environment variable
echo $BESTAUTH_DATABASE_URL

# If it's empty, you need to set it:
export BESTAUTH_DATABASE_URL="your-database-url-here"

# Then run the migration
psql "$BESTAUTH_DATABASE_URL" < src/lib/bestauth/migrations/add_session_usage_tracking_v2.sql
```

## Verifying the Migration

After applying the migration, test it:

1. **Clear browser cookies**
2. **Visit the test endpoint**: http://localhost:3000/api/test-session
3. **Check the response** - it should show:
   ```json
   {
     "sessionId": "some-uuid",
     "isNewSession": true,
     "currentUsage": 0,
     "canGenerate": true,
     "usesBestAuth": true
   }
   ```

4. **Make a POST request** to increment usage:
   ```bash
   curl -X POST http://localhost:3000/api/test-session
   ```

5. **Check usage again** - GET request should now show `currentUsage: 1`

## Troubleshooting

If session tracking still doesn't work after migration:

1. **Check browser cookies** - Look for `covergen_session_id` cookie
2. **Check server logs** - Look for messages starting with `[Generate API]`, `[DB]`, `[Usage Status]`
3. **Verify BestAuth is enabled** - Check that `USE_BESTAUTH=true` in your environment
4. **Check database connection** - Ensure `BESTAUTH_DATABASE_URL` is set correctly

## Manual Test

You can also test directly in SQL:

```sql
-- Insert a test session record
INSERT INTO bestauth_usage_tracking (session_id, date, generation_count, created_at, updated_at)
VALUES ('test-session-manual', CURRENT_DATE, 1, NOW(), NOW());

-- Check if it was inserted
SELECT * FROM bestauth_usage_tracking WHERE session_id = 'test-session-manual';

-- Clean up
DELETE FROM bestauth_usage_tracking WHERE session_id = 'test-session-manual';
```