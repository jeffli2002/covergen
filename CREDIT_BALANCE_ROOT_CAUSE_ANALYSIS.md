# Credit Balance and Usage Calculation Root Cause Analysis

## User: 994235892@qq.com
**Date**: 2025-10-21  
**Issue**: Credits Balance shows 0, Monthly Allocation shows 800, Used This Month shows 800 (WRONG)

---

## Investigation Results

### 1. User IDs
- **Supabase (auth.users) ID**: `3ac0ce48-2bd0-4172-8c30-cca42ff1e805`
- **BestAuth ID**: `57c1c563-4cdd-4471-baa0-f49064b997c9`
- **User Mapping**: ❌ **MISSING** - No entry in `user_id_mapping` table

### 2. Database State

#### subscriptions_consolidated (Supabase)
```
user_id: 3ac0ce48-2bd0-4172-8c30-cca42ff1e805
tier: free  ← WRONG! Should be 'pro'
status: active
billing_cycle: null
points_balance: 30
points_lifetime_earned: 800
points_lifetime_spent: 0
```

#### bestauth_subscriptions (BestAuth)
```
user_id: 57c1c563-4cdd-4471-baa0-f49064b997c9
tier: pro  ← CORRECT
status: active
billing_cycle: monthly
stripe_subscription_id: sub_5HWDX3EJ8YjLgFvhVttrPw
```

#### points_transactions (Supabase)
```
1. subscription_grant: +770 → balance: 800 (Oct 21 @ 7:59 AM)
2. subscription_grant: +800 → balance: 801 (Oct 19 @ 10:40 PM)
3. manual_test: +1 → balance: 1 (Oct 19 @ 9:58 PM)
```

---

## Root Cause Analysis

### Problem 1: Tier Mismatch Between Systems
**BestAuth has tier='pro'** but **Supabase subscriptions_consolidated has tier='free'**

**Why this happened**:
1. User upgraded to Pro via Creem webhook
2. Webhook handler updated `bestauth_subscriptions` correctly
3. Webhook handler **DID NOT** update `subscriptions_consolidated`
4. The two systems are out of sync

**Evidence**:
- `/src/app/api/webhooks/creem/route.ts` lines 542-564: Only calls `bestAuthSubscriptionService.createOrUpdateSubscription()`
- This updates `bestauth_subscriptions` but NOT `subscriptions_consolidated`

### Problem 2: Missing User ID Mapping
**No mapping exists** between Supabase user ID and BestAuth user ID

**Why this happened**:
1. User was created before full BestAuth migration
2. Webhook resolution created BestAuth user but didn't create mapping
3. Account API cannot find user's points balance

**Evidence**:
- `user_id_mapping` table has no entry for either ID
- Account API tries to resolve Supabase ID from BestAuth ID at lines 160-228 but fails

### Problem 3: Account API Uses Wrong Tier for Allowance Calculation
**File**: `/src/app/api/bestauth/account/route.ts` lines 272-285

```typescript
// Step 1: Fetch subscription from BestAuth
const subscription = await bestAuthSubscriptionService.getUserSubscription(userId)
// subscription.tier = 'pro' ✅

// Step 2: Calculate credits from Supabase subscriptions_consolidated
const creditsBalance = pointsBalance.balance ?? 0  // = 30

// Step 3: Calculate monthly allowance from BestAuth tier
if (subscription?.tier === 'pro') {
  creditsMonthlyAllowance = SUBSCRIPTION_CONFIG.pro.points.monthly  // = 800 ✅
}

// Step 4: Calculate "used this month" - WRONG FORMULA!
const normalizedBalanceForAllowance = Math.min(creditsBalance, creditsMonthlyAllowance)
// = Math.min(30, 800) = 30

const creditsUsedThisMonth = creditsMonthlyAllowance > 0
  ? Math.max(0, creditsMonthlyAllowance - normalizedBalanceForAllowance)
  : 0
// = Math.max(0, 800 - 30) = 770 ❌ WRONG!
```

**Why the formula is wrong**:
- Assumes user starts with `creditsMonthlyAllowance` each month
- Calculates usage as: `allowance - balance`
- **This is only correct if the user received their monthly credits!**
- In this case: User has 30 credits (signup bonus) but never received 800 Pro credits
- Formula says: "You had 800, now have 30, so you used 770" ← FALSE

---

## The Correct Formula

### Current (Wrong) Formula
```typescript
used = allocation - balance
// If balance = 30, allocation = 800 → used = 770 ❌
```

### Should Use Actual Spending from Database
```typescript
// Use points_lifetime_spent from subscriptions_consolidated
creditsUsedThisMonth = subscription_consolidated.points_lifetime_spent_this_month
```

**OR** calculate from transactions:
```sql
SELECT COALESCE(SUM(ABS(amount)), 0) as used_this_month
FROM points_transactions
WHERE user_id = $1
  AND amount < 0
  AND transaction_type = 'generation_cost'
  AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
```

---

## Why Credits Were Never Granted

### The Credit Granting Logic
**File**: `/src/services/bestauth/BestAuthSubscriptionService.ts` lines 425-528

The logic **IS CORRECT** - it tries to grant credits when Pro subscription is activated:

```typescript
// Lines 429-437
if (grantTier !== 'free' && data.status === 'active' && result?.id) {
  const cycle = resolvedBillingCycle || data.billingCycle || 'monthly'
  const tierConfig = grantTier === 'pro' ? SUBSCRIPTION_CONFIG.pro : SUBSCRIPTION_CONFIG.proPlus
  const credits = tierConfig.points[cycle]  // 800 for Pro monthly
  
  // Grant credits via Supabase RPC
  await supabase.rpc('add_points', { ... })
}
```

### Why It Failed for This User

**Lines 451-482**: The service needs to resolve **Supabase user ID** to grant credits:

```typescript
// Try to find Supabase user ID from:
// 1. subscription.metadata.resolved_supabase_user_id
// 2. subscription.metadata.supabase_user_id  
// 3. subscription.metadata.original_userId
// 4. user_id_mapping table

// If none found:
if (!pointsUserId) {
  console.error('[BestAuthSubscriptionService] Unable to determine Supabase user id for points grant')
  // Credits are NOT granted! ❌
}
```

**For this user**:
1. No mapping in `user_id_mapping`
2. No Supabase ID in subscription metadata
3. Credits granting was **silently skipped**
4. Webhook succeeded but user got no credits

**Evidence from webhook logs** (hypothetical - based on code flow):
```
[BestAuthSubscriptionService] Unable to determine Supabase user id for points grant
[BestAuthSubscriptionService] Subscription succeeded but credits were not granted - may need manual adjustment
```

---

## Summary: The Three Issues

### Issue 1: Tier Sync Problem
- **Root Cause**: Webhook only updates BestAuth, not Supabase subscriptions_consolidated
- **Effect**: Account API reads tier from wrong source
- **Fix Location**: `/src/app/api/webhooks/creem/route.ts` handleCheckoutComplete()
- **Fix**: Also update subscriptions_consolidated when tier changes

### Issue 2: Credits Never Granted
- **Root Cause**: Missing user ID mapping prevents credit granting
- **Effect**: User upgraded to Pro but balance stayed at 30 (signup bonus)
- **Fix Location**: `/src/services/bestauth/BestAuthSubscriptionService.ts` lines 478-482
- **Fix**: Ensure user mapping exists BEFORE attempting to grant credits

### Issue 3: Wrong "Used This Month" Calculation
- **Root Cause**: Formula assumes credits were granted, calculates backwards from balance
- **Effect**: Shows "800 used" when user only has 30 credits total
- **Fix Location**: `/src/app/api/bestauth/account/route.ts` lines 282-285
- **Fix**: Use actual spending from database, not calculated from balance

---

## Recommended Fixes

### Fix 1: Ensure User Mapping Exists During Webhook Processing
**File**: `/src/app/api/webhooks/creem/route.ts`

Add mapping creation in `handleCheckoutComplete()` BEFORE calling `createOrUpdateSubscription()`:

```typescript
// After line 517: Ensure user mapping exists
if (resolvedSupabaseUserId && actualUserId) {
  try {
    await userSyncService.createUserMapping(resolvedSupabaseUserId, actualUserId)
    console.log('[BestAuth Webhook] Ensured user mapping before credit grant')
  } catch (error) {
    if (error?.code !== '23505') {  // Ignore duplicate constraint
      console.error('[BestAuth Webhook] Failed to create mapping:', error)
    }
  }
}
```

### Fix 2: Sync subscriptions_consolidated with BestAuth Subscription
**File**: `/src/services/bestauth/BestAuthSubscriptionService.ts`

After granting credits (line 528), also update subscriptions_consolidated:

```typescript
// Update Supabase subscriptions_consolidated to match BestAuth
if (pointsUserId && grantTier !== 'free') {
  await supabase.from('subscriptions_consolidated').upsert({
    user_id: pointsUserId,
    tier: grantTier,
    status: data.status,
    billing_cycle: resolvedBillingCycle
  })
}
```

### Fix 3: Fix "Used This Month" Calculation
**File**: `/src/app/api/bestauth/account/route.ts`

Replace lines 282-285 with actual database query:

```typescript
// Calculate credits used this month from actual transactions
let creditsUsedThisMonth = 0
if (supabaseAdmin && supabaseUserId) {
  const { data: monthlyTransactions } = await supabaseAdmin
    .from('points_transactions')
    .select('amount')
    .eq('user_id', supabaseUserId)
    .eq('transaction_type', 'generation_cost')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    
  creditsUsedThisMonth = monthlyTransactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
}
```

### Fix 4: Manual Credit Grant for This User
**Immediate fix** - Grant missing 800 credits:

```sql
-- Run this SQL to grant the missing Pro credits
SELECT add_points(
  '3ac0ce48-2bd0-4172-8c30-cca42ff1e805',  -- Supabase user ID
  800,
  'subscription_grant',
  'Manual grant: Missing Pro monthly credits from webhook failure',
  NULL,
  NULL,
  NULL,
  '{"tier": "pro", "cycle": "monthly", "source": "manual_fix"}'::jsonb
);

-- Also update tier in subscriptions_consolidated
UPDATE subscriptions_consolidated
SET 
  tier = 'pro',
  billing_cycle = 'monthly',
  updated_at = NOW()
WHERE user_id = '3ac0ce48-2bd0-4172-8c30-cca42ff1e805';

-- Create user mapping for future operations
INSERT INTO user_id_mapping (supabase_user_id, bestauth_user_id)
VALUES ('3ac0ce48-2bd0-4172-8c30-cca42ff1e805', '57c1c563-4cdd-4471-baa0-f49064b997c9')
ON CONFLICT (supabase_user_id) DO NOTHING;
```

---

## File Locations Summary

### Files Needing Changes

1. **Webhook Handler** - `/src/app/api/webhooks/creem/route.ts`
   - Line 457-576: `handleCheckoutComplete()`
   - Add user mapping creation before credit grant

2. **Subscription Service** - `/src/services/bestauth/BestAuthSubscriptionService.ts`
   - Lines 425-528: `createOrUpdateSubscription()`
   - Sync subscriptions_consolidated with BestAuth tier
   - Ensure mapping exists before credit grant

3. **Account API** - `/src/app/api/bestauth/account/route.ts`
   - Lines 282-285: Usage calculation
   - Replace formula with actual database query

4. **Points Service** - `/src/lib/services/points-service.ts`
   - Line 192-222: `grantSubscriptionPoints()`
   - Already correct, used by BestAuthSubscriptionService

5. **Database Schema** - `/supabase/migrations/20251014_add_points_system.sql`
   - Lines 210-267: `deduct_generation_points()` function
   - Already has correct logic

---

## Prevention for Future Users

### Add Validation to Webhook Handler
After creating subscription, verify credits were granted:

```typescript
// After line 568 in webhook handler
if (grantTier !== 'free' && data.status === 'active') {
  // Verify credits were granted
  const balance = await supabase.rpc('get_points_balance', { p_user_id: resolvedSupabaseUserId })
  if (balance.balance < tierConfig.points[cycle]) {
    console.error('[BestAuth Webhook] CRITICAL: Credits were not granted!', {
      expected: tierConfig.points[cycle],
      actual: balance.balance,
      userId: actualUserId,
      supabaseUserId: resolvedSupabaseUserId
    })
    // Send alert or retry
  }
}
```

### Add Monitoring
Track users who upgrade without receiving credits:

```sql
-- Query to find Pro/Pro+ users without credits
SELECT 
  bs.user_id as bestauth_user_id,
  bu.email,
  bs.tier,
  bs.status,
  bs.stripe_subscription_id,
  sc.points_balance,
  sc.points_lifetime_earned
FROM bestauth_subscriptions bs
JOIN bestauth_users bu ON bu.id = bs.user_id
LEFT JOIN user_id_mapping um ON um.bestauth_user_id = bs.user_id
LEFT JOIN subscriptions_consolidated sc ON sc.user_id = um.supabase_user_id
WHERE bs.tier IN ('pro', 'pro_plus')
  AND bs.status = 'active'
  AND (sc.points_balance IS NULL OR sc.points_balance < 800)
  AND sc.tier != bs.tier  -- Tier mismatch
ORDER BY bs.created_at DESC;
```

---

## Conclusion

**The user upgraded to Pro successfully**, but due to missing user ID mapping:
1. Credits were never granted (silent failure)
2. subscriptions_consolidated was never updated to tier='pro'
3. Account API shows wrong "used" amount due to broken formula

**All three issues stem from incomplete dual-database architecture** where:
- BestAuth holds subscription tier
- Supabase holds points balance
- User mapping is the critical bridge
- When mapping is missing, the system breaks silently
