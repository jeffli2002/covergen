# BestAuth Migration Instructions

## Overview
The migration encountered a duplicate email error because the email `994235892@qq.com` already exists in the BestAuth users table. The fixed migration script properly handles this scenario.

## Step-by-Step Migration Process

### 1. First, run the verification script to check current state:
```sql
-- In Supabase SQL editor, run:
-- verify-before-migration.sql
```

This will show you:
- Which users exist in both systems
- Which users need to be migrated
- Current subscription states
- Any duplicate email issues

### 2. Run the fixed migration script:
```sql
-- In Supabase SQL editor, run:
-- migrate-subscriptions-fixed.sql
```

This script:
- Updates existing BestAuth users with their Supabase IDs
- Inserts only new users that don't exist in BestAuth
- Creates a mapping table for user ID references
- Migrates all subscriptions with proper user mapping
- Handles duplicate emails gracefully

### 3. Run the update subscription fields script:
```sql
-- In Supabase SQL editor, run:
-- update-subscription-stripe-fields.sql
```

This updates any missing Stripe customer IDs and subscription IDs.

### 4. Verify the migration:
```sql
-- Check migration results
SELECT 
  (SELECT count(*) FROM bestauth_users) as bestauth_users,
  (SELECT count(*) FROM bestauth_subscriptions) as bestauth_subscriptions,
  (SELECT count(*) FROM supabase_bestauth_user_mapping) as user_mappings;

-- Check for any subscriptions without Stripe IDs
SELECT bu.email, bs.status, bs.stripe_customer_id
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bu.id = bs.user_id
WHERE bs.status IN ('active', 'trialing')
  AND bs.stripe_customer_id IS NULL;
```

## Troubleshooting

### If you still get duplicate errors:
1. Check which emails are duplicated:
```sql
SELECT email, count(*) 
FROM bestauth_users 
GROUP BY email 
HAVING count(*) > 1;
```

2. Clean up duplicates manually if needed:
```sql
-- Keep only the most recent entry for each email
DELETE FROM bestauth_users a
USING bestauth_users b
WHERE a.email = b.email 
  AND a.created_at < b.created_at;
```

### If subscriptions don't migrate:
Check the user mapping table:
```sql
SELECT * FROM supabase_bestauth_user_mapping;
```

## Post-Migration Tasks

1. Test the "Manage Billing" button functionality
2. Verify users can still log in
3. Check that subscriptions are properly tracked
4. Monitor for any authentication errors

## Important Notes

- The migration creates a `supabase_bestauth_user_mapping` table for reference
- BestAuth user IDs may differ from Supabase user IDs
- All existing email addresses are preserved
- Stripe customer IDs and subscription IDs are maintained