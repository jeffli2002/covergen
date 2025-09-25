-- Check the actual columns in bestauth_users table
SELECT 
    ordinal_position,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bestauth_users'
ORDER BY ordinal_position;

-- Also check if supabase_id column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'bestauth_users' 
            AND column_name = 'supabase_id'
        ) THEN 'supabase_id column EXISTS'
        ELSE 'supabase_id column DOES NOT EXIST'
    END as column_status;

-- Check if metadata column exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'bestauth_users' 
            AND column_name = 'metadata'
        ) THEN 'metadata column EXISTS'
        ELSE 'metadata column DOES NOT EXIST'
    END as column_status;