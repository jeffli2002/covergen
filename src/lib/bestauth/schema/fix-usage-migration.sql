-- Fix usage data migration - ensure all users are migrated

-- First, let's check what's missing
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM public.user_usage uu
    WHERE NOT EXISTS (
        SELECT 1 FROM bestauth_usage_tracking but 
        WHERE but.user_id = uu.user_id 
        AND but.date = (uu.month_key || '-01')::date
    );
    
    RAISE NOTICE 'Found % missing usage records', missing_count;
END $$;

-- Migrate missing usage data
INSERT INTO bestauth_usage_tracking (user_id, date, generation_count, created_at, updated_at)
SELECT 
    uu.user_id,
    (uu.month_key || '-01')::date as date,
    uu.usage_count as generation_count,
    uu.created_at,
    uu.updated_at
FROM public.user_usage uu
WHERE NOT EXISTS (
    SELECT 1 FROM bestauth_usage_tracking but 
    WHERE but.user_id = uu.user_id 
    AND but.date = (uu.month_key || '-01')::date
)
ON CONFLICT (user_id, date) DO UPDATE SET
    generation_count = GREATEST(
        bestauth_usage_tracking.generation_count,
        EXCLUDED.generation_count
    ),
    updated_at = GREATEST(
        bestauth_usage_tracking.updated_at,
        EXCLUDED.updated_at
    );

-- Verify the migration
SELECT 'After migration:' as status;
SELECT COUNT(*) as total_rows FROM bestauth_usage_tracking;

-- Show all migrated data
SELECT 
    user_id,
    date,
    generation_count,
    created_at::date as created_date
FROM bestauth_usage_tracking
ORDER BY user_id, date;