-- Fix manual trial subscriptions that don't have payment information
-- These users need to go through checkout to continue their trial

-- 1. Identify manual trial users (no stripe_subscription_id)
CREATE OR REPLACE FUNCTION identify_manual_trials()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    tier VARCHAR(50),
    status VARCHAR(50),
    trial_started_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    has_creem_id BOOLEAN,
    has_stripe_id BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.user_id,
        u.email,
        sc.tier,
        sc.status,
        sc.trial_started_at,
        sc.expires_at,
        sc.creem_subscription_id IS NOT NULL as has_creem_id,
        sc.stripe_subscription_id IS NOT NULL as has_stripe_id
    FROM subscriptions_consolidated sc
    JOIN auth.users u ON sc.user_id = u.id
    WHERE sc.status = 'trialing'
    AND (sc.stripe_subscription_id IS NULL OR sc.creem_subscription_id IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- 2. View current manual trials
SELECT * FROM identify_manual_trials();

-- 3. Fix the data inconsistency for Jeff (has creem_id but no stripe_id)
-- This likely happened due to incomplete webhook processing
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get Jeff's user ID
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'jefflee2002@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Update Jeff's subscription to be consistent
        -- If he has creem_subscription_id, it should be moved to stripe_subscription_id
        UPDATE subscriptions_consolidated
        SET 
            stripe_subscription_id = creem_subscription_id,
            stripe_customer_id = creem_customer_id,
            creem_subscription_id = NULL,
            creem_customer_id = NULL,
            updated_at = NOW()
        WHERE user_id = v_user_id
        AND creem_subscription_id IS NOT NULL
        AND stripe_subscription_id IS NULL;
        
        RAISE NOTICE 'Fixed Jeff subscription ID mapping';
    END IF;
END $$;

-- 4. For users with NO payment IDs at all, we need to:
--    a) Mark their trial as requiring payment setup
--    b) Add metadata to track this
UPDATE subscriptions_consolidated
SET 
    metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{manual_trial}',
        'true'::jsonb
    ),
    metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{requires_payment_setup}',
        'true'::jsonb
    ),
    updated_at = NOW()
WHERE status = 'trialing'
AND stripe_subscription_id IS NULL
AND creem_subscription_id IS NULL;

-- 5. Create a function to check if a trial requires payment setup
CREATE OR REPLACE FUNCTION trial_requires_payment_setup(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_requires_setup BOOLEAN;
BEGIN
    SELECT 
        (metadata->>'requires_payment_setup')::boolean OR 
        (stripe_subscription_id IS NULL AND status = 'trialing')
    INTO v_requires_setup
    FROM subscriptions_consolidated
    WHERE user_id = p_user_id;
    
    RETURN COALESCE(v_requires_setup, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION trial_requires_payment_setup TO authenticated;

-- 7. Show the final state of trial users
SELECT 
    u.email,
    sc.tier,
    sc.status,
    sc.stripe_subscription_id IS NOT NULL as has_payment_method,
    sc.metadata->>'manual_trial' as is_manual_trial,
    sc.metadata->>'requires_payment_setup' as requires_payment_setup,
    EXTRACT(EPOCH FROM (sc.expires_at - NOW())) / 3600 as hours_remaining
FROM subscriptions_consolidated sc
JOIN auth.users u ON sc.user_id = u.id
WHERE sc.status = 'trialing'
ORDER BY sc.expires_at;

-- 8. Add comment explaining the fix
COMMENT ON FUNCTION trial_requires_payment_setup IS 'Checks if a trial user needs to complete payment setup. Manual trials created without going through checkout will return true.';

-- 9. Log the migration
INSERT INTO public.migrations_log (name, description, executed_at)
VALUES (
    '20250915_fix_manual_trials',
    'Fixed manual trial subscriptions without payment info. Marked them as requiring payment setup.',
    NOW()
)
ON CONFLICT DO NOTHING;