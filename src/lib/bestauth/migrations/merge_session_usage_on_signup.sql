-- Migration: Merge session usage with user usage on signup
-- This ensures that when an unauthenticated user signs up, their previous session usage
-- is transferred to their new user account, preventing them from getting additional free generations

-- Create a function to merge session usage into user usage
CREATE OR REPLACE FUNCTION merge_session_usage_to_user(
    p_user_id UUID,
    p_session_id VARCHAR(255)
) RETURNS void AS $$
DECLARE
    v_session_usage RECORD;
BEGIN
    -- Check if both user_id and session_id are provided
    IF p_user_id IS NULL OR p_session_id IS NULL THEN
        RETURN;
    END IF;

    -- Loop through all session usage records and merge with user records
    FOR v_session_usage IN 
        SELECT date, generation_count 
        FROM bestauth_usage_tracking 
        WHERE session_id = p_session_id 
          AND user_id IS NULL -- Only get pure session records
    LOOP
        -- First check if user already has a record for this date
        INSERT INTO bestauth_usage_tracking (
            user_id, 
            date, 
            generation_count,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            v_session_usage.date,
            v_session_usage.generation_count,
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id, date)
        DO UPDATE SET
            generation_count = bestauth_usage_tracking.generation_count + EXCLUDED.generation_count,
            updated_at = NOW();
    END LOOP;

    -- Mark session records as transferred by adding user_id
    -- This preserves history while preventing double counting
    UPDATE bestauth_usage_tracking
    SET user_id = p_user_id,
        updated_at = NOW()
    WHERE session_id = p_session_id
      AND user_id IS NULL;

END;
$$ LANGUAGE plpgsql;

-- Create an index to improve performance of session lookups
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_lookup 
ON bestauth_usage_tracking(session_id) 
WHERE session_id IS NOT NULL AND user_id IS NULL;

-- Grant execute permission to the application role
GRANT EXECUTE ON FUNCTION merge_session_usage_to_user(UUID, VARCHAR(255)) TO authenticated;
GRANT EXECUTE ON FUNCTION merge_session_usage_to_user(UUID, VARCHAR(255)) TO anon;