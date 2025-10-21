# Database Migration Deployment Guide

## Migrations Ready for Deployment

Two database migrations have been created and are ready to be applied:

1. `20251021_mark_deprecated_subscription_tables.sql` - Marks tables with deprecation status
2. `20251021_fix_rpc_use_bestauth_subscriptions.sql` - **CRITICAL FIX** for credit granting

## Migration 1: Mark Deprecated Tables

**File**: `supabase/migrations/20251021_mark_deprecated_subscription_tables.sql`

**What it does**:
- Adds database comments to clarify which table to use
- Creates read-only VIEW for backwards compatibility
- No data changes

**Impact**: Documentation only, **ZERO risk**

## Migration 2: Fix RPC Functions ⚠️ CRITICAL

**File**: `supabase/migrations/20251021_fix_rpc_use_bestauth_subscriptions.sql`

**What it fixes**:
- `add_points` RPC now uses `bestauth_subscriptions` (was causing FK constraint errors)
- `get_points_balance` RPC now uses `bestauth_subscriptions`
- Enables credit granting for all users

**Impact**: **REQUIRED** - Credit granting currently fails without this

**Priority**: **HIGH** - Blocking credit grants to users like 994235892@qq.com

## Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Login to Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   ```

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

3. **Apply Migration 1 (Deprecation Marks)**
   - Copy contents of `supabase/migrations/20251021_mark_deprecated_subscription_tables.sql`
   - Paste into SQL editor
   - Click "Run" button
   - Verify: Should complete with no errors

4. **Apply Migration 2 (RPC Fix)**
   - Click "+ New Query" again
   - Copy contents of `supabase/migrations/20251021_fix_rpc_use_bestauth_subscriptions.sql`
   - Paste into SQL editor
   - Click "Run" button
   - Verify: Should complete with "CREATE OR REPLACE FUNCTION" success messages

### Option 2: Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push

# Verify migrations applied
supabase db dump --schema public > schema_backup.sql
grep -A 5 "COMMENT ON FUNCTION public.add_points" schema_backup.sql
```

## Verification After Deployment

### 1. Check RPC Functions Updated

```sql
-- Run in SQL Editor
SELECT 
  routine_name, 
  routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('add_points', 'get_points_balance');
```

**Expected**: Should see `bestauth_subscriptions` in function definitions, NOT `subscriptions_consolidated`

### 2. Test Credit Granting

```bash
# Run comprehensive test suite
npx tsx scripts/test-credits-e2e-comprehensive.ts
```

**Expected**: Should pass test "Test add_points RPC with small amount" (currently FAILING)

### 3. Grant Credits to User 994235892@qq.com

```bash
# After migration applied, run audit script
npx tsx scripts/audit-and-fix-all-credits.ts --live
```

**Expected**: User 994235892@qq.com should receive 1600 credits

## Rollback Plan (If Needed)

If something goes wrong, rollback is simple since we're just replacing function definitions:

```sql
-- Rollback to old add_points function
-- Copy from: supabase/migrations/20251014_add_points_system.sql
-- Lines 73-159

CREATE OR REPLACE FUNCTION public.add_points(...)
-- [paste original function from 20251014_add_points_system.sql]
```

## Testing Checklist

After deployment, verify:

- [ ] Migration 1 applied successfully
- [ ] Migration 2 applied successfully
- [ ] RPC functions reference `bestauth_subscriptions`
- [ ] Test suite passes "Credit Granting" test
- [ ] User 994235892@qq.com receives credits
- [ ] Existing users' credits unchanged
- [ ] No API errors in production logs

## Timeline

**Recommended deployment**: **ASAP** (blocks credit granting)

**Estimated downtime**: **ZERO** (function replacement is atomic)

**Risk level**: **LOW** (only changes internal function logic)

## Impact Summary

### Before Migration
- ❌ Credit granting fails for some users (FK constraint)
- ❌ User 994235892@qq.com has 0 credits despite Pro+ subscription
- ❌ Comprehensive test: 13/22 passing (59%)

### After Migration
- ✅ Credit granting works for all users
- ✅ User 994235892@qq.com can receive credits
- ✅ Comprehensive test: ~18/22 passing (82%)

## Post-Deployment Actions

1. **Grant credits to affected users**:
   ```bash
   npx tsx scripts/audit-and-fix-all-credits.ts --live
   ```

2. **Re-run comprehensive test**:
   ```bash
   npx tsx scripts/test-credits-e2e-comprehensive.ts
   ```

3. **Monitor for errors**:
   - Check Supabase logs for RPC function errors
   - Monitor Sentry/error tracking
   - Watch for user reports of credit issues

## Questions?

If you encounter any issues during deployment:

1. Check Supabase logs for error details
2. Verify migration file contents match expected
3. Try rollback procedure if needed
4. Review `CREDIT_SYSTEM_TEST_RESULTS.md` for context

---

**Status**: ✅ Ready for deployment  
**Priority**: 🔴 HIGH - Blocking credit granting  
**Risk**: 🟢 LOW - Atomic function replacement
