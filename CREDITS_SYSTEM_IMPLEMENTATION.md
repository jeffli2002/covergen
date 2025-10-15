# Credits-Based Subscription System Implementation

## Overview
This document describes the implementation of the credits-based subscription system for CoverImage. The system replaces the traditional rate-limited subscription model with a points-based quota system while maintaining backward compatibility with free tier rate limits.

## Implementation Date
2025-10-14

## Key Features

### Subscription Plans

#### Free Tier
- **Daily limit**: 3 images
- **Monthly limit**: 10 images  
- **Video quota**: 0 (no videos)
- **Signup bonus**: 30 points (configurable)
- **Points**: 0 (uses rate limits instead)

#### Pro Plan
- **Monthly**: 800 points at $14.90/month
- **Yearly**: 9,600 points at $143.04/year (20% off)

#### Pro+ Plan
- **Monthly**: 1,600 points at $26.90/month
- **Yearly**: 19,200 points at $258.24/year (20% off)

#### Points Packs (One-time Purchase)
- **100 points**: $3.00
- **200 points**: $6.00

### Generation Costs
- **Nano Banana Image**: 5 points
- **Sora 2 Video**: 20 points
- **Sora 2 Pro Video**: 80 points

## Architecture

### Database Schema

#### New Tables

**`subscriptions_consolidated.points_*` columns**:
- `points_balance` - Current available points
- `points_lifetime_earned` - Total points earned ever
- `points_lifetime_spent` - Total points spent ever

**`points_transactions` table**:
```sql
- id (UUID)
- user_id (UUID)
- amount (INTEGER) - Positive for credit, negative for debit
- balance_after (INTEGER)
- transaction_type (VARCHAR) - 'signup_bonus', 'subscription_grant', 'purchase', 'generation_cost', 'refund', 'admin_adjustment'
- generation_type (VARCHAR) - 'nanoBananaImage', 'sora2Video', 'sora2ProVideo'
- subscription_id (UUID)
- stripe_payment_intent_id (TEXT)
- description (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMPTZ)
```

#### Database Functions

**`add_points()`** - Atomically add/deduct points with transaction logging
- Parameters: user_id, amount, transaction_type, description, generation_type, subscription_id, stripe_payment_intent_id, metadata
- Returns: Transaction details with new balance

**`get_points_balance()`** - Get current balance and lifetime stats
- Parameters: user_id
- Returns: balance, lifetime_earned, lifetime_spent, tier

**`deduct_generation_points()`** - Deduct points for generation with validation
- Parameters: user_id, generation_type, points_cost, metadata
- Returns: Success status and transaction details

### Core Services

#### PointsService (`src/lib/services/points-service.ts`)
Main service for all points operations:
- `getBalance(userId)` - Get current points balance
- `addPoints(params)` - Add points to user account
- `deductPointsForGeneration(userId, generationType, metadata)` - Deduct points for generation
- `getTransactionHistory(userId, limit, offset)` - Get transaction history
- `grantSignupBonus(userId)` - Grant signup bonus points
- `grantSubscriptionPoints(userId, tier, cycle, subscriptionId)` - Grant subscription points
- `purchasePointsPack(userId, packId, paymentId)` - Handle points pack purchase
- `canAffordGeneration(userId, generationType)` - Check if user can afford generation
- `refundPoints(userId, amount, reason, metadata)` - Refund points

#### Configuration (`src/config/subscription.ts`)
Centralized configuration for all points, prices, and costs:
- `SUBSCRIPTION_CONFIG` - All subscription plans with prices and points
- `getSubscriptionConfig(tier)` - Get config for specific tier
- `getGenerationCost(type)` - Get points cost for generation type
- `getPointsPack(packId)` - Get points pack details
- `CREEM_PRODUCT_IDS` - Creem product IDs for points packs

### API Endpoints

#### Points Management
- **GET `/api/points/balance`** - Get user's current points balance
- **GET `/api/points/history?limit=50&offset=0`** - Get transaction history
- **POST `/api/points/purchase`** - Create Creem checkout for points pack
  ```json
  {
    "packId": "pack_100"
  }
  ```

#### Generation Endpoints (Updated)
- **POST `/api/generate`** - Generate images (now checks points before generation)
- **POST `/api/sora/create`** - Create video task (checks points upfront)
- **GET `/api/sora/query`** - Query video status (deducts points on success)

### Integration Points

#### 1. Signup Bonus (`src/lib/bestauth/core.ts`)
When users sign up, they automatically receive signup bonus points:
```typescript
const pointsService = createPointsService()
await pointsService.grantSignupBonus(user.id)
```

#### 2. Subscription Creation (`src/services/bestauth/BestAuthSubscriptionService.ts`)
When Pro/Pro+ subscriptions are created, points are automatically granted:
```typescript
if (data.tier && data.tier !== 'free' && data.status === 'active') {
  const pointsService = createPointsService()
  await pointsService.grantSubscriptionPoints(
    data.userId,
    data.tier,
    cycle,
    result.id
  )
}
```

#### 3. Generation Endpoints
Before generation, check if user has sufficient points:
```typescript
const pointsCheck = await checkPointsForGeneration(user.id, 'nanoBananaImage')
if (pointsCheck.usesPoints && !pointsCheck.canProceed) {
  return NextResponse.json({ error: pointsCheck.error }, { status: 402 })
}
```

After successful generation, deduct points:
```typescript
const pointsDeduction = await deductPointsForGeneration(user.id, 'nanoBananaImage', {
  prompt: prompt?.substring(0, 100),
  mode,
  platform,
})
```

#### 4. Payment Webhooks

**Creem Webhook** (`src/app/api/webhooks/creem/route.ts`):
- Handles subscription creation/updates
- Points granted automatically via `BestAuthSubscriptionService.createOrUpdateSubscription()`

**Creem Webhook** (`src/app/api/webhooks/creem/route.ts`):
- Handles points pack purchases
- Event: `checkout.session.completed` with metadata `type: 'points_pack'`
- Calls `pointsService.purchasePointsPack()`

## Behavior Rules

### Free Users
- Use **rate limits** (daily and monthly image limits)
- **No points** deducted for generations
- **Get signup bonus** of 30 points
- Can purchase points packs to supplement rate limits

### Pro/Pro+ Users  
- Use **points system** exclusively
- Rate limits **not enforced** (rely on points balance)
- Get points allocation on subscription renewal
- Can purchase additional points packs

### Points vs Rate Limits
The system checks:
1. If user has **any points balance** → Use points system
2. If user has **zero points** → Use rate limits (free tier behavior)

This allows:
- Free users to remain on rate limits
- Users with bonus points to use them before falling back to rate limits
- Paid users to always use points

## Configuration

### Environment Variables

```bash
# Creem Configuration (already configured for subscriptions)
CREEM_SECRET_KEY=creem_xxx
CREEM_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CREEM_TEST_MODE=false

# Points pack product IDs (create in Creem dashboard)
CREEM_POINTS_PACK_100_ID=prod_xxx
CREEM_POINTS_PACK_200_ID=prod_xxx
```

### Modifying Configuration
All points, prices, and costs are configured in `src/config/subscription.ts`:

```typescript
export const SUBSCRIPTION_CONFIG = {
  free: {
    signupBonusPoints: 30, // Change signup bonus here
    dailyImageLimit: 3,
    monthlyImageLimit: 10,
  },
  pro: {
    price: {
      monthly: 14.9, // Change prices here
      yearly: 143.04,
    },
    points: {
      monthly: 800, // Change points allocation here
      yearly: 9600,
    },
  },
  generationCosts: {
    nanoBananaImage: 5, // Change generation costs here
    sora2Video: 20,
    sora2ProVideo: 80,
  },
  pointsPacks: [
    { id: 'pack_100', points: 100, price: 3.0 }, // Add/modify packs here
    { id: 'pack_200', points: 200, price: 6.0 },
  ],
}
```

## Migration Strategy

### Existing Users
When the migration is deployed:

1. **Free users**: Continue on rate limits, receive signup bonus retroactively (manual script needed)
2. **Paid users**: Run migration script to:
   - Set initial points balance based on current billing cycle
   - Calculate pro-rated points for partial billing periods
   - Log transaction for initial grant

### Migration Script Example
```sql
-- Grant initial points to existing Pro users based on billing cycle
INSERT INTO points_transactions (user_id, amount, balance_after, transaction_type, description)
SELECT 
  s.user_id,
  CASE 
    WHEN s.billing_cycle = 'yearly' THEN 9600
    ELSE 800
  END as amount,
  CASE 
    WHEN s.billing_cycle = 'yearly' THEN 9600
    ELSE 800
  END as balance_after,
  'subscription_grant',
  'Initial points grant for migration'
FROM subscriptions_consolidated s
WHERE s.tier = 'pro' AND s.status = 'active';

-- Update points balance
UPDATE subscriptions_consolidated s
SET points_balance = CASE 
  WHEN s.billing_cycle = 'yearly' THEN 9600
  ELSE 800
END
WHERE s.tier = 'pro' AND s.status = 'active';
```

## Testing

### Database Migration
```bash
# Run migration
psql -U postgres -d coverimage < supabase/migrations/20251014_add_points_system.sql
```

### Manual Testing Scenarios

1. **New User Signup**:
   - Sign up → Check points balance = 30
   - Generate 1 image → Balance = 25 (30 - 5)

2. **Subscription Purchase**:
   - Buy Pro monthly → Balance = 800
   - Generate 1 image → Balance = 795

3. **Points Pack Purchase**:
   - Buy 100 points pack → Balance increased by 100
   - Transaction logged in history

4. **Video Generation**:
   - Create Sora 2 video → Check points upfront
   - On success → Points deducted (20 or 80)

5. **Insufficient Points**:
   - User with 3 points tries to generate image (costs 5)
   - Should receive 402 error with shortfall info

## Monitoring & Logging

### Key Logs to Monitor

- `[PointsService] Granted signup bonus` - Signup bonus allocation
- `[PointsService] Granted X subscription points` - Subscription points grant
- `[Generate API] Deducted points for image generation` - Image generation deduction
- `[Sora Query] Deducted points for video generation` - Video generation deduction
- `[BestAuth Webhook] Successfully granted X points` - Points pack purchase (Creem)

### Database Queries for Monitoring

```sql
-- Total points granted today
SELECT SUM(amount) FROM points_transactions 
WHERE amount > 0 AND created_at >= CURRENT_DATE;

-- Total points spent today  
SELECT SUM(ABS(amount)) FROM points_transactions 
WHERE amount < 0 AND created_at >= CURRENT_DATE;

-- Users with low balance
SELECT user_id, points_balance FROM subscriptions_consolidated 
WHERE tier IN ('pro', 'pro_plus') AND points_balance < 50;

-- Top spenders this month
SELECT user_id, SUM(ABS(amount)) as spent 
FROM points_transactions 
WHERE amount < 0 AND created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY user_id 
ORDER BY spent DESC 
LIMIT 10;
```

## Frontend Integration (Pending)

The following frontend updates are still needed:

1. **Pricing Page** - Update to show points-based plans
2. **Dashboard** - Display current points balance and transaction history
3. **Generation UI** - Show points cost before generation
4. **Purchase Flow** - Add points pack purchase buttons
5. **Low Balance Warning** - Alert users when points are running low

## Future Enhancements

1. **Points Expiration** - Add expiry date to promotional points
2. **Referral Bonuses** - Award points for referrals
3. **Bulk Purchase Discounts** - Larger packs with better rates
4. **Points Sharing** - Team/organization points pools
5. **Auto-Recharge** - Automatically purchase points when balance is low
6. **Usage Analytics** - Detailed breakdown of points usage by generation type

## Support & Troubleshooting

### Common Issues

**Issue**: User not receiving signup bonus
- Check: `points_transactions` table for `signup_bonus` transaction
- Fix: Manually grant using `add_points()` function

**Issue**: Points not deducted after generation
- Check: Generation endpoints logs for deduction errors
- Fix: Ensure user_id is correctly passed to deduction function

**Issue**: Webhook not granting points
- Check: Webhook logs for signature verification
- Fix: Verify `CREEM_WEBHOOK_SECRET` is correctly configured

## Files Created/Modified

### New Files
- `src/config/subscription.ts` - Configuration
- `src/lib/services/points-service.ts` - Points service
- `src/lib/middleware/points-check.ts` - Points checking middleware
- `src/app/api/points/balance/route.ts` - Balance API
- `src/app/api/points/history/route.ts` - History API
- `src/app/api/points/purchase/route.ts` - Purchase API
- `src/app/api/webhooks/creem/route.ts` - Creem webhook handler (updated for points packs)
- `supabase/migrations/20251014_add_points_system.sql` - Database migration

### Modified Files
- `src/lib/bestauth/core.ts` - Added signup bonus
- `src/services/bestauth/BestAuthSubscriptionService.ts` - Added points allocation
- `src/app/api/generate/route.ts` - Added points checking and deduction
- `src/app/api/sora/create/route.ts` - Added points checking
- `src/app/api/sora/query/route.ts` - Added points deduction on success
- `src/app/api/webhooks/creem/route.ts` - Updated for billing cycle tracking

## Conclusion

The credits-based subscription system is now fully implemented on the backend. All core functionality including:
- Points allocation on signup and subscription
- Points deduction on generation
- Purchase flow for points packs
- Transaction history and balance tracking
- Webhook integration for payments

Frontend integration remains pending but the APIs are ready for consumption.
