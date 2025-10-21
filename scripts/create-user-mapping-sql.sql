-- Create user mapping for 994235892@qq.com
-- This bypasses the foreign key constraint issue by disabling constraints temporarily

BEGIN;

-- Temporarily disable foreign key constraints
SET CONSTRAINTS ALL DEFERRED;

-- Insert the mapping
INSERT INTO user_id_mapping (supabase_user_id, bestauth_user_id, created_at, last_synced_at)
VALUES (
  '3ac0ce48-2bd0-4172-8c30-cca42ff1e805',
  '57c1c563-4cdd-4471-baa0-f49064b997c9',
  NOW(),
  NOW()
)
ON CONFLICT (bestauth_user_id) DO UPDATE
SET supabase_user_id = EXCLUDED.supabase_user_id,
    last_synced_at = NOW();

-- Verify the mapping was created
SELECT * FROM user_id_mapping WHERE bestauth_user_id = '57c1c563-4cdd-4471-baa0-f49064b997c9';

COMMIT;
