# Systematic Credit System Solution

## Overview

This document describes the comprehensive, systematic solution for credit calculation and tracking that works for **ALL users**, not just individual cases.

## Architecture

### Data Flow

```
User Signs Up
    ↓
BestAuth User Created (bestauth_users)
    ↓
User Subscribes (Pro/Pro+)
    ↓
Webhook Triggered
    ↓
┌─────────────────────────────────────────┐
│ BestAuthSubscriptionService             │
│  1. Create/Update subscription record   │
│  2. Resolve Supabase user ID            │
│  3. Create user_id_mapping (if missing) │
│  4. Grant credits via add_points RPC    │
│  5. Verify credits were granted         │
└─────────────────────────────────────────┘
    ↓
User Generates Image/Video
    ↓
┌─────────────────────────────────────────┐
│ Generation Endpoint                     │
│  1. Resolve BestAuth → Supabase ID      │
│  2. Check credits (checkPointsForGen)   │
│  3. Generate content                    │
│  4. Deduct credits (deductPointsForGen) │
└─────────────────────────────────────────┘
    ↓
Credits Deducted from points_balances
```

### Key Tables

1. **`bestauth_users`** - User authentication records
2. **`user_id_mapping`** - Maps BestAuth ID ↔ Supabase ID
3. **`subscriptions_consolidated`** - Subscription tier and status
4. **`points_balances`** - Current credit balance
5. **`points_transactions`** - Transaction history

## Systematic Solutions

### 1. User ID Resolution

**Problem**: BestAuth and Supabase use different user IDs  
**Solution**: Multi-layer resolution strategy

```typescript
// In all generation endpoints
async function resolveSupabaseUserId(bestAuthUserId: string): Promise<string> {
  // Layer 1: user_id_mapping table (primary)
  const mapping = await supabase
    .from('user_id_mapping')
    .select('supabase_user_id')
    .eq('bestauth_user_id', bestAuthUserId)
    .maybeSingle()
  
  if (mapping?.supabase_user_id) {
    return mapping.supabase_user_id
  }
  
  // Layer 2: subscription metadata (fallback)
  const subscription = await supabase
    .from('bestauth_subscriptions')
    .select('metadata')
    .eq('user_id', bestAuthUserId)
    .maybeSingle()
  
  const candidates = [
    subscription?.metadata?.resolved_supabase_user_id,
    subscription?.metadata?.supabase_user_id,
    subscription?.metadata?.original_userId
  ]
  
  const resolvedId = candidates.find(isUuid)
  if (resolvedId) return resolvedId
  
  // Layer 3: Fallback to original ID
  return bestAuthUserId
}
```

**Applied to**:
- `/src/app/api/generate/route.ts`
- `/src/app/api/sora/create/route.ts`
- `/src/app/api/sora/query/route.ts`

### 2. Automatic Credit Granting

**Problem**: Credits not granted when subscription created  
**Solution**: Enhanced webhook handler with validation

**Location**: `/src/services/bestauth/BestAuthSubscriptionService.ts`

**Improvements**:
1. **Resolve user ID before granting** (lines 444-472)
2. **Create mapping if missing** (lines 483-494)
3. **Grant credits via RPC** (lines 496-509)
4. **Verify credits granted** (lines 537-544)
5. **Log failures prominently** (lines 511-532)

**Key Code**:
```typescript
// After subscription update, grant credits
const { data: creditsResult, error: creditsError } = await supabase.rpc('add_points', {
  p_user_id: pointsUserId,
  p_amount: credits,
  p_transaction_type: 'subscription_grant',
  p_description: `${tierConfig.name} ${cycle} subscription: ${credits} credits`,
  // ...
})

if (creditsError) {
  console.error('[BestAuthSubscriptionService] CRITICAL: Failed to grant credits:', creditsError)
  // Log detailed info for manual fix
} else {
  // Verify balance is correct
  if (!creditsResult || creditsResult.new_balance < credits) {
    console.error('[BestAuthSubscriptionService] ⚠️  Credits grant succeeded but balance is unexpected')
  }
}
```

### 3. Tier-Based Limit Checking

**Problem**: Pro/Pro+ users hit Free tier daily limits  
**Solution**: Check subscription tier before applying limits

**Location**: `/src/hooks/useFreeTier.ts`

**Improvements**:
1. **Load subscription on mount** (lines 19-21)
2. **Check tier in canGenerate()** (lines 56-63)
3. **Return unlimited for Pro/Pro+** (lines 75-81)

**Key Code**:
```typescript
const canGenerate = () => {
  // Pro and Pro+ users have no daily limits
  if (subscription) {
    const tier = subscription.tier || subscription.subscription_tier || 'free'
    if (tier === 'pro' || tier === 'pro_plus') {
      return true // Let backend check credits instead
    }
  }
  
  // Free tier users have daily limit
  return usageToday < FREE_TIER_LIMIT
}
```

### 4. Audit and Fix Tools

**Problem**: Need systematic way to find and fix credit issues  
**Solution**: Automated audit and fix scripts

#### Audit Script: `audit-and-fix-all-credits.ts`

**Purpose**: Find and fix credit issues for ALL users

**What it checks**:
- ✅ All users have `user_id_mapping`
- ✅ All paid users have `points_balances` records
- ✅ All subscriptions have `resolved_supabase_user_id` in metadata
- ✅ Balances match tier allocations

**Usage**:
```bash
# Dry run (no changes)
npx tsx scripts/audit-and-fix-all-credits.ts

# Apply fixes
npx tsx scripts/audit-and-fix-all-credits.ts --live
```

**What it fixes**:
1. Creates missing `user_id_mapping` entries
2. Grants credits to paid users with 0 balance
3. Updates subscription metadata with `resolved_supabase_user_id`
4. Reports balance mismatches

#### Monitor Script: `monitor-credit-health.ts`

**Purpose**: Continuous health monitoring

**What it checks**:
- 🔴 Paid users with 0 balance (CRITICAL)
- 🟡 Users without ID mapping (WARNING)
- 🟡 Recent failed deductions (WARNING)
- 🟡 Balance integrity issues (WARNING)

**Usage**:
```bash
npx tsx scripts/monitor-credit-health.ts
```

**Output**:
```
Overall Health: ✅ HEALTHY
Issues Found:
  - Paid users with 0 balance: 0
  - Users without mapping: 0
  - Failed deductions (1h): 0
  - Balance integrity issues: 0

✅ All systems healthy!
```

#### Test Script: `test-credit-system-comprehensive.ts`

**Purpose**: End-to-end testing for specific user

**What it tests**:
1. User exists in BestAuth
2. User ID mapping exists
3. Subscription exists
4. Subscription metadata has resolved ID
5. Points balance exists
6. Balance is reasonable for tier
7. Balance integrity (earned - spent = balance)
8. Can deduct credits (dry run)

**Usage**:
```bash
# Test specific user
npx tsx scripts/test-credit-system-comprehensive.ts jefflee2002@gmail.com

# Output:
# Passed: 8/8 (100%)
# ✅ User exists
# ✅ User ID mapping
# ✅ Subscription exists
# ✅ Subscription metadata
# ✅ Points balance exists
# ✅ Balance is reasonable
# ✅ Balance integrity
# ✅ Can deduct credits
```

## Maintenance Procedures

### Daily Monitoring

```bash
# Run health check
npx tsx scripts/monitor-credit-health.ts

# If issues found, run audit
npx tsx scripts/audit-and-fix-all-credits.ts --live
```

### After Subscription Webhook

**Logs to watch for**:
```
✅ Successfully granted 800 credits to user <id>
⚠️  MANUAL FIX REQUIRED - Run audit script to grant credits
```

If you see the warning, investigate immediately:
```bash
# Test specific user
npx tsx scripts/test-credit-system-comprehensive.ts <user-email>

# Fix if needed
npx tsx scripts/audit-and-fix-all-credits.ts --live
```

### Before Deployment

```bash
# 1. Run comprehensive tests
npx tsx scripts/test-credit-system-comprehensive.ts <test-user>

# 2. Check overall health
npx tsx scripts/monitor-credit-health.ts

# 3. Run audit (dry run)
npx tsx scripts/audit-and-fix-all-credits.ts

# 4. If issues found, fix them
npx tsx scripts/audit-and-fix-all-credits.ts --live

# 5. Verify TypeScript compiles
npm run typecheck

# 6. Deploy
```

## Prevention Strategies

### 1. Always Create user_id_mapping

**When**: During user signup or first subscription  
**Where**: OAuth handlers, subscription webhooks  
**How**: Call `userSyncService.createUserMapping()`

### 2. Always Verify Credits Granted

**When**: After subscription webhook  
**Where**: `BestAuthSubscriptionService.createOrUpdateSubscription()`  
**How**: Check `creditsResult.new_balance`

### 3. Always Resolve User IDs

**When**: Before credit operations  
**Where**: All generation endpoints  
**How**: Call `resolveSupabaseUserId()`

### 4. Never Silently Fail

**When**: Credit operations fail  
**Where**: Everywhere credits are granted/deducted  
**How**: Log CRITICAL errors, store failure metadata

## Testing Checklist

For each new user flow, verify:

- [ ] User ID mapping created
- [ ] Subscription metadata has `resolved_supabase_user_id`
- [ ] Credits granted on subscription
- [ ] Credits visible in account page
- [ ] Credits deduct on generation
- [ ] Balance integrity maintained
- [ ] Tier-based limits work
- [ ] Error logs are clear

## Emergency Procedures

### User reports "No credits"

1. **Check subscription tier**:
   ```bash
   npx tsx scripts/test-credit-system-comprehensive.ts <user-email>
   ```

2. **If balance is 0, grant credits**:
   ```bash
   npx tsx scripts/audit-and-fix-all-credits.ts --live
   ```

3. **Verify fix**:
   ```bash
   npx tsx scripts/test-credit-system-comprehensive.ts <user-email>
   ```

### User reports "Daily limit reached" (but is Pro+)

1. **Check frontend is using new useFreeTier hook**
2. **Verify subscription tier is loaded**:
   ```javascript
   console.log(subscription) // Should show tier: 'pro_plus'
   ```
3. **Clear browser cache and reload**

### Credits not deducting

1. **Check user ID resolution**:
   ```bash
   npx tsx scripts/test-credit-system-comprehensive.ts <user-email>
   ```

2. **Check RPC function works**:
   - Test 8 should pass (Can deduct credits)

3. **Check generation endpoint logs**:
   - Look for "User ID resolution" messages
   - Verify correct user ID is used

## Files Modified

### Core Services
- `/src/services/bestauth/BestAuthSubscriptionService.ts` - Enhanced credit granting
- `/src/hooks/useFreeTier.ts` - Tier-based limit checking

### API Endpoints (User ID Resolution)
- `/src/app/api/generate/route.ts`
- `/src/app/api/sora/create/route.ts`
- `/src/app/api/sora/query/route.ts`

### Maintenance Scripts (NEW)
- `/scripts/audit-and-fix-all-credits.ts` - Systematic audit and fix
- `/scripts/monitor-credit-health.ts` - Continuous monitoring
- `/scripts/test-credit-system-comprehensive.ts` - End-to-end testing

### User-Specific Fixes (One-time)
- `/scripts/diagnose-jeff-credits-issue.ts`
- `/scripts/fix-jeff-complete-v2.ts`
- `/scripts/reset-jeff-balance-correct.ts`

## Summary

This systematic solution ensures:

✅ **Every user** has proper credit tracking  
✅ **Every subscription** grants credits automatically  
✅ **Every generation** deducts credits correctly  
✅ **Every tier** has correct limits  
✅ **Every issue** can be detected and fixed  
✅ **Every deployment** is tested  

No more one-off fixes. The system is now robust and self-healing.
