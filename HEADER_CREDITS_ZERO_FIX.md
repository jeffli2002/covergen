# Header Showing 0 Credits Fix

## Problem
User **994235892@qq.com** has **30 credits in database** but **header shows 0 credits**.

## Root Cause

The header uses the `PointsBalance` component which calls `/api/points/balance`.

This API was **only checking the `points_balances` table**, which requires a Supabase user ID mapping. BestAuth users without mapping got **0 credits** even though their credits are stored in `bestauth_subscriptions.points_balance`.

### Data Flow
```
Header → PointsBalance Component → /api/points/balance → points_balances table ❌
                                                        → (missing) bestauth_subscriptions.points_balance
```

## The Fix

### File: `src/app/api/points/balance/route.ts` (Lines 90-142)

**Changed the priority order:**

1. **FIRST:** Check `bestauth_subscriptions.points_balance` (BestAuth users)
2. **THEN:** Fall back to `points_balances` table (legacy Supabase users)

**New Code:**
```typescript
// ALWAYS prefer bestauth_subscriptions.points_balance for BestAuth users
// This is the source of truth for credits
let balanceFromSubscription: any = null
try {
  const { data: subscription } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, points_lifetime_earned, points_lifetime_spent, tier')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subscription && typeof subscription.points_balance === 'number') {
    balanceFromSubscription = {
      balance: subscription.points_balance,
      lifetime_earned: subscription.points_lifetime_earned ?? 0,
      lifetime_spent: subscription.points_lifetime_spent ?? 0,
      tier: subscription.tier || 'free',
    }
    console.log('[Points Balance API] Using balance from bestauth_subscriptions (BestAuth user):', balanceFromSubscription)
  }
} catch (subError) {
  console.error('[Points Balance API] Error fetching subscription balance:', subError)
}

// If we have balance from subscription, use it
if (balanceFromSubscription) {
  return NextResponse.json(balanceFromSubscription)
}

// Fallback: Try points_balances table (for legacy Supabase users)
try {
  const balance = await pointsService.getBalance(supabaseUserId)
  if (balance) {
    console.log('[Points Balance API] Using balance from points_balances (legacy user):', balance)
    return NextResponse.json(balance)
  }
} catch (pointsError) {
  // Return default if points table doesn't exist
}
```

## Related Fixes

This is the **second place** we fixed the same issue:

1. **Account Page API** (`/api/bestauth/account`) ✅ - Fixed in commit `6d686dc`
   - Issue: `db.subscriptions.getStatus()` wasn't returning `points_balance` field
   - Fix: Added `points_balance` to result object

2. **Header Points Balance API** (`/api/points/balance`) ✅ - Fixed in this commit
   - Issue: API only checked `points_balances` table
   - Fix: Check `bestauth_subscriptions.points_balance` FIRST

## Impact

### Before Fix
- ❌ Header showed **0 credits** for all BestAuth users without Supabase mapping
- ❌ Users thought they had no credits
- ✅ Account page showed correct credits (after first fix)

### After Fix
- ✅ Header shows **correct credits** from `bestauth_subscriptions` table
- ✅ Consistent with account page
- ✅ Works for BestAuth users with or without Supabase mapping

## User Types Affected

### BestAuth Users (Post-Migration)
- **With Supabase Mapping:** 
  - Before: Would get 0 if `points_balances` table empty
  - After: Gets credits from `bestauth_subscriptions` ✅

- **Without Supabase Mapping:**
  - Before: Got 0 (no way to query `points_balances`)
  - After: Gets credits from `bestauth_subscriptions` ✅

### Legacy Supabase Users (Pre-Migration)
- **Still works:** Falls back to `points_balances` table
- **No impact:** They don't use `bestauth_subscriptions`

## Testing

### Manual Test
1. Login as `994235892@qq.com`
2. Check header (top right, next to avatar)
3. Should see: **30** credits (with coin icon)

### Expected Header Display
```
[Coin Icon] 30
```

Click on it shows popover:
```
Credits Balance
30 credits
Free Plan

You can create:
• Nano Banana Images: 30
• Sora 2 Videos: 6
• Sora 2 Pro Videos: 3
```

## Data Consistency

Now **both** the header and account page use the same data source:

| Location | API | Data Source |
|----------|-----|-------------|
| Account Page | `/api/bestauth/account` | `bestauth_subscriptions.points_balance` ✅ |
| Header | `/api/points/balance` | `bestauth_subscriptions.points_balance` ✅ |

## Server Restart

Changes take effect immediately after server restart (already done).

## Files Modified

1. **src/app/api/points/balance/route.ts** (Lines 90-142)
   - Added priority check for `bestauth_subscriptions.points_balance`
   - Added logging to distinguish between BestAuth and legacy users

2. **scripts/test-points-balance-api.ts** (New)
   - Test script to verify header credits API

## Related Documentation

- `ACCOUNT_PAGE_CREDITS_ZERO_FIX.md` - First fix (account page)
- `HEADER_CREDITS_ZERO_FIX.md` - This fix (header)

## Summary

**Problem:** Header showing 0 credits for BestAuth users  
**Cause:** API only checked `points_balances` table (requires Supabase mapping)  
**Solution:** Check `bestauth_subscriptions.points_balance` FIRST (source of truth)  
**Result:** Header now shows correct credits for all BestAuth users ✅

This completes the credits display fix across the entire application.
