# Payment and OAuth Integration Guide

## Overview

This document outlines the approach to integrating payment services (Creem, Stripe, PayPal) without affecting the OAuth functionality that was fixed after a 3-day debugging journey.

## Core Principles

### 1. Isolation of Concerns
- Payment services should **NEVER** directly manipulate authentication state
- Use read-only access to authentication context
- No session refresh operations during payment flows

### 2. Authentication Flow Integrity
- Maintain the simple Supabase client approach from the OAuth fix
- Respect the PKCE flow configuration
- Never create additional Supabase client instances

### 3. Payment Auth Wrapper
The `PaymentAuthWrapper` provides a safe interface for payment operations:

```typescript
// ✅ DO: Use the wrapper for auth context
const authContext = await PaymentAuthWrapper.getAuthContext()

// ❌ DON'T: Directly manipulate auth state
await authService.refreshSession() // Never do this in payment flows!
```

## Implementation Architecture

### 1. Client-Side Payment Flow
```
User clicks "Subscribe"
    ↓
PaymentAuthWrapper.isSessionValidForPayment()
    ↓ (if invalid)
Redirect to sign-in with return URL
    ↓ (if valid)
Create checkout session via API
    ↓
Redirect to payment provider
```

### 2. Server-Side API Routes
```typescript
// API routes use token validation without state modification
const { user } = await supabase.auth.getUser(token)
// Never call setSession or refreshToken in API routes
```

### 3. Webhook Processing
```typescript
// Webhooks use admin client for operations
const adminSupabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,  // Critical: no auto-refresh
    persistSession: false     // Critical: no session persistence
  }
})
```

## Key Integration Points

### 1. Payment Page Component
- Uses `PaymentAuthWrapper.isSessionValidForPayment()` instead of direct auth checks
- No session refresh operations
- Redirects to auth if session not valid for payments (< 5 minutes remaining)

### 2. Creem Service
- Client-side: Uses `PaymentAuthWrapper.getPaymentAuthHeaders()`
- Server-side: Direct SDK usage without auth manipulation
- No session refresh or auth state changes

### 3. Webhook Handlers
- Use admin Supabase client for database operations
- Validate webhook signatures without auth involvement
- Update subscriptions without touching user sessions

## Session Validity Requirements

| Operation | Minimum Session Time | Action if Invalid |
|-----------|---------------------|-------------------|
| View pricing | None | Allow access |
| Start checkout | 5 minutes | Redirect to sign-in |
| Process webhook | N/A | Use service role |
| Portal access | 5 minutes | Redirect to sign-in |

## Common Pitfalls to Avoid

### ❌ DON'T: Refresh Sessions in Payment Flows
```typescript
// WRONG - This can cause OAuth conflicts
const refreshResult = await authService.refreshSession()
```

### ❌ DON'T: Create New Supabase Clients
```typescript
// WRONG - Multiple client instances cause conflicts
const supabase = createClient(...)
```

### ❌ DON'T: Manipulate Auth State in Webhooks
```typescript
// WRONG - Webhooks should not touch user sessions
await supabase.auth.setSession(...)
```

### ✅ DO: Use Read-Only Auth Access
```typescript
// CORRECT - Read without modifying
const context = await PaymentAuthWrapper.getAuthContext()
```

### ✅ DO: Redirect for Re-authentication
```typescript
// CORRECT - Let the main auth flow handle it
if (!PaymentAuthWrapper.isSessionValidForPayment()) {
  router.push('/auth/signin?redirect=/payment')
}
```

## Testing Checklist

Before deploying payment features:

1. ✅ Test payment flow with fresh login
2. ✅ Test payment flow with expiring session (< 5 min)
3. ✅ Test payment flow after OAuth login
4. ✅ Verify no "Multiple GoTrueClient" warnings
5. ✅ Test webhook processing doesn't affect user sessions
6. ✅ Verify logout still works after payment operations
7. ✅ Check session persistence across payment redirects
8. ✅ Test concurrent OAuth and payment operations

## Monitoring

Watch for these warning signs:
- "Multiple GoTrueClient instances" console warnings
- Session state inconsistencies after payments
- OAuth redirects failing after payment attempts
- Unexpected logouts during payment flows

## Emergency Procedures

If OAuth breaks after payment integration:

1. **Immediate**: Disable payment session modifications
2. **Check**: Look for any `refreshSession()` calls in payment code
3. **Verify**: Ensure single Supabase client instance
4. **Rollback**: Use git to identify payment-related auth changes
5. **Test**: Verify OAuth flow works in isolation

## Conclusion

The key to successful payment integration is **complete isolation** from the authentication flow. The payment system should be a read-only consumer of auth state, never a modifier. This approach ensures the hard-won OAuth stability is preserved while adding payment functionality.