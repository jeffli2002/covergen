-- Check what columns exist in user_usage table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_usage'
ORDER BY ordinal_position;