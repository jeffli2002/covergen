-- STEP 1: First check what we're dealing with
SELECT 'Current user_usage columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- STEP 2: Check if backup table exists and its columns
SELECT 'Backup table columns (if exists):' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage_backup'
ORDER BY ordinal_position;

-- STEP 3: Drop any existing backup table
DROP TABLE IF EXISTS user_usage_backup;

-- STEP 4: Drop the problematic user_usage table
DROP TABLE IF EXISTS user_usage CASCADE;

-- STEP 5: Create fresh table with correct schema
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

-- STEP 6: Create index
CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month_key);

-- STEP 7: Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create policy
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- STEP 9: Grant permissions
GRANT ALL ON user_usage TO service_role;

-- STEP 10: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Verify the new schema
SELECT 'New user_usage columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- STEP 12: Insert a test record to verify everything works
INSERT INTO user_usage (user_id, month_key, usage_count, subscription_tier)
VALUES ('4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a', '2025-09', 0, 'free')
ON CONFLICT (user_id, month_key) DO NOTHING;

SELECT 'Setup complete! Table should now work correctly.' as status;