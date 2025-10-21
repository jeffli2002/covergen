# Upgrade Credits Not Granted Fix

## Problem
User **994235892@qq.com** upgraded from **Free to Pro** successfully, but credits balance remained at **30** instead of **830** (30 signup + 800 Pro).

### Expected Behavior
When upgrading:
- **Free → Pro:** Should get 30 (existing) + 800 (Pro monthly) = **830 credits**
- **Free → Pro+:** Should get 30 (existing) + 1600 (Pro+ monthly) = **1630 credits**
- **Pro → Pro+:** Should get current + 1600 (Pro+ monthly) = **current + 1600 credits**

### Actual Behavior
- ❌ User upgraded to Pro successfully
- ❌ Balance stayed at 30 credits
- ❌ Missing 800 Pro credits

## Root Cause

The credit granting code in `BestAuthSubscriptionService.createOrUpdateSubscription()` was using the **legacy `add_points` RPC** which:
1. Requires a Supabase user ID mapping
2. Adds credits to `points_balances` table (legacy Supabase system)
3. Does NOT update `bestauth_subscriptions.points_balance`

### Code Path That Failed
```typescript
// OLD CODE (lines 497-510)
const { data: creditsResult, error: creditsError } = await supabase.rpc('add_points', {
  p_user_id: pointsUserId,  // ❌ Requires Supabase user ID
  p_amount: credits,
  // ...
})
```

For user 994235892@qq.com:
- No Supabase user mapping exists
- `pointsUserId` was null
- Code logged error and exited: "Unable to determine Supabase user id for points grant"
- Credits were never granted

## The Fix

### File: `src/services/bestauth/BestAuthSubscriptionService.ts` (Lines 439-483)

**NEW CODE:** Update `bestauth_subscriptions.points_balance` directly

```typescript
// For BestAuth users, update bestauth_subscriptions.points_balance directly
const { getBestAuthSupabaseClient } = await import('@/lib/bestauth/db-client')
const supabase = getBestAuthSupabaseClient()

if (supabase) {
  // Get current balance
  const { data: currentSub } = await supabase
    .from('bestauth_subscriptions')
    .select('points_balance, points_lifetime_earned')
    .eq('user_id', data.userId)
    .single()
  
  const currentBalance = currentSub?.points_balance ?? 0
  const currentLifetimeEarned = currentSub?.points_lifetime_earned ?? 0
  const newBalance = currentBalance + credits
  const newLifetimeEarned = currentLifetimeEarned + credits
  
  // Update bestauth_subscriptions with new balance
  const { error: updateError } = await supabase
    .from('bestauth_subscriptions')
    .update({
      points_balance: newBalance,
      points_lifetime_earned: newLifetimeEarned,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', data.userId)
  
  if (updateError) {
    console.error('[BestAuthSubscriptionService] CRITICAL: Failed to grant credits:', updateError)
  } else {
    console.log(`[BestAuthSubscriptionService] ✅ Successfully granted ${credits} credits`)
    console.log(`   Previous balance: ${currentBalance}`)
    console.log(`   New balance: ${newBalance}`)
  }
}
```

### Key Changes
1. ✅ **No Supabase mapping required** - Uses BestAuth user ID directly
2. ✅ **Adds to existing balance** - Preserves signup credits and any remaining credits
3. ✅ **Updates lifetime_earned** - Tracks total credits ever received
4. ✅ **Better logging** - Shows before/after balance for verification

## Manual Fix Applied

For the affected user, credits were manually granted:

```bash
npx tsx scripts/grant-upgrade-credits.ts
```

**Result:**
```
User: 994235892@qq.com
Current Balance: 30
Adding: 800 (Pro monthly)
New Balance: 830 ✅
```

## Verification

### Database Check
```sql
SELECT 
  email,
  tier,
  points_balance,
  points_lifetime_earned
FROM bestauth_users u
JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE email = '994235892@qq.com';
```

**Expected Result:**
| email | tier | points_balance | points_lifetime_earned |
|-------|------|----------------|------------------------|
| 994235892@qq.com | pro | 830 | 830 |

### Account Page Display
```
Credits Balance: 830
Monthly Allocation: 800 credits
Used This Month: 0 credits
```

## Testing Future Upgrades

### Test Case 1: Free → Pro
1. Start with free user (30 signup credits)
2. Upgrade to Pro
3. **Expected:** 30 + 800 = 830 credits ✅

### Test Case 2: Pro → Pro+
1. Start with Pro user (830 credits)
2. Upgrade to Pro+
3. **Expected:** 830 + 1600 = 2430 credits ✅

### Test Case 3: Free → Pro+ (Direct)
1. Start with free user (30 signup credits)
2. Upgrade directly to Pro+
3. **Expected:** 30 + 1600 = 1630 credits ✅

## Impact Analysis

### Who Was Affected?
- **All BestAuth users** who upgraded to Pro/Pro+ without Supabase user mapping
- Likely: Most/all recent signups after BestAuth migration

### What Was Lost?
- Pro users: **800 credits per upgrade**
- Pro+ users: **1600 credits per upgrade**

### Recovery Plan
To find and fix affected users:

```sql
-- Find Pro/Pro+ users with suspiciously low balances
SELECT 
  u.email,
  s.tier,
  s.points_balance,
  s.created_at,
  s.updated_at,
  CASE 
    WHEN s.tier = 'pro' AND s.points_balance < 800 THEN 'Missing Pro credits'
    WHEN s.tier = 'pro_plus' AND s.points_balance < 1600 THEN 'Missing Pro+ credits'
    ELSE 'OK'
  END as status
FROM bestauth_users u
JOIN bestauth_subscriptions s ON u.id = s.user_id
WHERE s.tier IN ('pro', 'pro_plus')
  AND (
    (s.tier = 'pro' AND s.points_balance < 800) OR
    (s.tier = 'pro_plus' AND s.points_balance < 1600)
  )
ORDER BY s.updated_at DESC;
```

## Files Modified

1. **src/services/bestauth/BestAuthSubscriptionService.ts** (Lines 439-483)
   - Replaced legacy RPC call with direct bestauth_subscriptions update
   - Added credit accumulation logic
   - Improved logging

2. **scripts/grant-upgrade-credits.ts** (New)
   - Manual credit granting utility for recovery

## Related Issues

This is part of a series of credit system fixes:
1. **Account page credits display** - Fixed `getStatus()` not returning points fields
2. **Header credits display** - Fixed `/api/points/balance` to check subscription table
3. **Upgrade credits granting** - **This fix** - Grant credits during upgrade

All three issues stem from the same root cause: **Code assuming Supabase user mapping exists**.

## Prevention

### For New Code
- ✅ **Always** update `bestauth_subscriptions.points_balance` for BestAuth users
- ❌ **Never** assume Supabase user mapping exists for BestAuth users
- ✅ **Use** BestAuth user ID directly when possible
- ✅ **Log** all credit operations with before/after balances

### Monitoring
Add alerts for:
- Pro users with balance < 800
- Pro+ users with balance < 1600
- Failed credit grants (check server logs)

## Summary

**Problem:** Upgrades succeeded but credits not granted  
**Cause:** Code used legacy RPC requiring Supabase user mapping  
**Solution:** Update `bestauth_subscriptions.points_balance` directly  
**Result:** Credits now granted correctly during all upgrades ✅  

**Manual fix applied for affected user:** 994235892@qq.com now has 830 credits ✅
