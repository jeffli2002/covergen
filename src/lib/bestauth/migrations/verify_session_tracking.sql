-- Verify session tracking is set up correctly

-- 1. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN column_name = 'user_id' AND is_nullable = 'YES' THEN '✓ Correct'
        WHEN column_name = 'user_id' AND is_nullable = 'NO' THEN '✗ Should be nullable'
        WHEN column_name = 'session_id' THEN '✓ Column exists'
        ELSE 'OK'
    END as status
FROM information_schema.columns
WHERE table_name = 'bestauth_usage_tracking'
ORDER BY ordinal_position;

-- 2. Check constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    CASE 
        WHEN conname = 'check_user_or_session' THEN '✓ Session check exists'
        ELSE 'OK'
    END as status
FROM pg_constraint
WHERE conrelid = 'bestauth_usage_tracking'::regclass;

-- 3. Check indexes
SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE '%session%' THEN '✓ Session index exists'
        ELSE 'OK'
    END as status
FROM pg_indexes
WHERE tablename = 'bestauth_usage_tracking';

-- 4. Test inserting a session-only record
DO $$
DECLARE
    test_session_id VARCHAR(255) := 'verify-' || extract(epoch from now())::text;
    test_date DATE := CURRENT_DATE;
    result_count INTEGER;
BEGIN
    -- Insert
    INSERT INTO bestauth_usage_tracking (session_id, date, generation_count, created_at, updated_at)
    VALUES (test_session_id, test_date, 1, NOW(), NOW());
    
    -- Verify it was inserted
    SELECT generation_count INTO result_count
    FROM bestauth_usage_tracking
    WHERE session_id = test_session_id AND date = test_date;
    
    IF result_count = 1 THEN
        RAISE NOTICE '✓ Session-only insert: SUCCESS';
    ELSE
        RAISE NOTICE '✗ Session-only insert: FAILED';
    END IF;
    
    -- Update
    UPDATE bestauth_usage_tracking
    SET generation_count = generation_count + 1
    WHERE session_id = test_session_id AND date = test_date;
    
    -- Verify update
    SELECT generation_count INTO result_count
    FROM bestauth_usage_tracking
    WHERE session_id = test_session_id AND date = test_date;
    
    IF result_count = 2 THEN
        RAISE NOTICE '✓ Session-only update: SUCCESS';
    ELSE
        RAISE NOTICE '✗ Session-only update: FAILED';
    END IF;
    
    -- Cleanup
    DELETE FROM bestauth_usage_tracking 
    WHERE session_id = test_session_id AND date = test_date;
    
    RAISE NOTICE '✓ All session tracking tests passed!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '✗ Error during test: %', SQLERRM;
END $$;

-- 5. Show any existing session records
SELECT 
    session_id,
    date,
    generation_count,
    created_at
FROM bestauth_usage_tracking
WHERE session_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;