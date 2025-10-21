# Credit Deduction Fix (2025-10-21)

## Problem

User 994235892@qq.com successfully generated videos but credits were not being deducted from their balance. Investigation revealed:

- User had 2425 credits (Pro+ subscription)
- Successfully generated videos
- No transaction records created
- Credits never deducted

## Root Cause

The credit deduction logic in `/src/app/api/sora/query/route.ts` was using a Supabase client created with the **anon key** instead of the **service role key**:

```typescript
// WRONG: Uses anon key
const supabase = await createClient()
const pointsDeduction = await deductPointsForGeneration(userId, generationType, supabase, ...)
```

The anon key client does not have permissions to:
1. Read from `bestauth_subscriptions` table
2. Update `bestauth_subscriptions.points_balance`
3. Insert into `bestauth_points_transactions` table

This caused the deduction to fail silently, with no error being thrown but no credits being deducted.

## Solution

Updated both `/src/app/api/sora/create/route.ts` and `/src/app/api/sora/query/route.ts` to use the service role client:

```typescript
// CORRECT: Uses service role key
const supabaseAdmin = getBestAuthSupabaseClient()
const pointsDeduction = await deductPointsForGeneration(user.id, generationType, supabaseAdmin, ...)
```

### Changes Made

1. **`/src/app/api/sora/query/route.ts`**:
   - Replaced `createClient()` with `getBestAuthSupabaseClient()`
   - Removed unnecessary `resolveSupabaseUserId()` function
   - Added error handling for missing admin client
   - Simplified to use BestAuth user ID directly (no mapping needed)

2. **`/src/app/api/sora/create/route.ts`**:
   - Replaced `createClient()` with `getBestAuthSupabaseClient()`
   - Removed unnecessary `resolveSupabaseUserId()` function
   - Added proper error response for missing admin client

### Key Changes

**Before (Broken)**:
```typescript
const supabase = await createClient() // Uses NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUserId = await resolveSupabaseUserId(user.id) // Unnecessary complexity
const pointsCheck = await checkPointsForGeneration(supabaseUserId, generationType, supabase)
```

**After (Fixed)**:
```typescript
const supabaseAdmin = getBestAuthSupabaseClient() // Uses SUPABASE_SERVICE_ROLE_KEY
const pointsCheck = await checkPointsForGeneration(user.id, generationType, supabaseAdmin)
```

## Testing

Test script created at `/scripts/test-credit-deduction.ts`:

```bash
npx tsx scripts/test-credit-deduction.ts
```

Verified:
- ✅ Service role client can read `bestauth_subscriptions`
- ✅ Service role client can update `points_balance` 
- ✅ Service role client can insert transaction records
- ✅ Credits properly deducted (2425 → 2415)
- ✅ Transaction record created successfully

## Why This Was Happening

BestAuth uses a different table structure than the legacy Supabase auth:
- `bestauth_subscriptions` - stores user subscription and credits
- `bestauth_points_transactions` - stores transaction history

These tables have Row Level Security (RLS) policies that require service role access for updates. The anon key can only read public data, not modify sensitive fields like `points_balance`.

## Impact

This bug affected **all BestAuth users** who generated videos:
- Videos were generated successfully
- Usage counts were tracked correctly
- But credits were never deducted
- No transaction records created

Users could effectively generate unlimited videos without spending credits.

## Related Files

- `/src/app/api/sora/query/route.ts` - Video generation completion handler (FIXED)
- `/src/app/api/sora/create/route.ts` - Video generation creation handler (FIXED)
- `/src/lib/middleware/points-check.ts` - Credit checking and deduction logic
- `/src/lib/bestauth/db-client.ts` - Service role client factory
- `/src/utils/supabase/server.ts` - Anon key client factory

## Prevention

To prevent similar issues:

1. **Always use `getBestAuthSupabaseClient()`** for BestAuth table operations
2. **Only use `createClient()`** for user-scoped Supabase Auth operations
3. **Test credit deduction** after any changes to generation endpoints
4. **Monitor transaction records** to detect missing deductions

## Monitoring

Check for users with missing transaction records:

```sql
-- Find users who generated videos but have no transactions
SELECT 
  u.email,
  u.id,
  s.points_balance,
  s.points_lifetime_spent,
  COUNT(vt.id) as video_count,
  COUNT(tx.id) as transaction_count
FROM bestauth_users u
JOIN bestauth_subscriptions s ON s.user_id = u.id
LEFT JOIN video_tasks vt ON vt.user_id = u.id AND vt.status = 'success'
LEFT JOIN bestauth_points_transactions tx ON tx.user_id = u.id
WHERE s.points_lifetime_spent IS NULL OR s.points_lifetime_spent < 10
GROUP BY u.id, u.email, s.points_balance, s.points_lifetime_spent
HAVING COUNT(vt.id) > 0 AND COUNT(tx.id) = 0;
```

## Next Steps

1. ✅ Fix implemented and tested
2. ⏳ Deploy to production
3. ⏳ Monitor transaction creation
4. ⏳ Consider retroactive credit deduction for affected users (if policy allows)
