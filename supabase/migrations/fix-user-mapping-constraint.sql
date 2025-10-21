-- Fix user_id_mapping foreign key constraint
-- The constraint currently references a non-existent 'users' table
-- It should reference 'bestauth_users(id)'

-- Step 1: Check current constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'user_id_mapping'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Step 2: Drop incorrect constraint if it exists
ALTER TABLE user_id_mapping 
DROP CONSTRAINT IF EXISTS user_id_mapping_bestauth_user_id_fkey;

-- Step 3: Ensure bestauth_users table exists
-- (It should already exist, but verify)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'bestauth_users'
  ) THEN
    RAISE EXCEPTION 'bestauth_users table does not exist. Please run BestAuth migrations first.';
  END IF;
END
$$;

-- Step 4: Recreate constraint with correct reference
ALTER TABLE user_id_mapping
ADD CONSTRAINT user_id_mapping_bestauth_user_id_fkey 
FOREIGN KEY (bestauth_user_id) 
REFERENCES bestauth_users(id) 
ON DELETE CASCADE;

-- Step 5: Verify the fix
SELECT 
  tc.constraint_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'user_id_mapping'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name = 'user_id_mapping_bestauth_user_id_fkey';

-- Step 6: Verify supabase_user_id constraint also exists
ALTER TABLE user_id_mapping
DROP CONSTRAINT IF EXISTS user_id_mapping_supabase_user_id_fkey;

ALTER TABLE user_id_mapping
ADD CONSTRAINT user_id_mapping_supabase_user_id_fkey 
FOREIGN KEY (supabase_user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'user_id_mapping constraints fixed successfully';
END
$$;
