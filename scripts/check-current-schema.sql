-- Check current schema of user_usage table
-- Run this in your Supabase SQL Editor to see what columns exist

SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_usage'
ORDER BY ordinal_position;

-- Also show a sample of data if any exists
SELECT * FROM user_usage LIMIT 5;