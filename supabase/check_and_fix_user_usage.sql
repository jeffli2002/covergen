-- Check user_usage table structure first
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- Add missing columns if needed
ALTER TABLE user_usage 
ADD COLUMN IF NOT EXISTS daily_generation_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS trial_usage_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_generation_date DATE;