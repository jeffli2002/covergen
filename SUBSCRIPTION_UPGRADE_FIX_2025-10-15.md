# Subscription Upgrade Fix - Pro to Pro+ 500 Error Resolution

## Date
2025-10-15

## Issue
Pro to Pro+ subscription upgrade was failing with HTTP 500 errors at endpoint `/api/bestauth/subscription/upgrade`. Multiple failures were recorded in logs between 10:01-10:29.

## Root Cause Analysis

### 1. Incorrect Creem SDK Method Call
**Location:** `/src/services/payment/creem.ts:1234`

**Problem:** 
```typescript
// INCORRECT - Method doesn't exist on Creem SDK
result = await (creem as any).subscriptions.upgrade({...})
```

The code was calling `creem.subscriptions.upgrade()` which doesn't exist in the Creem SDK v0.3.37. The Creem SDK has a flat API structure with `upgradeSubscription()` as a direct method on the client.

**Solution:**
```typescript
// CORRECT - Direct method call
result = await creem.upgradeSubscription({
  id: subscriptionId,
  xApiKey: CREEM_API_KEY,
  upgradeSubscriptionRequestEntity: {
    productId: productId,
    updateBehavior: 'proration-charge-immediately'
  }
})
```

### 2. Incorrect Request Body Property Name
**Location:** `/src/services/payment/creem.ts:1237`

**Problem:**
```typescript
upgradeSubscriptionRequestBody: { // WRONG property name
  productId: productId,
  updateBehavior: 'proration-charge-immediately'
}
```

**Solution:**
```typescript
upgradeSubscriptionRequestEntity: { // CORRECT property name
  productId: productId,
  updateBehavior: 'proration-charge-immediately'
}
```

### 3. Incorrect Response Structure Handling
**Location:** `/src/services/payment/creem.ts:1254-1274`

**Problem:**
The code was expecting the response to be wrapped in an `object` property:
```typescript
success: !!result.object,
subscriptionId: result.object?.id,
```

**Solution:**
The Creem SDK returns the subscription directly:
```typescript
success: !!result,
subscriptionId: result?.id,
```

### 4. Missing Runtime Configuration
**Location:** `/src/app/api/bestauth/subscription/upgrade/route.ts`

**Problem:**
The API route didn't specify a runtime, potentially running on Edge runtime which doesn't support the Creem SDK's Node.js dependencies.

**Solution:**
```typescript
export const runtime = 'nodejs'
```

## Files Modified

### 1. `/src/services/payment/creem.ts`
- **Line 1234-1241:** Fixed `upgradeSubscription` method call
  - Changed from `creem.subscriptions.upgrade()` to `creem.upgradeSubscription()`
  - Changed parameter name from `upgradeSubscriptionRequestBody` to `upgradeSubscriptionRequestEntity`
- **Line 1253-1274:** Fixed response structure handling
  - Removed incorrect `.object` property access
  - Access subscription properties directly from result

### 2. `/src/app/api/bestauth/subscription/upgrade/route.ts`
- **Line 8:** Added `export const runtime = 'nodejs'`
- **Line 176-197:** Enhanced error handling for Creem API calls with try-catch
- **Line 199-208:** Added detailed logging for Creem response validation
- **Line 244-282:** Enhanced error handling for database updates with try-catch
- **Line 279-282:** Added validation to ensure database update succeeded

## Creem SDK API Reference

Based on SDK version 0.3.37:

### UpgradeSubscription Method
```typescript
upgradeSubscription(request: UpgradeSubscriptionRequest): Promise<SubscriptionEntity>

interface UpgradeSubscriptionRequest {
  id: string                                    // Subscription ID
  xApiKey: string                              // API key
  upgradeSubscriptionRequestEntity: {
    productId: string                          // Target product ID
    updateBehavior?: 'proration-charge-immediately' | 'proration-charge' | 'proration-none'
  }
}

interface SubscriptionEntity {
  id: string
  status: string
  customer: string
  product: ProductEntity
  latestInvoice?: {
    prorationAmount?: number
    total?: number
  }
  // ... other fields
}
```

## Testing Recommendations

### 1. Manual Testing
1. Log in as a Pro user
2. Navigate to account/subscription page
3. Click "Upgrade to Pro+" button
4. Verify upgrade completes successfully
5. Check database for correct tier update
6. Verify proration amount is calculated and stored

### 2. Automated Testing
```typescript
// Test case for upgradeSubscription
describe('Creem Service - upgradeSubscription', () => {
  it('should upgrade Pro to Pro+ with immediate proration', async () => {
    const result = await creemService.upgradeSubscription(
      'sub_test_123',
      'pro_plus',
      'monthly'
    )
    
    expect(result.success).toBe(true)
    expect(result.subscription).toBeDefined()
    expect(result.prorationAmount).toBeDefined()
  })
})
```

### 3. Error Scenarios to Test
- Invalid subscription ID
- Missing Creem API key
- Network timeout
- Database connection failure
- Invalid product ID
- User already on Pro+ (should return error)

## Monitoring

### Log Points Added
1. **Creem API call initiation** - Line 176
2. **Creem API response validation** - Line 199
3. **Database update start** - Line 235
4. **Database update completion** - Line 273
5. **Error logging for Creem failures** - Line 191
6. **Error logging for database failures** - Line 265

### Success Indicators
- Log message: `[Upgrade API] SUCCESS - Returning response`
- Response includes `"success": true, "upgraded": true`
- Database `tier` field updated to target tier
- `upgrade_history` array includes new entry

### Failure Indicators
- Log message: `[Upgrade] Creem upgrade call threw exception`
- Log message: `[Upgrade] Database update failed`
- HTTP 500 response
- Response includes error details

## Rollback Plan
If issues persist:
1. Revert changes to `/src/services/payment/creem.ts`
2. Revert changes to `/src/app/api/bestauth/subscription/upgrade/route.ts`
3. Use git: `git checkout HEAD~1 -- src/services/payment/creem.ts src/app/api/bestauth/subscription/upgrade/route.ts`

## Related Documentation
- Creem SDK: https://docs.creem.io/
- BestAuth Integration: `/CLAUDE.md` section "BestAuth Integration"
- Subscription Config: `/src/lib/subscription-config.ts`

## Next Steps
1. Deploy changes to preview environment
2. Test Pro to Pro+ upgrade flow
3. Monitor logs for any remaining errors
4. If successful, deploy to production
5. Update API documentation with correct SDK usage patterns

## Notes
- The Creem SDK v0.3.37 has a flat API structure (methods directly on client)
- Always check SDK type definitions when calling external APIs
- TypeScript `any` casts should be avoided - they hide these kinds of errors
- Node.js runtime is required for Creem SDK (uses Node-specific dependencies)

## Checklist
- [x] Fixed Creem SDK method call
- [x] Fixed request parameter names
- [x] Fixed response structure handling
- [x] Added runtime configuration
- [x] Added enhanced error logging
- [x] Added error handling for Creem calls
- [x] Added error handling for database updates
- [x] Documented changes
- [ ] Tested in preview environment
- [ ] Verified in production logs
