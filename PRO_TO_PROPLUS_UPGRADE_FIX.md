# Pro → Pro+ Upgrade Fix (2025-10-21)

## Problem Summary

When users upgraded from **Pro** to **Pro+**, the upgrade appeared successful but the tier stayed on "Pro" instead of changing to "Pro+".

**Symptoms:**
- Success message: "You now have immediate access to all Pro features" (should say "Pro+ features")
- Database showed tier still as `pro` instead of `pro_plus`
- Account page didn't reflect the upgrade

## Root Cause Analysis

### Issue #1: Webhook Race Condition (PRIMARY)

The Creem webhook handler was **overwriting** successful upgrades with stale data:

**Flow:**
1. User clicks "Upgrade to Pro+" ✅
2. Upgrade API updates database: `tier='pro_plus'` ✅  
3. Creem's `upgradeSubscription()` API is called ✅
4. Creem sends `subscription_update` webhook **AFTER** the upgrade 🐛
5. Webhook receives `planId='pro'` (stale value from Creem)
6. Webhook sees: `'pro' !== 'pro_plus'` → "tier changed!"
7. Webhook "helpfully" updates: `tier='pro'`, `previous_tier='pro_plus'` ❌

**Code Location:** `src/app/api/webhooks/creem/route.ts:662-680`

```typescript
// OLD CODE (buggy):
if (planId && currentSubscription && planId !== currentSubscription.tier) {
  updateData.tier = planId  // ❌ Overwrites upgrade!
  updateData.previousTier = currentSubscription.tier
}
```

### Issue #2: Table Desync (SECONDARY)

Two subscription tables were not synced:
- **`bestauth_subscriptions`** - where upgrade API writes ✅
- **`subscriptions_consolidated`** - where account page reads ❌

This caused display issues even when the upgrade worked temporarily.

## The Fix

### 1. Prevent Webhook from Overwriting Recent Upgrades ⭐

**File:** `src/app/api/webhooks/creem/route.ts`

**Changes:**
- Added time-based check: Don't overwrite upgrades within last 2 minutes
- Added tier-level check: Detect if current tier is "higher" than webhook tier
- Log warnings when ignoring stale webhook data

```typescript
// NEW CODE (fixed):
if (planId && currentSubscription && planId !== currentSubscription.tier) {
  // Check if recently upgraded (within 2 minutes)
  const recentlyUpdated = currentSubscription.updated_at && 
    (Date.now() - new Date(currentSubscription.updated_at).getTime()) < 120000

  // Check if current tier is higher than webhook tier  
  const isUpgrade = (currentSubscription.tier === 'pro_plus' && planId === 'pro') ||
                    (currentSubscription.tier === 'pro' && planId === 'free')

  if (recentlyUpdated && isUpgrade) {
    console.log(`[Webhook] ⚠️ Ignoring webhook tier change - recent upgrade detected`)
    // Don't update tier - keep the upgraded tier
  } else {
    // Legitimate tier change from Creem
    updateData.tier = planId
    updateData.previousTier = currentSubscription.tier
  }
}
```

### 2. Auto-Sync Between Subscription Tables ⭐

**File:** `src/lib/bestauth/db.ts:636-662`

**Changes:**
- After every `bestauth_subscriptions` upsert, auto-sync to `subscriptions_consolidated`
- Prevents future desyncs
- Non-blocking (won't fail main operation if sync fails)

```typescript
// After upsert to bestauth_subscriptions:
try {
  await getDb()
    .from('subscriptions_consolidated')
    .upsert({
      user_id: data.user_id,
      tier: data.tier,
      status: data.status,
      // ... all fields
    }, { onConflict: 'user_id' })
  console.log('[db] Successfully synced to subscriptions_consolidated')
} catch (syncError) {
  console.error('[db] Failed to sync:', syncError)
  // Don't throw - non-critical
}
```

## Verification

### Before Fix:
```
bestauth_subscriptions:    tier='pro', previous_tier='pro_plus' ❌
subscriptions_consolidated: tier='free' ❌
Account page shows:         "Pro features" ❌
```

### After Fix:
```
bestauth_subscriptions:    tier='pro_plus', previous_tier='pro' ✅
subscriptions_consolidated: tier='pro_plus' ✅  
Account page shows:         "Pro+ features" ✅
```

## Testing Steps

### 1. Reset User to Pro
```bash
npx tsx -e "..." # Set user to Pro tier with real Creem subscription ID
```

### 2. Perform Upgrade
1. Login as test user
2. Go to `/en/account`
3. Click "Upgrade to Pro+"
4. Confirm upgrade

### 3. Verify Success
```bash
npx tsx scripts/test-jeff-upgrade.ts
# Should show: Tier: pro_plus ✅
```

### 4. Check Account Page
- Should show "Pro+" badge
- Success banner: "You now have immediate access to all Pro+ features"
- Credits updated to Pro+ allocation (200/month)

## Files Modified

### Primary Fixes:
1. **`src/app/api/webhooks/creem/route.ts`**
   - Lines 665-678: Added webhook override prevention logic

2. **`src/lib/bestauth/db.ts`**  
   - Lines 636-662: Added auto-sync from bestauth_subscriptions → subscriptions_consolidated

### No Other Changes Required

All other upgrade logic was working correctly:
- ✅ Upgrade API endpoint (`src/app/api/bestauth/subscription/upgrade/route.ts`)
- ✅ Payment page flow (`src/app/[locale]/payment/page-client.tsx`)
- ✅ Account page display (`src/app/[locale]/account/page-client.tsx`)
- ✅ Creem service (`src/services/payment/creem.ts`)

## Edge Cases Handled

### 1. Legitimate Downgrades
If Creem actually downgrades a subscription (e.g., payment failed), the webhook will still work:
- Only blocks webhooks within 2 minutes of upgrade
- Only blocks if tier change is a downgrade
- Legitimate status changes (paused, cancelled) still processed

### 2. Multiple Rapid Upgrades
If user upgrades multiple times quickly:
- Each upgrade gets 2-minute protection window
- Webhooks respect the most recent upgrade
- No race conditions

### 3. Webhook Delays
If webhook arrives >2 minutes after upgrade:
- Webhook will process normally
- Assumes sufficient time for Creem to reflect change
- Won't override if tier matches

## Monitoring & Debugging

### Success Indicators:
```
[Upgrade API] ✅ Creem call completed successfully
[Upgrade API] ✅ Database update completed successfully
[db.subscriptions.upsert] ✅ Successfully synced to subscriptions_consolidated
```

### Warning Indicators:
```
[Webhook] ⚠️ Ignoring webhook tier change - recent upgrade detected
[Webhook]    Current tier: pro_plus (updated 45s ago)
[Webhook]    Webhook tier: pro (likely stale)
```

### Error Indicators:
```
[Upgrade API] ❌ Creem upgrade call threw exception
[db.subscriptions.upsert] ❌ Failed to sync to subscriptions_consolidated
```

## Rollback Plan

If the fix causes issues:

### 1. Revert Webhook Change
```bash
git checkout HEAD~1 -- src/app/api/webhooks/creem/route.ts
```

### 2. Revert DB Sync
```bash  
git checkout HEAD~1 -- src/lib/bestauth/db.ts
```

### 3. Manual Fix for Affected Users
```sql
-- Sync tables manually
UPDATE subscriptions_consolidated sc
SET 
  tier = bs.tier,
  status = bs.status,
  stripe_subscription_id = bs.stripe_subscription_id,
  previous_tier = bs.previous_tier,
  updated_at = NOW()
FROM bestauth_subscriptions bs
WHERE sc.user_id = bs.user_id
  AND sc.tier != bs.tier;
```

## Future Improvements

### 1. Better Webhook Deduplication
- Use webhook event IDs to track processed events
- Store last processed webhook timestamp per subscription
- More robust duplicate detection

### 2. Single Source of Truth
- Eventually deprecate `subscriptions_consolidated`
- Migrate all code to use `bestauth_subscriptions` only
- Remove dual-table complexity

### 3. Upgrade Confirmation from Creem
- Wait for Creem webhook confirmation before showing success
- Use optimistic UI updates with rollback capability
- Add upgrade status polling endpoint

## Related Documentation

- `JEFF_UPGRADE_FIX_2025-10-21.md` - Initial diagnosis
- `TEST_PRO_TO_PROPLUS_UPGRADE.md` - Testing guide  
- `CREEM_INTEGRATION_GUIDE.md` - Creem setup
- `src/app/api/bestauth/subscription/upgrade/route.ts` - Upgrade endpoint
- `src/app/api/webhooks/creem/route.ts` - Webhook handler

## Summary

**Problem:** Webhook was overwriting successful upgrades with stale Creem data  
**Solution:** Added 2-minute protection window + tier-level checks in webhook handler  
**Result:** Pro → Pro+ upgrades now work reliably ✅

The fix is minimal, focused, and handles edge cases while maintaining backward compatibility.
