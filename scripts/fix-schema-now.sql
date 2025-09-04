-- First, let's see what columns currently exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- If you see columns like 'date' and 'generation_count', run this to fix:

-- Step 1: Backup existing data
CREATE TABLE IF NOT EXISTS user_usage_backup AS SELECT * FROM user_usage;

-- Step 2: Drop the old table
DROP TABLE IF EXISTS user_usage CASCADE;

-- Step 3: Create table with correct schema
CREATE TABLE user_usage (
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

-- Step 4: Create index
CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month_key);

-- Step 5: Migrate data from backup if it exists
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
ON CONFLICT (user_id, month_key) DO NOTHING;

-- Step 6: Drop backup table
DROP TABLE IF EXISTS user_usage_backup;

-- Step 7: Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policy
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Step 9: Grant permissions
GRANT ALL ON user_usage TO service_role;

-- Step 10: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the new schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;