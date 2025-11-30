# Credit Deduction Reliability Fix

## Problem

KIE.ai logs showed successful image generation, but no corresponding credit transaction records were found in the database. This meant:
- Images were generated successfully
- Credits were NOT deducted (or deduction failed silently)
- Users got free image generation

## Root Causes

1. **Non-atomic operations**: Credit deduction and transaction record creation were separate operations
2. **Silent failures**: If transaction record creation failed, the code only logged an error but didn't fail the request
3. **No rollback mechanism**: If transaction record creation failed after credit deduction, there was no way to rollback

## Solution

### 1. Atomic Database Function

Created `deduct_points_for_generation` database function that:
- Atomically deducts credits from `bestauth_subscriptions`
- Creates transaction record in `bestauth_points_transactions`
- Uses database transactions to ensure both operations succeed or both fail
- Includes optimistic locking to prevent race conditions

**Location**: `supabase/migrations/20250115_create_atomic_deduct_points_function.sql`

### 2. Updated Credit Deduction Logic

Modified `deductPointsForGeneration` function to:
- Use RPC call to the atomic database function
- Return error if RPC call fails (no silent failures)
- Ensure transaction record is always created when credits are deducted

**Location**: `src/lib/middleware/points-check.ts`

### 3. Improved Error Handling

Enhanced `generate` API to:
- Check if transaction record exists after deduction
- Return error if deduction succeeds but transaction is missing
- Prevent response if payment fails

**Location**: `src/app/api/generate/route.ts`

## Key Improvements

### ✅ Atomic Operations
- Credit deduction and transaction recording happen in a single database transaction
- If transaction record creation fails, credit deduction is automatically rolled back

### ✅ No Silent Failures
- All errors are properly logged and returned
- API returns error if credit deduction fails
- No free generation allowed

### ✅ Race Condition Protection
- Optimistic locking prevents concurrent deduction issues
- Database-level validation ensures data consistency

### ✅ Audit Trail
- Every credit deduction has a corresponding transaction record
- Transaction records include taskId for tracking
- Metadata preserved for debugging

## Migration Steps

1. **Run database migration**:
   ```sql
   -- Execute: supabase/migrations/20250115_create_atomic_deduct_points_function.sql
   ```

2. **Deploy code changes**:
   - `src/lib/middleware/points-check.ts` - Updated to use RPC
   - `src/app/api/generate/route.ts` - Improved error handling

3. **Verify**:
   - Test image generation
   - Check that transaction records are created
   - Verify credits are deducted correctly

## Testing

After deployment, verify:
1. ✅ Image generation creates transaction record
2. ✅ Credits are deducted atomically
3. ✅ If transaction record creation fails, credit deduction is rolled back
4. ✅ API returns error if deduction fails
5. ✅ No free generation possible

## Monitoring

Monitor for:
- RPC call failures (should be rare)
- Transaction record creation failures (should be zero)
- Credit deduction failures (should be zero)

## Future Improvements

1. **Pre-authorization**: Reserve credits before generation starts
2. **Retry mechanism**: Retry failed RPC calls with exponential backoff
3. **Alerting**: Alert on deduction failures
4. **Reconciliation**: Daily job to check for missing transaction records

