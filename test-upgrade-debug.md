# Pro to Pro+ Upgrade Debugging Guide

## Error Investigation Checklist

### 1. **Environment Variables Check**
Run this in your browser console or create a test endpoint:
```javascript
// Check if product IDs are set
console.log('Product IDs:', {
  pro_monthly: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY,
  pro_yearly: process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY,
  proplus_monthly: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY,
  proplus_yearly: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY
})
```

### 2. **Common Error Scenarios**

#### Scenario A: Missing Creem Subscription ID
**Symptom**: `No Creem subscription ID found` error
**Cause**: User's subscription record doesn't have `stripe_subscription_id`
**Fix**: 
- Check database: `SELECT stripe_subscription_id FROM bestauth_subscriptions WHERE user_id = 'xxx'`
- If null, this means the subscription wasn't created through Creem
- Solution: User needs to go through normal checkout flow first

#### Scenario B: Invalid Product ID
**Symptom**: `Product ID not found for pro_plus (monthly)` error
**Cause**: Environment variables not set in Vercel
**Fix**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add:
   - `NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY=prod_3yWSn216dKFHKZJ0Z2Jrcp`
   - `NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY=prod_3nZODO3hED9uW2SPmp0jlW`
4. Redeploy

#### Scenario C: Creem API Error
**Symptom**: `Creem API error: [message]` in logs
**Cause**: Creem SDK call failed
**Debug Steps**:
1. Check if subscription ID exists in Creem dashboard
2. Verify API key is correct (test vs production)
3. Check Creem API status
4. Review Creem SDK version compatibility

#### Scenario D: Database Upsert Error
**Symptom**: `Database update failed` error
**Cause**: PostgreSQL constraint violation or type mismatch
**Debug**:
1. Check database logs
2. Verify schema matches expected fields
3. Check for null constraints

### 3. **Testing Strategy**

#### Test 1: Verify Current Subscription
```bash
curl -X GET https://your-domain.vercel.app/api/bestauth/subscription/status \
  -H "Cookie: your-session-cookie"
```

Expected response should include:
- `stripe_subscription_id`: Should be a valid Creem subscription ID
- `tier`: Should be 'pro'
- `billing_cycle`: Should be 'monthly' or 'yearly'

#### Test 2: Check Upgrade Endpoint
```bash
curl -X POST https://your-domain.vercel.app/api/bestauth/subscription/upgrade \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"targetTier": "pro_plus"}'
```

#### Test 3: Verify Creem Configuration
Create `/api/debug/creem-config/route.ts`:
```typescript
export async function GET() {
  return Response.json({
    testMode: process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
    hasApiKey: !!process.env.CREEM_API_KEY,
    apiKeyPrefix: process.env.CREEM_API_KEY?.substring(0, 10),
    products: {
      pro_monthly: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY,
      pro_yearly: process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY,
      proplus_monthly: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY,
      proplus_yearly: process.env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY
    }
  })
}
```

### 4. **Known Issues & Solutions**

#### Issue: "Cannot read properties of undefined"
**Root Cause**: Missing error handling in async operations
**Solution**: Enhanced error logging added in latest commit

#### Issue: Upgrade succeeds but UI doesn't update
**Root Cause**: Frontend cache not invalidating
**Solution**: Add mutation callback to refetch subscription status

#### Issue: Proration amount is null
**Root Cause**: Creem API doesn't return proration in response
**Solution**: This is expected, proration is calculated on Creem's side

### 5. **Vercel Deployment Logs**

To view actual runtime errors:
1. Go to Vercel Dashboard
2. Select your project
3. Click on the failing deployment
4. Go to "Functions" tab
5. Click on `/api/bestauth/subscription/upgrade`
6. View real-time logs

### 6. **Database Schema Check**

Verify your `bestauth_subscriptions` table has these columns:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bestauth_subscriptions'
ORDER BY ordinal_position;
```

Required columns:
- `id` (uuid, not null)
- `user_id` (uuid, not null)
- `tier` (varchar)
- `status` (varchar)
- `stripe_subscription_id` (varchar, nullable)
- `billing_cycle` (varchar, nullable)
- `previous_tier` (varchar, nullable)
- `upgrade_history` (jsonb, nullable)
- `proration_amount` (numeric, nullable)
- `last_proration_date` (timestamptz, nullable)
- `metadata` (jsonb, nullable)

### 7. **Error Code Reference**

| Error Message | Likely Cause | Fix |
|--------------|--------------|-----|
| `Unauthorized` | No valid session | Re-login |
| `No subscription found` | User never subscribed | Subscribe first |
| `Already on the selected plan` | User is already Pro+ | No action needed |
| `No Creem subscription ID found` | Subscription not in Creem | Contact support |
| `Product ID not configured` | Missing env vars | Add to Vercel |
| `Creem API error` | Creem service issue | Check Creem dashboard |
| `Database update failed` | DB constraint violation | Check DB logs |

### 8. **Next Steps for Testing**

1. **Deploy the enhanced error logging** (already done in code changes)
2. **Trigger the upgrade again** and capture the full error output
3. **Check Vercel function logs** for the detailed error with stack trace
4. **Verify environment variables** are set correctly
5. **Test with a different user** to see if it's user-specific

### 9. **Quick Fixes to Try**

#### Fix 1: Ensure Runtime is nodejs (not edge)
File: `/src/app/api/bestauth/subscription/upgrade/route.ts`
```typescript
export const runtime = 'nodejs' // Should already be set
```

#### Fix 2: Validate Subscription ID Format
Add validation before Creem call:
```typescript
if (!currentSubscription.stripe_subscription_id || 
    !currentSubscription.stripe_subscription_id.startsWith('sub_')) {
  throw new Error('Invalid Creem subscription ID format')
}
```

#### Fix 3: Add Timeout Handling
```typescript
const upgradeWithTimeout = Promise.race([
  creemService.upgradeSubscription(...),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Creem API timeout')), 30000)
  )
])
```

### 10. **Contact Points**

- **Creem Support**: Check if subscription exists in their dashboard
- **Database Admin**: Verify schema and constraints
- **Vercel Support**: Check for platform-specific issues
