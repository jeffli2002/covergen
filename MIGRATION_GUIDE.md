# Supabase Auth → BestAuth Migration Guide

## Overview

This guide will help you migrate subscription and credits data from the legacy Supabase Auth system to the new BestAuth system.

**Important:** Both systems use the same PostgreSQL database but different tables and user IDs.

## Architecture

### Before Migration (Split-Brain)
```
Same Supabase Database
├── Supabase System (Legacy)
│   ├── auth.users (User ID: a1b2c3...)
│   ├── subscriptions_consolidated (references auth.users)
│   └── points_transactions (references auth.users)
└── BestAuth System (Current)
    ├── bestauth_users (User ID: e5f6g7...)  ← DIFFERENT IDs!
    ├── bestauth_subscriptions (references bestauth_users)
    └── bestauth_points_transactions (NEW)
```

### After Migration (Unified)
```
All data in BestAuth tables
├── bestauth_users (active)
├── bestauth_subscriptions (active, with credits)
└── bestauth_points_transactions (active)
```

## Prerequisites

### 1. Database Access

You need access to your Supabase database via:

**Option A: Supabase Dashboard**
- Go to https://supabase.com/dashboard
- Select project: `exungkcoaihcemcmhqdr`
- Navigate to SQL Editor

**Option B: psql Command Line**
```bash
# Get connection string from Supabase Dashboard > Project Settings > Database
psql "postgresql://postgres:[PASSWORD]@db.exungkcoaihcemcmhqdr.supabase.co:5432/postgres"
```

### 2. Run Points System Migration First

**CRITICAL:** Must run this BEFORE the main migration:

```bash
# Via Supabase Dashboard SQL Editor
# Copy and paste contents of:
src/lib/bestauth/schema/add-points-system.sql

# Or via psql
psql "$DATABASE_URL" -f src/lib/bestauth/schema/add-points-system.sql
```

This creates:
- `points_balance`, `points_lifetime_earned`, `points_lifetime_spent` columns in `bestauth_subscriptions`
- `bestauth_points_transactions` table
- `bestauth.add_points()`, `bestauth.get_points_balance()`, `bestauth.deduct_generation_points()` functions

### 3. Backup Your Data

```sql
-- Create backup tables
CREATE TABLE subscriptions_consolidated_backup AS 
SELECT * FROM subscriptions_consolidated;

CREATE TABLE points_transactions_backup AS 
SELECT * FROM points_transactions;

CREATE TABLE bestauth_subscriptions_backup AS 
SELECT * FROM bestauth_subscriptions;
```

## Migration Steps

### Step 1: Verify Current State

Run the verification script to see current data:

```bash
psql "$DATABASE_URL" -f scripts/verify-migration.sql
```

Review the output:
- How many users exist in each system?
- How many users can be mapped by email?
- Are there any existing discrepancies?

### Step 2: Run the Migration (DRY RUN)

```bash
# This will run in a transaction - review output before committing
psql "$DATABASE_URL" -f scripts/migrate-supabase-to-bestauth.sql
```

**The script will:**
1. Map users by email (auth.users ↔ bestauth_users)
2. Migrate subscription data (tier, status, Stripe IDs)
3. Migrate credits/points balances
4. Copy transaction history
5. Show a summary report
6. **WAIT for you to COMMIT or ROLLBACK**

### Step 3: Review Migration Results

The script will output:
```
================================================
MIGRATION SUMMARY
================================================
Subscriptions migrated: 25
Points transactions migrated: 150
Total credits in BestAuth: 12,500
================================================
Review the results and run COMMIT if everything looks good.
Or run ROLLBACK to undo all changes.
================================================
```

It will also show a comparison table of users with any differences.

### Step 4: Verify Data

Check specific users:

```sql
-- Check jefflee2002@gmail.com
SELECT 
    bu.id as bestauth_id,
    bu.email,
    bs.tier,
    bs.status,
    bs.points_balance,
    bs.stripe_customer_id
FROM bestauth_users bu
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = bu.id
WHERE bu.email = 'jefflee2002@gmail.com';

-- Compare with Supabase
SELECT 
    au.id as supabase_id,
    au.email,
    sc.tier,
    sc.status,
    sc.points_balance,
    sc.stripe_customer_id
FROM auth.users au
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = au.id
WHERE au.email = 'jefflee2002@gmail.com';
```

### Step 5: Commit or Rollback

**If everything looks good:**
```sql
COMMIT;
```

**If something is wrong:**
```sql
ROLLBACK;
```

### Step 6: Post-Migration Verification

```bash
psql "$DATABASE_URL" -f scripts/verify-migration.sql
```

Compare the "before" and "after" numbers.

## Common Issues

### Issue 1: User Not Found in BestAuth

**Problem:** User exists in `auth.users` but not in `bestauth_users`

**Solution:** User hasn't logged in since BestAuth was implemented
- They will be auto-created on next login
- Or manually create: `INSERT INTO bestauth_users (email, ...) SELECT email, ... FROM auth.users WHERE email = '...'`

### Issue 2: Different User IDs

**Problem:** Same email has different UUIDs in each system

**Solution:** This is expected! The migration script maps by email, not ID.

### Issue 3: Points Balance Mismatch

**Problem:** Supabase shows 800 credits, BestAuth shows 0

**Solution:** 
1. Ensure `add-points-system.sql` was run first
2. Re-run migration script
3. If still wrong, manually update:
```sql
UPDATE bestauth_subscriptions
SET points_balance = 800
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = 'user@example.com');
```

### Issue 4: Transaction Still Open

**Problem:** Forgot to COMMIT or ROLLBACK

**Solution:**
```sql
-- Check for open transactions
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';

-- Commit if intentional
COMMIT;

-- Or rollback
ROLLBACK;
```

## Testing

### Test User Lookup

```sql
-- Find a specific user across both systems
WITH test_user AS (
    SELECT 
        au.id as supabase_id,
        bu.id as bestauth_id,
        au.email
    FROM auth.users au
    INNER JOIN bestauth_users bu ON LOWER(au.email) = LOWER(bu.email)
    WHERE au.email = 'your-test-user@example.com'
)
SELECT 
    'Supabase' as system,
    tu.supabase_id as user_id,
    sc.tier,
    sc.status,
    sc.points_balance
FROM test_user tu
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = tu.supabase_id

UNION ALL

SELECT 
    'BestAuth',
    tu.bestauth_id,
    bs.tier::text,
    bs.status::text,
    bs.points_balance
FROM test_user tu
LEFT JOIN bestauth_subscriptions bs ON bs.user_id = tu.bestauth_id;
```

### Test Credits Granting

```sql
-- Grant test credits using BestAuth function
SELECT bestauth.add_points(
    (SELECT id FROM bestauth_users WHERE email = 'your-test-user@example.com'),
    100, -- amount
    'admin_adjustment', -- type
    'Test credits migration' -- description
);

-- Verify
SELECT points_balance 
FROM bestauth_subscriptions 
WHERE user_id = (SELECT id FROM bestauth_users WHERE email = 'your-test-user@example.com');
```

## Rollback Plan

If migration causes issues in production:

1. **Stop all app deployments**
2. **Restore from backup:**
```sql
BEGIN;

DELETE FROM bestauth_subscriptions;
INSERT INTO bestauth_subscriptions SELECT * FROM bestauth_subscriptions_backup;

DELETE FROM bestauth_points_transactions;

COMMIT;
```

3. **Temporarily revert code to use Supabase:**
```typescript
// In BestAuthSubscriptionService.ts
// Comment out BestAuth credits granting
// Uncomment Supabase points granting
```

4. **Investigate and fix issues**
5. **Re-run migration**

## Post-Migration Checklist

- [ ] Run verification script - all data matches
- [ ] Test Pro → Pro+ upgrade - credits granted correctly
- [ ] Test user with jefflee2002@gmail.com - can see correct tier and credits
- [ ] Test generation - credits deduct properly
- [ ] Check Vercel logs - no 500 errors
- [ ] Monitor for 24 hours - watch for issues
- [ ] Update documentation - mark Supabase system as deprecated
- [ ] Plan to drop old tables (after 30 days safety period)

## Future: Deprecate Supabase Auth

After migration is stable (30+ days):

```sql
-- Rename old tables (don't delete yet!)
ALTER TABLE subscriptions_consolidated RENAME TO _deprecated_subscriptions_consolidated;
ALTER TABLE points_transactions RENAME TO _deprecated_points_transactions;

-- After another 30 days, drop them
DROP TABLE _deprecated_subscriptions_consolidated;
DROP TABLE _deprecated_points_transactions;
```

## Support

If you encounter issues:

1. Check logs: `psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"`
2. Review transaction state
3. Check verify-migration.sql output
4. Look for error messages in migration output

## Files

- `scripts/migrate-supabase-to-bestauth.sql` - Main migration script
- `scripts/verify-migration.sql` - Pre/post verification
- `src/lib/bestauth/schema/add-points-system.sql` - Points system setup (run first!)
- `MIGRATION_GUIDE.md` - This file
