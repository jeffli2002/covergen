# Credit Grant Transaction Records

## Overview

This document tracks all scenarios where credits are GRANTED to users and ensures transaction records are created for audit trail.

---

## Credit Grant Scenarios

### 1️⃣ Signup Bonus ✅ FIXED

**When**: New user signs up  
**Amount**: 30 credits (free tier)  
**Location**: `/src/lib/bestauth/core.ts` - `signUp()` function

**Status**: ✅ **NOW CREATES TRANSACTION RECORD**

#### Implementation (Updated 2025-10-21)

```typescript
// After user signup, grant signup bonus
const signupBonus = SUBSCRIPTION_CONFIG.signupBonus.free // 30 credits

// Update bestauth_subscriptions
await supabaseAdmin
  .from('bestauth_subscriptions')
  .update({
    points_balance: newBalance,
    points_lifetime_earned: newLifetimeEarned
  })
  .eq('user_id', user.id)

// CREATE TRANSACTION RECORD ✅
await supabaseAdmin
  .from('bestauth_points_transactions')
  .insert({
    user_id: user.id,
    amount: signupBonus, // +30
    balance_after: newBalance,
    transaction_type: 'signup_bonus',
    subscription_id: subscription.id,
    description: 'Welcome bonus: 30 credits',
    metadata: {
      source: 'signup',
      bonus_type: 'welcome',
      method: 'email'
    }
  })
```

**Transaction Record**:
- Amount: `+30`
- Type: `signup_bonus`
- Description: "Welcome bonus: 30 credits"

---

### 2️⃣ Subscription Purchase (New) ✅ ALREADY WORKING

**When**: User subscribes to Pro or Pro+ (monthly/yearly)  
**Amount**: 
- Pro Monthly: 600 credits
- Pro Yearly: 7200 credits
- Pro+ Monthly: 2400 credits
- Pro+ Yearly: 28800 credits

**Location**: `/src/services/bestauth/BestAuthSubscriptionService.ts` - `grantCreditsForTier()` function

**Status**: ✅ **ALREADY CREATES TRANSACTION RECORD**

#### Implementation (Lines 482-504)

```typescript
// Update bestauth_subscriptions
await supabase
  .from('bestauth_subscriptions')
  .update({
    points_balance: newBalance,
    points_lifetime_earned: newLifetimeEarned
  })
  .eq('user_id', data.userId)

// CREATE TRANSACTION RECORD ✅
await supabase
  .from('bestauth_points_transactions')
  .insert({
    user_id: data.userId,
    amount: credits,
    balance_after: newBalance,
    transaction_type: 'subscription_grant',
    subscription_id: result?.id,
    description: `${tierConfig.name} ${cycle} subscription: ${credits} credits`,
    metadata: {
      tier: grantTier,
      cycle,
      source: 'subscription',
      previous_tier: data.previousTier
    }
  })
```

**Transaction Record Example**:
- Amount: `+600`
- Type: `subscription_grant`
- Description: "Pro monthly subscription: 600 credits"

---

### 3️⃣ Subscription Upgrade ✅ ALREADY WORKING

**When**: User upgrades from Free→Pro, Pro→Pro+, Monthly→Yearly  
**Amount**: Prorated credits based on remaining billing period  
**Location**: Same as subscription purchase

**Status**: ✅ **ALREADY CREATES TRANSACTION RECORD**

Uses the same `grantCreditsForTier()` function which creates transaction records.

**Transaction Record Example**:
- Amount: `+600` (or prorated amount)
- Type: `subscription_grant`
- Description: "Pro+ monthly subscription: 2400 credits"
- Metadata includes: `previous_tier: 'pro'`

---

### 4️⃣ Credit Pack Purchase ❓ TO BE VERIFIED

**When**: User purchases one-time credit pack  
**Amount**: 100, 500, 1000, 5000 credits  
**Location**: Payment webhook handler

**Status**: ⚠️ **NEEDS VERIFICATION**

**Available Packs** (from config):
- 100 credits: $9.99
- 500 credits: $39.99
- 1000 credits: $69.99
- 5000 credits: $299.99

**TODO**: Verify payment webhook creates transaction record when credits are granted.

---

### 5️⃣ Admin Credit Adjustment ❓ TO BE IMPLEMENTED

**When**: Admin manually adjusts user credits  
**Amount**: Variable  
**Location**: To be created

**Status**: ❌ **NOT YET IMPLEMENTED**

**TODO**: Create admin endpoint to:
1. Adjust credits (add or remove)
2. Create transaction record with type `admin_adjustment`
3. Include reason in description

---

### 6️⃣ Refund ❓ TO BE IMPLEMENTED

**When**: User receives refund for purchase  
**Amount**: Depends on purchase  
**Location**: Payment webhook or admin action

**Status**: ❌ **NOT YET IMPLEMENTED**

**TODO**: When processing refunds:
1. Remove granted credits (if not spent)
2. Create transaction record with type `refund`
3. Handle edge case where credits already spent

---

## Transaction Types Reference

All credit grants should use one of these transaction types:

| Type | Used For | Amount | Example |
|------|----------|--------|---------|
| `signup_bonus` | New user welcome credits | +30 | "Welcome bonus: 30 credits" |
| `subscription_grant` | Monthly/yearly subscription credits | +600 to +28800 | "Pro monthly subscription: 600 credits" |
| `purchase` | One-time credit pack purchase | +100 to +5000 | "Credit pack: 500 credits" |
| `admin_adjustment` | Manual admin credit change | Variable | "Admin adjustment: +100 credits - promotional campaign" |
| `refund` | Refund processing | Variable | "Refund: Payment reversed" |
| `generation_deduction` | Credit spent on generation | Negative | "Sora 2 video generation: [prompt]" |

---

## Database Schema

### `bestauth_points_transactions` Table

```sql
CREATE TABLE bestauth_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES bestauth_users(id),
  amount INTEGER NOT NULL, -- Positive for grants, negative for deductions
  balance_after INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- see types above
  generation_type TEXT, -- only for deductions
  subscription_id UUID REFERENCES bestauth_subscriptions(id),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON bestauth_points_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON bestauth_points_transactions(created_at DESC);
CREATE INDEX idx_transactions_type ON bestauth_points_transactions(transaction_type);
```

---

## Verification Checklist

### Credits Granted - Transaction Records ✅

- [x] **Signup bonus**: ✅ Creates transaction
- [x] **Subscription purchase**: ✅ Creates transaction  
- [x] **Subscription upgrade**: ✅ Creates transaction
- [ ] **Credit pack purchase**: ⚠️ Needs verification
- [ ] **Admin adjustment**: ❌ Not yet implemented
- [ ] **Refund**: ❌ Not yet implemented

### Credits Deducted - Transaction Records ✅

- [x] **Image generation**: ✅ Creates transaction
- [x] **Sora 2 video (standard)**: ✅ Creates transaction
- [x] **Sora 2 Pro video**: ✅ Creates transaction (logic correct, not tested)

---

## Testing

### Test Signup Bonus Transaction

```bash
# Create new user and verify transaction record
psql $DATABASE_URL -c "
SELECT 
  u.email,
  t.amount,
  t.balance_after,
  t.transaction_type,
  t.description,
  t.created_at
FROM bestauth_users u
JOIN bestauth_points_transactions t ON t.user_id = u.id
WHERE t.transaction_type = 'signup_bonus'
ORDER BY t.created_at DESC
LIMIT 5;
"
```

### Test Subscription Grant Transaction

```bash
# Check Pro subscription grants
psql $DATABASE_URL -c "
SELECT 
  u.email,
  s.tier,
  t.amount,
  t.balance_after,
  t.description,
  t.created_at
FROM bestauth_users u
JOIN bestauth_subscriptions s ON s.user_id = u.id
JOIN bestauth_points_transactions t ON t.user_id = u.id
WHERE t.transaction_type = 'subscription_grant'
ORDER BY t.created_at DESC
LIMIT 5;
"
```

### Test All Transaction Types

```bash
# Get transaction type counts
psql $DATABASE_URL -c "
SELECT 
  transaction_type,
  COUNT(*) as count,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_granted,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent
FROM bestauth_points_transactions
GROUP BY transaction_type
ORDER BY count DESC;
"
```

---

## Summary

### Currently Working ✅

1. **Signup Bonus** - 30 credits granted with transaction record
2. **Subscription Purchase** - Credits granted with transaction record
3. **Subscription Upgrade** - Credits granted with transaction record
4. **Image Generation** - Credits deducted with transaction record
5. **Video Generation** - Credits deducted with transaction record

### Next Steps 📋

1. ✅ Verify credit pack purchase creates transactions
2. ⏳ Implement admin adjustment endpoint
3. ⏳ Implement refund handling
4. ⏳ Add transaction filtering/export for users
5. ⏳ Create admin dashboard for credit management

---

**Last Updated**: 2025-10-21  
**Status**: Core functionality complete, additional features pending
