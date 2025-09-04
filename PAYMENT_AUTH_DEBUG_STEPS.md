# Payment Authentication Debug Steps

## Current Issues
1. OAuth returns tokens in URL fragment (implicit flow)
2. Session not persisting properly
3. Payment page "Get Started" button not working

## Quick Debug Steps

### 1. Test Current Auth State
1. Open browser console (F12)
2. Go to: https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/en/payment?plan=pro
3. Check console for:
   - `[PaymentPage] Initial load:` - Shows if authenticated
   - `[PaymentPage] handleSelectPlan called` - Shows when button clicked

### 2. Manual Session Test
In browser console, run:
```javascript
// Check current auth state
const authService = window.authService || require('@/services/authService').default
console.log('Authenticated:', authService.isAuthenticated())
console.log('Session:', authService.getCurrentSession())
console.log('User:', authService.getCurrentUser())
```

### 3. Force Authentication (Temporary)
If you see tokens in URL after OAuth:
1. The implicit flow handler should now automatically set the session
2. Refresh the page after OAuth completes
3. Try the payment page again

### 4. Check Network Tab
1. Open Network tab in browser DevTools
2. Click "Get Started" button
3. Look for `/api/payment/create-checkout` request
4. Check request headers for Authorization token
5. Check response for errors

## Root Cause
The OAuth flow is returning tokens in URL fragment instead of going through the callback route. This happens when Supabase's redirect URL configuration doesn't match exactly.

## Permanent Fix Required
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: Must exactly match your deployment URL
- **Redirect URLs**: Must include `/auth/callback` routes

## Added Features
1. Implicit flow token handler in AuthContext
2. Debug logging in payment page
3. PaymentDebug component (visible in test mode)

After the OAuth fix is applied in Supabase, the flow should work correctly without needing the implicit token handler.