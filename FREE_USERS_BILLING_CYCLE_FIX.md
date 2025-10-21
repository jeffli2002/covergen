# Free Users Billing Cycle Fix

## Problem
Free users had `billing_cycle = 'monthly'` when it should be `NULL`.

## Root Cause Analysis

### Why Free Users Should Have `billing_cycle = NULL`
- **Free tier** = No billing, no subscription cycle
- **Pro/Pro+ tier** = Monthly or yearly billing cycle

### Why Some Free Users Had `billing_cycle = 'monthly'`
Investigation found **15 out of 17 free users** had incorrect `billing_cycle = 'monthly'`:

1. ✅ **None were former paid users** (no `previous_tier` or Stripe subscription)
2. ✅ **All updated at same time** (2025-10-21 07:48:xx)
3. ❌ **Code didn't explicitly set `billing_cycle = null` for free users**

### The Bug
In `src/services/bestauth/BestAuthSubscriptionService.ts:407`, the code was:

```typescript
billing_cycle: resolvedBillingCycle
```

This would use whatever value `resolvedBillingCycle` had, even for free users. If the calling code passed `billing_cycle: 'monthly'` (or if there was a database default), free users would get the wrong value.

## The Fix

### 1. Code Fix (Line 408 in BestAuthSubscriptionService.ts)

**Before:**
```typescript
billing_cycle: resolvedBillingCycle
```

**After:**
```typescript
// Free users should NEVER have billing_cycle set
billing_cycle: resolvedTier === 'free' ? null : resolvedBillingCycle
```

This ensures:
- ✅ Free users ALWAYS get `billing_cycle = null`
- ✅ Pro/Pro+ users get their actual billing cycle ('monthly' or 'yearly')

### 2. Database Cleanup (SQL Script)

Created `scripts/fix-free-users-billing-cycle.sql` to:

1. **Preview** affected users
2. **Update** all free users to have `billing_cycle = NULL`
3. **Verify** the fix worked

```sql
UPDATE bestauth_subscriptions
SET 
  billing_cycle = NULL,
  updated_at = NOW()
WHERE tier = 'free' AND billing_cycle IS NOT NULL;
```

## Testing

### Before Fix
```
Free users WITH billing_cycle: 15
Free users WITHOUT billing_cycle: 2
```

### After Fix (Expected)
```
Free users WITH billing_cycle: 0
Free users WITHOUT billing_cycle: 17
```

### Verification Query
```sql
SELECT 
  tier,
  COUNT(*) as total,
  COUNT(CASE WHEN billing_cycle IS NULL THEN 1 END) as with_null_billing,
  COUNT(CASE WHEN billing_cycle IS NOT NULL THEN 1 END) as with_billing_cycle
FROM bestauth_subscriptions
GROUP BY tier
ORDER BY tier;
```

**Expected Results:**
| Tier | Total | NULL billing_cycle | Has billing_cycle |
|------|-------|-------------------|-------------------|
| free | 17 | 17 | 0 |
| pro | X | 0 | X |
| pro_plus | X | 0 | X |

## Impact

### Functional Impact
- ❌ **Low impact** - `billing_cycle` for free users wasn't used in billing logic
- ✅ **Data correctness** - Database now accurately reflects subscription state
- ✅ **Future-proof** - New free users won't get incorrect billing_cycle

### Users Affected
- 15 free users had incorrect `billing_cycle = 'monthly'`
- 2 free users already had correct `billing_cycle = null`

### Areas That May Reference billing_cycle
1. **Admin queries** - May have been filtering incorrectly
2. **Analytics** - May have counted free users as "monthly subscribers"
3. **Account page** - May have displayed confusing billing information

## Files Modified

1. **Code Fix:**
   - `src/services/bestauth/BestAuthSubscriptionService.ts` (Line 408)

2. **Database Fix:**
   - `scripts/fix-free-users-billing-cycle.sql`

3. **Diagnostic Tools:**
   - `scripts/check-free-users-billing.ts`
   - `scripts/check-all-users.sql`

## Prevention

### Going Forward
1. ✅ Code now explicitly sets `billing_cycle = null` for free users
2. ✅ Database cleanup script removes existing incorrect data
3. ✅ Diagnostic script can detect future issues

### Best Practices
- Always explicitly set `billing_cycle = null` when downgrading to free
- Never assume defaults - always specify values explicitly
- Run diagnostic queries after bulk operations

## Related Issues

This issue was discovered while investigating:
- Pro to Pro+ upgrade issues
- Credits display problems
- Table synchronization bugs

All of these have been fixed in the same commit series.

## Recommendation

**Run the database cleanup SQL immediately** to fix existing free users:

```bash
# Connect to database and run:
psql $DATABASE_URL -f scripts/fix-free-users-billing-cycle.sql
```

Or use Supabase SQL Editor to run the UPDATE query directly.
