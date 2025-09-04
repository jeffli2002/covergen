# URGENT: Fix Database Schema Error

You're seeing the error: **"column user_usage.usage_count does not exist"**

## Quick Fix Instructions

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy ALL the SQL below and paste it:

```sql
-- Fix user_usage table schema conflict
-- This migration transitions from the old schema (date, generation_count) to the new schema (month_key, usage_count)

-- First, check if the old user_usage table exists with the old schema
DO $$
BEGIN
    -- Check if user_usage table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage') THEN
        -- Check if it has the old columns
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_usage' AND column_name = 'generation_count') THEN
            -- Backup existing data
            CREATE TABLE IF NOT EXISTS user_usage_backup AS SELECT * FROM user_usage;
            
            -- Drop the old table
            DROP TABLE user_usage CASCADE;
            
            -- Create the new table with the correct schema
            CREATE TABLE IF NOT EXISTS user_usage (
                id BIGSERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                month_key VARCHAR(7) NOT NULL, -- Format: YYYY-MM
                usage_count INTEGER NOT NULL DEFAULT 0,
                subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
                last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                
                -- Unique constraint to ensure one record per user per month
                UNIQUE(user_id, month_key)
            );
            
            -- Create index for faster lookups
            CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month_key);
            
            -- Migrate data from backup if it exists
            IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage_backup') THEN
                INSERT INTO user_usage (user_id, month_key, usage_count, created_at, updated_at, last_used_at)
                SELECT 
                    user_id,
                    TO_CHAR(date, 'YYYY-MM') as month_key,
                    SUM(generation_count) as usage_count,
                    MIN(created_at) as created_at,
                    MAX(updated_at) as updated_at,
                    MAX(updated_at) as last_used_at
                FROM user_usage_backup
                GROUP BY user_id, TO_CHAR(date, 'YYYY-MM')
                ON CONFLICT (user_id, month_key) DO UPDATE SET
                    usage_count = user_usage.usage_count + EXCLUDED.usage_count,
                    last_used_at = EXCLUDED.last_used_at,
                    updated_at = NOW();
                
                -- Drop the backup table
                DROP TABLE user_usage_backup;
            END IF;
        END IF;
    ELSE
        -- Table doesn't exist, create it with the correct schema
        CREATE TABLE IF NOT EXISTS user_usage (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            month_key VARCHAR(7) NOT NULL, -- Format: YYYY-MM
            usage_count INTEGER NOT NULL DEFAULT 0,
            subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
            last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            
            -- Unique constraint to ensure one record per user per month
            UNIQUE(user_id, month_key)
        );
        
        -- Create index for faster lookups
        CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month_key);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own usage
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions to service role
GRANT ALL ON user_usage TO service_role;
GRANT ALL ON SEQUENCE user_usage_id_seq TO service_role;

-- Create or replace the updated trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run**

### Option 2: Check Current Schema

If you want to see what columns your table currently has, run this query in SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;
```

## Temporary Fix Applied

I've updated your `authService.ts` to handle both the old and new schema formats. This means your app will work regardless of which schema is currently in your database. However, you should still apply the migration above for a permanent fix.

## After Migration

Once you've run the migration:
1. Refresh your application
2. The errors should stop appearing
3. Usage tracking will work correctly

## Need Help?

Run this command to check your database status:
```bash
node scripts/check-and-fix-usage-tables.js
```