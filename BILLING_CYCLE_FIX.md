# Billing Cycle Default Fix

## Problem
Pro yearly NEXT_PUBLIC_PRICE_ID_PRO_YEARLY is set in Vercel, but subscription buttons linked to Pro monthly price IDs because the default billing cycle throughout the codebase was set to `'monthly'` instead of `'yearly'`.

## Root Cause
Multiple locations in the codebase had hardcoded defaults to `'monthly'`:
1. **API Route** `/src/app/api/payment/create-checkout/route.ts:39` - Wasn't extracting `billingCycle` from request body
2. **Creem Service** `/src/services/payment/creem.ts:220` - Default parameter was `'monthly'`
3. **Upgrade Service** `/src/services/payment/creem.ts:1474` - Default parameter was `'monthly'`
4. **Upgrade API** `/src/app/api/bestauth/subscription/upgrade/route.ts:115` - Fallback default was `'monthly'`

## Changes Made

### 1. API Route - Extract billingCycle from Request
**File**: `src/app/api/payment/create-checkout/route.ts`

```typescript
// Before (line 39):
const { planId, successUrl, cancelUrl } = body

// After:
const { planId, billingCycle = 'yearly', successUrl, cancelUrl } = body
```

```typescript
// Before (line 168-175):
const result = await creemService.createCheckoutSession({
  userId: user.id,
  userEmail: user.email!,
  planId: planId as 'pro' | 'pro_plus',
  successUrl,
  cancelUrl,
  currentPlan: subscription?.tier || 'free'
})

// After:
const result = await creemService.createCheckoutSession({
  userId: user.id,
  userEmail: user.email!,
  planId: planId as 'pro' | 'pro_plus',
  billingCycle: billingCycle as 'monthly' | 'yearly',
  successUrl,
  cancelUrl,
  currentPlan: subscription?.tier || 'free'
})
```

### 2. Creem Service - Change Default to Yearly
**File**: `src/services/payment/creem.ts`

```typescript
// Before (line 220):
billingCycle = 'monthly',

// After:
billingCycle = 'yearly',
```

### 3. Upgrade Method - Change Default to Yearly
**File**: `src/services/payment/creem.ts`

```typescript
// Before (line 1474):
async upgradeSubscription(subscriptionId: string, newPlanId: 'pro' | 'pro_plus', billingCycle: 'monthly' | 'yearly' = 'monthly') {

// After:
async upgradeSubscription(subscriptionId: string, newPlanId: 'pro' | 'pro_plus', billingCycle: 'monthly' | 'yearly' = 'yearly') {
```

### 4. Upgrade API Route - Change Fallback to Yearly
**File**: `src/app/api/bestauth/subscription/upgrade/route.ts`

```typescript
// Before (line 115):
const targetBillingCycle = body.billingCycle || body.billing || currentSubscription.billing_cycle || 'monthly'

// After:
const targetBillingCycle = body.billingCycle || body.billing || currentSubscription.billing_cycle || 'yearly'
```

## How It Works

1. **User clicks subscription button** on pricing page
   - `PricingPage.tsx:34` defaults to `isYearly = true`
   - Button passes `billing=${isYearly ? 'yearly' : 'monthly'}` to payment page

2. **Payment page** (`/payment?plan=pro&billing=yearly`)
   - Passes `billingCycle: 'yearly'` to `creemService.createCheckoutSession()`

3. **API Route** (`/api/payment/create-checkout`)
   - Extracts `billingCycle` from request body (defaults to `'yearly'` if missing)
   - Passes it to `creemService.createCheckoutSession()`

4. **Creem Service** constructs correct price ID:
   ```typescript
   const productKey = `${planId}_${billingCycle}` // e.g., "pro_yearly"
   const productId = CREEM_PRODUCTS[productKey]   // Uses NEXT_PUBLIC_PRICE_ID_PRO_YEARLY
   ```

## Environment Variables Used
- `NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY` - Pro monthly price ID
- `NEXT_PUBLIC_PRICE_ID_PRO_YEARLY` - Pro yearly price ID ✓
- `NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY` - Pro+ monthly price ID
- `NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY` - Pro+ yearly price ID ✓

## Testing Checklist
- [ ] Click "Start Pro" on pricing page with yearly toggle ON → Should use Pro yearly price ID
- [ ] Click "Start Pro" on pricing page with yearly toggle OFF → Should use Pro monthly price ID
- [ ] Upgrade from Pro to Pro+ with yearly → Should use Pro+ yearly price ID
- [ ] Switch from Pro monthly to Pro yearly → Should change billing cycle
- [ ] New signups default to yearly pricing (20% discount shown)

## Impact
- All new subscriptions will default to **yearly billing** (with 20% discount)
- Monthly billing is still available by toggling the switch on the pricing page
- Matches the UI default (`isYearly = true` in PricingPage.tsx)
- Aligns with the pricing strategy to encourage annual subscriptions
