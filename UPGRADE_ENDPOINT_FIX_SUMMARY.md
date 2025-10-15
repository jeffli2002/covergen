# Pro to Pro+ Upgrade Endpoint - 500 Error Investigation & Fixes

## Summary
The Pro to Pro+ upgrade endpoint (`POST /api/bestauth/subscription/upgrade`) was returning 500 errors. This document outlines the investigation, code fixes applied, and debugging steps to identify the root cause.

## Code Changes Applied

### 1. Enhanced Error Logging in Upgrade API
**File**: `/src/app/api/bestauth/subscription/upgrade/route.ts`

**Changes**:
- Added comprehensive error logging with detailed error object inspection
- Captures error type, constructor, stack trace, status codes, and response data
- Returns structured error response with debugging information and timestamp

**Purpose**: To capture the actual runtime error that's causing the 500 response, which wasn't visible in the previous logs.

### 2. Detailed Creem Service Call Logging
**File**: `/src/app/api/bestauth/subscription/upgrade/route.ts`

**Changes**:
- Added pre-call logging with parameter validation
- Logs subscription ID type, length, and format before Creem API call
- Enhanced error handling with full error object details

**Purpose**: To identify if the error occurs during the Creem API call and capture Creem-specific error details.

### 3. Enhanced Subscription Service Logging
**File**: `/src/services/bestauth/BestAuthSubscriptionService.ts`

**Changes**:
- Added detailed logging in `createOrUpdateSubscription` method
- Logs before database upsert operation
- Captures upsert result details

**Purpose**: To identify if the error occurs during database operations.

### 4. Subscription ID Validation
**File**: `/src/app/api/bestauth/subscription/upgrade/route.ts`

**Changes**:
- Added validation for missing `stripe_subscription_id`
- Added format validation (must start with `sub_`)
- Returns descriptive error messages with subscription context

**Purpose**: To catch data integrity issues early and provide actionable error messages.

### 5. Debug Diagnostic Endpoint
**File**: `/src/app/api/debug/upgrade-test/route.ts` (NEW)

**Purpose**: 
- Provides comprehensive diagnostic information about upgrade readiness
- Checks environment variables, Creem configuration, subscription status
- Simulates what would happen during an upgrade attempt
- Identifies blockers before attempting actual upgrade

**Usage**: `GET /api/debug/upgrade-test`

## Potential Root Causes Identified

### High Probability Issues

#### 1. **Missing Creem Subscription ID**
**Symptom**: Database has `stripe_subscription_id` as NULL
**Cause**: User upgraded to Pro through a non-Creem flow or webhook didn't fire
**Detection**: Enhanced validation will return clear error message
**Fix**: User needs to re-subscribe through proper Creem checkout

#### 2. **Missing Environment Variables**
**Symptom**: `CREEM_PRODUCTS[pro_plus_monthly]` is undefined
**Cause**: Vercel environment variables not set correctly
**Detection**: Debug endpoint will show "NOT SET" for products
**Fix**: Set these in Vercel:
```
NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY=prod_3yWSn216dKFHKZJ0Z2Jrcp
NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY=prod_3nZODO3hED9uW2SPmp0jlW
```

#### 3. **Creem SDK Error**
**Symptom**: Creem API rejects the upgrade request
**Possible Causes**:
- Subscription doesn't exist in Creem
- Invalid API key
- Subscription in wrong state (cancelled, incomplete)
- Product ID mismatch
**Detection**: Enhanced error logging will capture Creem SDK error details
**Fix**: Check Creem dashboard for subscription status

#### 4. **Database Constraint Violation**
**Symptom**: PostgreSQL throws error during upsert
**Possible Causes**:
- Invalid data type for upgrade_history (expecting JSONB array)
- Null constraint violation
- Foreign key constraint
**Detection**: Enhanced logging will show database error
**Fix**: Check database schema and constraints

### Medium Probability Issues

#### 5. **Runtime Type Error**
**Symptom**: TypeError during execution
**Cause**: Accessing property of undefined object
**Detection**: Enhanced error logging will show exact line and stack trace
**Fix**: Add null checks in code

#### 6. **Async Operation Timeout**
**Symptom**: Creem API call hangs
**Cause**: Network issues or Creem API slowness
**Detection**: Won't see "Creem call completed successfully" log
**Fix**: Add timeout wrapper (30 seconds)

## Testing & Debugging Steps

### Step 1: Run Diagnostic Endpoint
```bash
curl https://your-domain.vercel.app/api/debug/upgrade-test \
  -H "Cookie: bestauth.session.token=YOUR_SESSION_TOKEN"
```

Expected output will show:
- Current subscription details
- Environment configuration
- Product ID mapping
- Any blockers preventing upgrade
- Simulation of what would happen

### Step 2: Attempt Upgrade with Enhanced Logging
```bash
curl -X POST https://your-domain.vercel.app/api/bestauth/subscription/upgrade \
  -H "Cookie: bestauth.session.token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetTier": "pro_plus"}'
```

### Step 3: Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click on the deployment
3. Go to "Functions" tab
4. Find `/api/bestauth/subscription/upgrade`
5. Look for the detailed error logs added

You should now see:
```
=================================================================
[Upgrade API] FATAL ERROR
=================================================================
[Upgrade API] Error object: { ... }
[Upgrade API] Error type: Error
[Upgrade API] Error constructor: Error
[Upgrade API] Error message: [Actual error message]
[Upgrade API] Full error details: { ... }
=================================================================
```

### Step 4: Verify Environment Variables
Run the debug endpoint or create this test:
```bash
curl https://your-domain.vercel.app/api/debug/upgrade-test
```

Check the `creem.envVars` section for all required variables.

### Step 5: Check Database State
```sql
SELECT 
  user_id,
  tier,
  status,
  stripe_subscription_id,
  billing_cycle,
  previous_tier,
  upgrade_history,
  proration_amount
FROM bestauth_subscriptions
WHERE user_id = 'your-user-id';
```

## Expected Behavior After Fixes

### Success Case
1. User calls upgrade endpoint
2. Logs show each step:
   - Session validation ✓
   - Subscription retrieval ✓
   - Subscription ID validation ✓
   - Creem API call start ✓
   - Creem API call success ✓
   - Database update ✓
   - Response sent ✓
3. Returns 200 with upgrade confirmation

### Error Case (Now with Clear Messages)
1. If subscription ID missing:
   ```json
   {
     "error": "No Creem subscription ID found",
     "details": "Your subscription is not linked to a payment provider. Please contact support.",
     "subscriptionInfo": { "tier": "pro", "status": "active", "hasStripeId": false }
   }
   ```

2. If product ID not configured:
   ```json
   {
     "error": "Product ID not found for pro_plus (monthly)",
     "debugInfo": { ... }
   }
   ```

3. If Creem API fails:
   ```json
   {
     "error": "Failed to process upgrade",
     "details": "Creem API error: [specific error]",
     "debugInfo": { "message": "...", "statusCode": 400, "response": {...} }
   }
   ```

## Required Environment Variables Checklist

Verify these are set in Vercel:

### Creem API Configuration
- [ ] `CREEM_API_KEY` or `CREEM_SECRET_KEY` (test or production)
- [ ] `CREEM_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_CREEM_TEST_MODE=true` (for testing)

### Product IDs
- [ ] `NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY=prod_7aQWgvmz1JHGafTEGZtz9g`
- [ ] `NEXT_PUBLIC_PRICE_ID_PRO_YEARLY=prod_3QjtByYdiEKvz1VinwtmAp`
- [ ] `NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY=prod_3yWSn216dKFHKZJ0Z2Jrcp`
- [ ] `NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY=prod_3nZODO3hED9uW2SPmp0jlW`

### Database
- [ ] `BESTAUTH_DATABASE_URL` (PostgreSQL connection string)

### BestAuth
- [ ] `BESTAUTH_JWT_SECRET`

## Next Steps

1. **Deploy these changes** to your Vercel environment
2. **Run the diagnostic endpoint** to identify blockers
3. **Attempt upgrade** and capture the detailed error logs
4. **Share the error details** from Vercel function logs for further investigation

The enhanced logging will now show exactly where and why the upgrade is failing, making it much easier to identify and fix the root cause.

## Files Modified

1. `/src/app/api/bestauth/subscription/upgrade/route.ts` - Enhanced error logging and validation
2. `/src/services/bestauth/BestAuthSubscriptionService.ts` - Added upsert logging
3. `/src/app/api/debug/upgrade-test/route.ts` - NEW diagnostic endpoint
4. `/test-upgrade-debug.md` - Comprehensive debugging guide
5. This file - Summary documentation

## Error Classification Matrix

| Error Type | Detection Method | User Action | Developer Action |
|------------|-----------------|-------------|------------------|
| Missing subscription ID | Validation check | Contact support | Fix webhook handling |
| Invalid ID format | Format validation | Contact support | Investigate data source |
| Missing env vars | Debug endpoint | None | Set in Vercel |
| Creem API error | Enhanced logs | Retry later | Check Creem dashboard |
| Database error | Enhanced logs | Contact support | Fix schema/constraints |
| Timeout | No completion log | Retry | Add timeout handling |
| Type error | Stack trace | Contact support | Fix code |

## Monitoring Recommendations

1. Set up Vercel log aggregation for `/api/bestauth/subscription/upgrade`
2. Create alerts for 500 errors on this endpoint
3. Monitor Creem webhook delivery success rate
4. Track upgrade completion rate vs. attempts
5. Monitor database constraint violations

---

**Last Updated**: 2025-10-15
**Status**: Investigation in progress - Enhanced logging deployed
**Next Review**: After capturing error logs from production
