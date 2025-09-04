# Payment Flow Fix Instructions

## Issue Summary
The payment flow is bypassing the Creem checkout form and going directly to the success page. This happens because of configuration issues with the Creem integration.

## Root Causes

1. **Invalid Creem Public Key**
   - Current: `pk_test_dummy_key_for_development`
   - This dummy key cannot create valid checkout sessions

2. **Mismatched Product IDs**
   - Code expects: `prod_test_pro`, `prod_test_proplus`
   - Environment has: `prod_7aQWgvmz1JHGafTEGZtz9g`, `prod_3yWSn216dKFHKZJ0Z2Jrcp`

3. **Possible Missing Creem Configuration**
   - Products might not be set up in Creem dashboard
   - Webhook endpoints might not be configured

## Immediate Fix Steps

### Step 1: Get Valid Creem Test Keys
1. Log into [Creem Dashboard](https://dashboard.creem.io)
2. Switch to Test Mode
3. Go to API Keys section
4. Copy the test public key (starts with `pk_test_`)
5. Copy the test secret key (starts with `sk_test_`)

### Step 2: Update Environment Variables
```env
# Update these in .env.local
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_test_YOUR_ACTUAL_TEST_KEY
CREEM_SECRET_KEY=sk_test_YOUR_ACTUAL_TEST_SECRET
```

### Step 3: Fix Product ID Mismatch
Either update the code or create test products:

**Option A: Update Code** (Recommended for quick fix)
```typescript
// In src/services/payment/creem.ts
export const CREEM_PRODUCTS = {
  pro: CREEM_TEST_MODE ? 'prod_7aQWgvmz1JHGafTEGZtz9g' : 'prod_pro',
  pro_plus: CREEM_TEST_MODE ? 'prod_3yWSn216dKFHKZJ0Z2Jrcp' : 'prod_proplus',
}
```

**Option B: Create Test Products in Creem**
1. In Creem Dashboard (Test Mode)
2. Create products with IDs: `prod_test_pro`, `prod_test_proplus`
3. Set up pricing for each product

### Step 4: Debug the Checkout Creation
Add logging to identify the exact issue:

```typescript
// In src/app/api/payment/create-checkout/route.ts
console.log('Creating Creem checkout with:', {
  productId,
  userId: user.id,
  email: user.email
});

const result = await creemService.createCheckoutSession({...});
console.log('Creem result:', result);
```

### Step 5: Test the Flow
1. Open browser DevTools
2. Go to Network tab
3. Click a subscription button
4. Check the `/api/payment/create-checkout` request:
   - Is it returning a URL?
   - Any error messages?
   - Status code?

## Manual Testing Script

Run this in the browser console after signing in:

```javascript
// Test payment API directly
async function testPaymentAPI(plan = 'pro') {
  const token = JSON.parse(localStorage.getItem('sb-xkcbzfouxjahefqvkdyw-auth-token')).access_token;
  
  const response = await fetch('/api/payment/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      planId: plan,
      successUrl: `${window.location.origin}/en/payment/success`,
      cancelUrl: `${window.location.origin}/en/payment/cancel`
    })
  });
  
  const data = await response.json();
  console.log('API Response:', data);
  
  if (data.url) {
    console.log('Checkout URL:', data.url);
    // Uncomment to actually redirect
    // window.location.href = data.url;
  }
}

// Run the test
testPaymentAPI('pro');
```

## Expected vs Actual Behavior

### Expected Flow:
1. Click "Get Started" → `/api/payment/create-checkout` called
2. API returns `{ url: "https://checkout.creem.io/session/..." }`
3. Browser redirects to Creem checkout page
4. User enters payment details
5. On success → redirect to `/payment/success`

### Current Flow:
1. Click "Get Started" → `/api/payment/create-checkout` called
2. API returns success but with invalid/no URL
3. Error handling or fallback redirects to success page

## Quick Workarounds

### Workaround 1: Test with Stripe Instead
If Creem setup is blocking, temporarily use Stripe:
1. Set up Stripe test keys
2. Replace Creem service with Stripe
3. Use Stripe's well-documented test flow

### Workaround 2: Mock Payment Flow
For development only:
```typescript
// In create-checkout route
if (process.env.MOCK_PAYMENTS === 'true') {
  return NextResponse.json({
    sessionId: 'mock_session_' + Date.now(),
    url: `/en/payment/mock-checkout?plan=${planId}`
  });
}
```

## Verification Checklist

- [ ] Valid Creem test API keys in `.env.local`
- [ ] Products exist in Creem dashboard
- [ ] Product IDs match between code and Creem
- [ ] Webhook endpoint configured in Creem
- [ ] No JavaScript errors in console
- [ ] `/api/payment/create-checkout` returns valid URL
- [ ] Creem checkout page loads properly

## Support Resources

1. [Creem Documentation](https://docs.creem.io)
2. [Creem API Reference](https://api.creem.io/docs)
3. Creem Support: support@creem.io

## Next Steps

1. Update environment variables with real test keys
2. Fix product ID mismatch
3. Test the payment flow
4. If still failing, check Creem dashboard logs
5. Contact Creem support if needed