# Payment Infrastructure Implementation

**Created:** 2025-10-16  
**Architecture:** Matches im2prompt's proven payment system

## 🎯 Overview

Complete payment, subscription, and credit management system with:
- ✅ Event deduplication (prevents duplicate webhook processing)
- ✅ Idempotent credit grants (prevents double-credits)
- ✅ Comprehensive trial handling
- ✅ Plan change detection (upgrade/downgrade)
- ✅ Renewal detection
- ✅ State validation

## 📊 Database Schema

### Core Tables

#### `payment`
Stores payment records for subscriptions and one-time payments
```sql
CREATE TABLE payment (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'creem', -- 'stripe' | 'creem'
  price_id TEXT NOT NULL,
  product_id TEXT,
  type TEXT NOT NULL, -- 'one_time' | 'subscription'
  interval TEXT, -- 'month' | 'year' | NULL
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL,
  subscription_id TEXT,
  status TEXT NOT NULL, -- 'active' | 'canceled' | 'past_due' | 'trialing' | ...
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `payment_event`
**Critical for webhook deduplication**
```sql
CREATE TABLE payment_event (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payment(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  creem_event_id TEXT UNIQUE, -- ⭐ Prevents duplicate processing
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `user_credits`
Tracks user credit balances
```sql
CREATE TABLE user_credits (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  frozen_balance INTEGER NOT NULL DEFAULT 0, -- For disputes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `credit_transactions`
**Critical for idempotency**
```sql
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL, -- 'earn' | 'spend' | 'refund' | ...
  amount INTEGER NOT NULL CHECK (amount > 0),
  balance_after INTEGER NOT NULL,
  source TEXT NOT NULL, -- 'subscription' | 'api_call' | ...
  description TEXT,
  reference_id TEXT, -- ⭐ For idempotency
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint prevents duplicate transactions with same reference_id
CREATE UNIQUE INDEX idx_credit_user_reference_unique 
  ON credit_transactions(user_id, reference_id) 
  WHERE reference_id IS NOT NULL;
```

#### `user_quota_usage`
Tracks quota usage by service and period
```sql
CREATE TABLE user_quota_usage (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  service TEXT NOT NULL, -- 'image_generation' | 'video_generation' | ...
  period TEXT NOT NULL, -- Format: 'YYYY-MM'
  used_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_service_period 
  ON user_quota_usage(user_id, service, period);
```

## 🏗️ Architecture

### Payment Repository (`src/lib/repositories/payment-repository.ts`)
```typescript
class PaymentRepository {
  // CRUD operations
  async create(data: CreatePaymentData): Promise<PaymentRecord>
  async findById(id: string): Promise<PaymentRecord | null>
  async findByUserId(userId: string): Promise<PaymentRecord[]>
  async findBySubscriptionId(subscriptionId: string): Promise<PaymentRecord | null>
  async findByCustomerId(customerId: string): Promise<PaymentRecord[]>
  async findActiveSubscriptionByUserId(userId: string): Promise<PaymentRecord | null>
  async update(id: string, data: UpdatePaymentData): Promise<PaymentRecord | null>
  
  // Event deduplication
  async isStripeEventProcessed(stripeEventId: string): Promise<boolean>
  async isCreemEventProcessed(creemEventId: string): Promise<boolean>
  
  // Event tracking
  async createEvent(data: CreatePaymentEventData): Promise<void>
  
  // State validation
  async updateSubscriptionStatus(
    subscriptionId: string,
    newStatus: PaymentStatus,
    metadata?: Record<string, any>
  ): Promise<PaymentRecord | null>
}
```

### Credit Repository (`src/lib/repositories/credit-repository.ts`)
```typescript
class CreditRepository {
  // Credit operations
  async getUserCredits(userId: string): Promise<UserCreditsRecord | null>
  
  // ⭐ Idempotent credit grant
  async grantCredits(params: GrantCreditsParams): Promise<boolean>
  // Returns false if already granted (duplicate referenceId)
  
  async spendCredits(params: SpendCreditsParams): Promise<boolean>
  // Returns false if insufficient balance
  
  // Transaction history
  async getUserTransactions(userId: string, limit?: number): Promise<CreditTransactionRecord[]>
  
  // Dispute handling
  async freezeCredits(userId: string, amount: number, reason: string): Promise<boolean>
  async unfreezeCredits(userId: string, amount: number, reason: string): Promise<boolean>
}
```

## 🔄 Webhook Flow

### 1. Event Deduplication
```typescript
// Check if event already processed (prevents duplicates from webhook retries)
const isProcessed = await paymentRepository.isCreemEventProcessed(eventId);
if (isProcessed) {
  return NextResponse.json({ received: true }); // Already handled
}
```

### 2. Signature Verification
```typescript
const signature = request.headers.get('x-creem-signature');
const isValid = creemService.verifyWebhookSignature(body, signature);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3. Event Processing
```typescript
const result = await creemService.handleWebhookEvent(event);

switch (result.type) {
  case 'checkout_complete':
    // Create payment record, grant credits (if not trial)
    break;
  case 'subscription_update':
    // Detect plan changes, grant/adjust credits
    break;
  case 'payment_success':
    // Detect renewals, grant renewal credits
    break;
}
```

## 💰 Credit System

### Idempotent Credit Grants
```typescript
// Reference ID ensures idempotency
const referenceId = `creem_${subscriptionId}_${isRenewal ? 'renewal' : 'initial'}_${Date.now()}`;

const granted = await creditRepository.grantCredits({
  userId,
  amount: creditsToGrant,
  source: 'subscription',
  description: 'Pro subscription credits (Creem)',
  referenceId, // ⭐ Prevents duplicate credits
  metadata: { planId, subscriptionId, provider: 'creem' }
});

// granted = false if already processed (duplicate reference_id)
```

### Trial Handling
```typescript
// checkout_complete: DON'T grant credits during trial
if (!trialEnd) {
  await grantSubscriptionCredits(userId, planId, subscriptionId, 'monthly', false);
} else {
  console.log('Trial subscription - credits will be granted after trial ends');
}

// subscription_update: Detect trial → active transition
if (oldStatus === 'trialing' && newStatus === 'active') {
  await grantSubscriptionCredits(userId, newPlanId, subscriptionId, 'monthly', false);
}
```

### Plan Change Detection
```typescript
// Detect upgrade/downgrade
if (oldPlanId !== newPlanId) {
  await adjustCreditsForPlanChange(userId, oldPlanId, newPlanId, subscriptionId, 'monthly');
}

// Upgrade: Grant additional credits
// Downgrade: No credit removal (user keeps what they paid for)
```

### Renewal Detection
```typescript
// payment_success: Check if renewal
if (paymentRecord.status === 'active' && paymentRecord.userId) {
  const planId = paymentRecord.priceId;
  const billingCycle = paymentRecord.interval === 'year' ? 'yearly' : 'monthly';
  
  await grantSubscriptionCredits(paymentRecord.userId, planId, subscriptionId, billingCycle, true);
  //                                                                                        ^^^^ isRenewal flag
}
```

## 🚀 Usage Examples

### Check if Event Already Processed
```typescript
const isProcessed = await paymentRepository.isCreemEventProcessed(eventId);
if (isProcessed) {
  // Skip processing - webhook retry
}
```

### Grant Subscription Credits
```typescript
const granted = await creditRepository.grantCredits({
  userId: 'user_123',
  amount: 1000, // credits
  source: 'subscription',
  description: 'Pro subscription credits',
  referenceId: 'creem_sub_abc_initial_1697000000000',
  metadata: { planId: 'pro', subscriptionId: 'sub_abc' }
});

if (!granted) {
  // Credits already granted (duplicate referenceId)
}
```

### Get User Credits
```typescript
const credits = await creditRepository.getUserCredits(userId);
console.log(`Balance: ${credits?.balance}`);
console.log(`Total earned: ${credits?.totalEarned}`);
console.log(`Total spent: ${credits?.totalSpent}`);
```

### Spend Credits
```typescript
const spent = await creditRepository.spendCredits({
  userId: 'user_123',
  amount: 10,
  source: 'api_call',
  description: 'Image generation',
  metadata: { taskId: 'task_xyz' }
});

if (!spent) {
  // Insufficient balance
}
```

## 📋 Migration Instructions

1. **Run Database Migration**
   ```bash
   # Apply the migration to create all tables
   supabase migration up 20251016_create_payment_system
   ```

2. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('payment', 'payment_event', 'user_credits', 'credit_transactions', 'user_quota_usage');
   ```

3. **Test Event Deduplication**
   ```typescript
   // First webhook - should process
   const processed1 = await paymentRepository.isCreemEventProcessed('evt_123');
   // false
   
   await paymentRepository.createEvent({
     paymentId: 'pay_123',
     eventType: 'subscription.created',
     creemEventId: 'evt_123',
     eventData: '{}',
   });
   
   // Second webhook (retry) - should skip
   const processed2 = await paymentRepository.isCreemEventProcessed('evt_123');
   // true - skip processing
   ```

4. **Test Idempotent Credits**
   ```typescript
   // First call - should grant
   const granted1 = await creditRepository.grantCredits({
     userId: 'user_123',
     amount: 1000,
     source: 'subscription',
     description: 'Test',
     referenceId: 'test_ref_123',
   });
   // true
   
   // Second call (duplicate) - should skip
   const granted2 = await creditRepository.grantCredits({
     userId: 'user_123',
     amount: 1000,
     source: 'subscription',
     description: 'Test',
     referenceId: 'test_ref_123', // Same reference_id
   });
   // false - already granted
   ```

## 🔍 Debugging

### Check Event Processing
```sql
-- Check if event was processed
SELECT * FROM payment_event WHERE creem_event_id = 'evt_123';

-- View all events for a payment
SELECT * FROM payment_event WHERE payment_id = 'pay_123' ORDER BY created_at DESC;
```

### Check Credit Transactions
```sql
-- Find duplicate reference_ids (should be empty)
SELECT reference_id, COUNT(*) 
FROM credit_transactions 
WHERE reference_id IS NOT NULL 
GROUP BY reference_id 
HAVING COUNT(*) > 1;

-- View user transaction history
SELECT * FROM credit_transactions 
WHERE user_id = 'user_123' 
ORDER BY created_at DESC 
LIMIT 50;
```

### Check Credit Balance
```sql
-- Verify balance integrity
SELECT 
  user_id,
  balance,
  total_earned,
  total_spent,
  (total_earned - total_spent) as calculated_balance,
  CASE 
    WHEN balance = (total_earned - total_spent) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM user_credits
WHERE user_id = 'user_123';
```

## ⚠️ Important Notes

1. **Event Deduplication is Critical**
   - Webhook providers retry failed webhooks
   - Without deduplication, you get duplicate payments/credits
   - Always check `isCreemEventProcessed()` first

2. **Idempotency via Reference ID**
   - Use unique, deterministic reference IDs
   - Format: `creem_{subscriptionId}_{type}_{timestamp}`
   - Prevents double-credit grants from retries

3. **Trial Handling**
   - DON'T grant credits during trial creation
   - Grant credits when trial → active transition
   - Grant credits when trial ends successfully

4. **State Validation**
   - Enforces valid subscription status transitions
   - Logs warnings for invalid transitions
   - Prevents impossible state changes

5. **Downgrade Behavior**
   - User keeps credits when downgrading
   - No credit removal on downgrade
   - Fair user experience

## 🔗 Related Files

- Database: `supabase/migrations/20251016_create_payment_system.sql`
- Types: `src/types/payment.ts`
- Payment Repository: `src/lib/repositories/payment-repository.ts`
- Credit Repository: `src/lib/repositories/credit-repository.ts`
- Webhook Handler: `src/app/api/webhooks/creem/route.ts` (already exists)
- Creem Service: `src/services/payment/creem.ts`

## 📚 References

- im2prompt implementation: `/mnt/d/ai/im2prompt/src/app/api/webhooks/creem/route.ts`
- im2prompt repository: `/mnt/d/ai/im2prompt/src/server/db/repositories/payment-repository.ts`
- Creem API docs: https://docs.creem.io/webhooks
