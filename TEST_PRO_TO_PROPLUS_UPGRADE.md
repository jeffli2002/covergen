# How to Test Real Pro to Pro+ Upgrade

This guide shows how to test the complete Pro → Pro+ upgrade flow with real Creem integration.

## Prerequisites

- ✅ Creem test mode enabled: `NEXT_PUBLIC_CREEM_TEST_MODE=true`
- ✅ Creem test API key: `CREEM_API_KEY=creem_test_74IKMH2ZX1ckFe451eRfF1`
- ✅ Product IDs configured in `.env.local`
- ✅ Dev server running on port 3001

## Option 1: Complete Flow (Recommended)

### Step 1: Reset User to Free Tier

```bash
npx tsx scripts/reset-user-to-free.mjs jefflee2002@gmail.com
```

Or manually:
```typescript
// Reset Jeff's subscription
await supabase
  .from('subscriptions_consolidated')
  .update({
    tier: 'free',
    stripe_subscription_id: null,
    creem_subscription_id: null,
    stripe_customer_id: null,
    plan_id: 'free'
  })
  .eq('user_id', '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a')
```

### Step 2: Subscribe to Pro Plan (via Creem Checkout)

1. **Login as Jeff:**
   - Email: `jefflee2002@gmail.com`
   - Go to: `http://localhost:3001/en`

2. **Navigate to Pricing Page:**
   ```
   http://localhost:3001/en/pricing
   ```

3. **Click "Get Pro" or "Subscribe to Pro"**

4. **Complete Creem Checkout:**
   - Use Creem test card: `4242424242424242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Wait for Redirect:**
   - You'll be redirected to `/en/payment/success?session_id=...`
   - Creem webhook will fire and set the subscription

6. **Verify Pro Subscription:**
   ```bash
   npx tsx scripts/test-jeff-upgrade.ts
   ```
   
   Should show:
   ```
   ✅ Current Subscription:
      Tier: pro
      Status: active
      Stripe Subscription ID: sub_XXXXXXXXXXXX  (real Creem ID)
   ```

### Step 3: Test Pro → Pro+ Upgrade

1. **Go to Account Page:**
   ```
   http://localhost:3001/en/account
   ```

2. **Click "Upgrade to Pro+"**
   - Should see the button in the "Current Plan" section

3. **Confirm Upgrade:**
   - Payment page should show Pro+ plan selected
   - Click "Upgrade Now" or similar button

4. **Verify Upgrade Success:**
   - Should redirect to `/en/account?upgraded=true`
   - Green success banner should appear
   - Tier should show "Pro+"
   - Credits should be updated to Pro+ allocation

5. **Check Database:**
   ```bash
   npx tsx scripts/test-jeff-upgrade.ts
   ```
   
   Should show:
   ```
   ✅ Current Subscription:
      Tier: pro_plus
      Status: active
      Stripe Subscription ID: sub_XXXXXXXXXXXX
   ```

6. **Check Creem Dashboard:**
   - Login to Creem test dashboard
   - Find Jeff's subscription
   - Should show Pro+ plan
   - Should show proration charge

## Option 2: Quick Test (Mock Subscription)

If you just want to test the upgrade UI/flow without real Creem integration:

### Step 1: Create Mock Pro Subscription

```bash
# Run this script to set Jeff to Pro with a valid-looking subscription ID
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const now = new Date().toISOString();
  const oneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('subscriptions_consolidated')
    .update({
      tier: 'pro',
      plan_id: 'pro',
      status: 'active',
      stripe_subscription_id: 'sub_mock_jeff_pro_' + Date.now(),
      stripe_customer_id: 'cus_mock_jeff_' + Date.now(),
      current_period_start: now,
      current_period_end: oneMonth
    })
    .eq('user_id', '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a')
    .select();
    
  console.log('✅ Updated subscription:', data);
})();
"
```

### Step 2: Test Upgrade Flow

1. Login and go to account page
2. Click "Upgrade to Pro+"
3. **Note:** Upgrade will fail at Creem API call with "subscription not found"
4. But you can verify:
   - ✅ UI flow works correctly
   - ✅ Validation passes
   - ✅ Request reaches upgrade endpoint
   - ❌ Creem API rejects (expected with mock ID)

## Option 3: Create Real Test Products in Creem

If you have Creem dashboard access:

### Step 1: Create Test Products

```bash
# This script creates Pro and Pro+ products in Creem test mode
npx tsx scripts/create-creem-test-products.ts
```

This will output product IDs. Update `.env.local`:
```bash
NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY=prod_XXXXX
NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY=prod_YYYYY
```

### Step 2: Follow Option 1 (Complete Flow)

Now you can do the complete flow with real Creem test products.

## Expected Results

### ✅ Successful Upgrade

**UI Response:**
```json
{
  "success": true,
  "upgraded": true,
  "immediate": true,
  "currentTier": "pro_plus",
  "previousTier": "pro",
  "prorationAmount": 500,  // Example: $5.00 prorated charge
  "redirectUrl": "/en/account?upgraded=true",
  "message": "Successfully upgraded from Pro to Pro+!",
  "note": "You now have immediate access to Pro+ features. Prorated charges have been applied to your account."
}
```

**Database Changes:**
- `tier`: `'pro'` → `'pro_plus'`
- `plan_id`: `'pro'` → `'pro_plus'`
- `updated_at`: Updated to current timestamp
- `metadata.upgrade_history`: New entry added

**Credits:**
- Pro: 100 credits/month
- Pro+: 200 credits/month
- Should see credit balance increase

### ❌ Common Errors

**1. "No Creem subscription ID found"**
```json
{
  "error": "No Creem subscription ID found",
  "details": "Your subscription is not linked to a payment provider."
}
```
**Fix:** User needs to go through checkout first (see Step 2 in Option 1)

**2. "Invalid subscription ID format"**
```json
{
  "error": "Invalid subscription ID format",
  "details": "Subscription ID should start with 'sub_'"
}
```
**Fix:** Subscription ID is malformed, reset and go through checkout again

**3. "Creem API error"**
```json
{
  "error": "Failed to process upgrade",
  "details": "Creem API error: Subscription not found"
}
```
**Fix:** The subscription ID doesn't exist in Creem (mock ID or old/deleted subscription)

## Verification Checklist

After upgrade, verify:

- [ ] Account page shows "Pro+" badge
- [ ] Credits balance updated to Pro+ allocation (200/month)
- [ ] Upgrade history shows in metadata
- [ ] Creem dashboard shows Pro+ subscription
- [ ] Proration charge appears in Creem
- [ ] Next billing date is correct
- [ ] All Pro+ features are unlocked (e.g., Sora 2 Pro videos)

## Rollback (if needed)

If you need to rollback Jeff to Pro:

```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data } = await supabase
    .from('subscriptions_consolidated')
    .update({ tier: 'pro', plan_id: 'pro' })
    .eq('user_id', '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a')
    .select();
  console.log('✅ Rolled back to Pro:', data);
})();
"
```

## Debug Commands

```bash
# Check current subscription status
npx tsx scripts/test-jeff-upgrade.ts

# Check Creem products
npx tsx scripts/check-creem-products.ts

# View upgrade logs
tail -f dev-server.log | grep -i upgrade

# Test upgrade API directly
curl -X POST http://localhost:3001/api/bestauth/subscription/upgrade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"targetTier":"pro_plus"}'
```

## Troubleshooting

### Issue: Webhook not firing after checkout

**Solution:**
1. Check webhook URL is configured in Creem dashboard
2. For local testing, use ngrok:
   ```bash
   ngrok http 3001
   # Update Creem webhook URL to: https://XXXX.ngrok.io/api/webhooks/creem
   ```

### Issue: Upgrade shows success but tier doesn't change

**Solution:**
1. Check browser console for errors
2. Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)
3. Clear session and re-login
4. Check database directly with diagnosis script

### Issue: Credits not updating after upgrade

**Solution:**
Credits update is handled separately. Check:
1. `user_usage` table for credit balance
2. Run credit sync script if needed
3. Check for webhook processing errors

## Related Documentation

- `JEFF_UPGRADE_FIX_2025-10-21.md` - Original fix documentation
- `CREEM_INTEGRATION_GUIDE.md` - Creem setup guide
- `src/app/api/bestauth/subscription/upgrade/route.ts` - Upgrade endpoint code
- `src/services/payment/creem.ts` - Creem service implementation
