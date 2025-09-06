# Unified Service Migration Guide

## Overview

This guide explains how to migrate from separate OAuth and payment services to the unified UserSessionService architecture. This consolidation solves session context loss, simplifies state management, and provides explicit customer mapping.

## Migration Steps

### Phase 1: Database Migration

1. **Run the customer mapping migration:**
   ```bash
   # Apply the new schema
   npx supabase db push
   
   # Or manually run the migration
   psql -f supabase/migrations/20250906_add_customer_mapping.sql
   ```

2. **Verify migration success:**
   ```bash
   # Check that tables were created
   npx supabase db reset --debug
   ```

### Phase 2: Service Integration

1. **Update existing components to use unified store:**

   **Before (old pattern):**
   ```typescript
   import authService from '@/services/authService'
   import { creemService } from '@/services/payment/creem'
   
   // Separate service calls with potential session loss
   const user = authService.getCurrentUser()
   const result = await creemService.createCheckoutSession(...)
   ```

   **After (unified pattern):**
   ```typescript
   import { useAppStore, useUser, useSubscription } from '@/lib/store'
   
   const { user, isAuthenticated } = useUser()
   const { createCheckoutSession } = useAppStore()
   const result = await createCheckoutSession('pro')
   ```

2. **Update authentication flows:**

   Replace direct auth service calls with store actions:
   ```typescript
   // Old way
   await authService.signInWithGoogle()
   
   // New way
   const { signInWithGoogle } = useAppStore()
   await signInWithGoogle()
   ```

### Phase 3: Component Updates

1. **Update authentication components:**

   ```typescript
   // src/components/auth/AuthForm.tsx
   import { useAppStore } from '@/lib/store'
   
   export function AuthForm() {
     const { signInWithGoogle, isLoading } = useAppStore()
     
     const handleGoogleSignIn = async () => {
       const result = await signInWithGoogle()
       if (result.success) {
         // OAuth redirect will complete the flow
       } else {
         // Handle error
         console.error(result.error)
       }
     }
     
     return (
       <button onClick={handleGoogleSignIn} disabled={isLoading}>
         Sign in with Google
       </button>
     )
   }
   ```

2. **Update payment components:**

   ```typescript
   // src/components/payment/PlanSelector.tsx
   import { useAppStore, useUser } from '@/lib/store'
   
   export function PlanSelector() {
     const { createCheckoutSession } = useAppStore()
     const { user, isAuthenticated } = useUser()
     
     const handleUpgrade = async (planId: 'pro' | 'pro_plus') => {
       if (!isAuthenticated) {
         // Will automatically show auth requirement
         return
       }
       
       const result = await createCheckoutSession(planId)
       if (result.success && result.url) {
         window.location.href = result.url
       }
     }
     
     return (
       <button onClick={() => handleUpgrade('pro')}>
         Upgrade to Pro
       </button>
     )
   }
   ```

### Phase 4: API Route Updates

1. **Update webhook configuration:**
   
   Change your Creem webhook URL from:
   ```
   https://yourdomain.com/api/webhooks/creem
   ```
   
   To:
   ```
   https://yourdomain.com/api/webhooks/creem-unified
   ```

2. **Update checkout API calls:**

   ```typescript
   // Client-side checkout calls now use unified API
   const response = await fetch('/api/payment/unified-checkout', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${session.access_token}`
     },
     body: JSON.stringify({ planId: 'pro' })
   })
   ```

### Phase 5: Error Handling Updates

The unified service provides consistent error handling:

```typescript
import { useAppStore } from '@/lib/store'

const { createCheckoutSession, error } = useAppStore()

const handlePayment = async () => {
  const result = await createCheckoutSession('pro')
  
  if (!result.success) {
    if (result.error?.includes('sign in')) {
      // Show authentication prompt
      setShowAuthModal(true)
    } else {
      // Show payment error
      setPaymentError(result.error)
    }
  }
}
```

## Key Benefits

### 1. **Session Continuity**
- Single source of truth for user session
- Automatic token refresh across all operations
- No more session loss during payment flows

### 2. **Explicit Customer Mapping**
- Clear relationship between Supabase users and Creem customers
- Session context preservation in database
- Proper webhook processing with user identification

### 3. **Simplified State Management**
- Single store for all user-related state
- Automatic synchronization between auth and payment status
- Consistent error handling patterns

### 4. **Better Error Recovery**
- Graceful handling of expired sessions
- Automatic retry mechanisms
- Clear error messages with actionable guidance

## Testing the Migration

### 1. **Authentication Flow Test**
```typescript
// Test OAuth flow maintains session
const { signInWithGoogle } = useAppStore()
await signInWithGoogle()
// Should redirect and return with valid session
```

### 2. **Payment Flow Test**
```typescript
// Test payment without session loss
const { createCheckoutSession } = useAppStore()
const result = await createCheckoutSession('pro')
// Should maintain user context throughout checkout
```

### 3. **Webhook Processing Test**
```bash
# Test webhook with session context
curl -X POST http://localhost:3000/api/webhooks/creem-unified \
  -H "Content-Type: application/json" \
  -H "creem-signature: test-signature" \
  -d '{"eventType": "checkout.completed", ...}'
```

## Rollback Strategy

If issues arise, you can temporarily rollback:

1. **Keep old services active:**
   ```typescript
   // Temporarily import old services
   import authService from '@/services/authService'
   import { creemService } from '@/services/payment/creem'
   ```

2. **Use feature flags:**
   ```typescript
   const USE_UNIFIED_SERVICE = process.env.NEXT_PUBLIC_USE_UNIFIED_SERVICE === 'true'
   
   if (USE_UNIFIED_SERVICE) {
     // Use new unified service
   } else {
     // Use old separate services
   }
   ```

3. **Gradual migration:**
   - Start with authentication only
   - Add payment integration once auth is stable
   - Migrate webhook processing last

## Performance Considerations

### 1. **Database Query Optimization**
- The unified service uses fewer database calls
- Customer mapping table is indexed for fast lookups
- Usage tracking is consolidated

### 2. **Memory Usage**
- Single service instance vs multiple services
- Reduced event listener overhead
- Consolidated state management

### 3. **Network Efficiency**
- Fewer API calls due to session management
- Automatic token refresh reduces failed requests
- Single source of truth reduces state synchronization overhead

## Security Improvements

### 1. **Session Management**
- Consistent session validation across all flows
- Automatic cleanup of expired sessions
- Centralized token refresh logic

### 2. **Customer Mapping Security**
- Explicit user-to-customer relationships
- RLS policies prevent data leakage
- Audit trail for all customer operations

### 3. **Webhook Security**
- Session context validation
- Proper signature verification
- Protected database operations

## Monitoring & Debugging

### 1. **Logging Strategy**
```typescript
// Unified service provides consistent logging
console.log('[UserSession] Operation:', { user: user.id, action: 'checkout' })
```

### 2. **Debug Endpoints**
```typescript
// Debug customer mapping
GET /api/debug/customer-mapping
```

### 3. **Health Checks**
```typescript
// Check unified service health
GET /api/health/unified-service
```

## Common Migration Issues

### 1. **Session Token Expiration**
**Problem:** Payment fails due to expired token
**Solution:** Unified service automatically refreshes tokens

### 2. **Customer Mapping Conflicts**
**Problem:** Multiple customer records for same user
**Solution:** Database constraints prevent duplicates

### 3. **Webhook Processing Delays**
**Problem:** State updates don't reflect immediately
**Solution:** Real-time state synchronization in unified service

### 4. **Component State Synchronization**
**Problem:** Different components show different user state
**Solution:** Single source of truth in Zustand store

## Post-Migration Verification

1. **End-to-End Flow Test:**
   - Sign in with Google OAuth
   - Navigate to payment page
   - Complete checkout process
   - Verify webhook processing
   - Check customer mapping creation

2. **Edge Case Testing:**
   - Expired session during payment
   - Network interruption during OAuth
   - Webhook delivery failures
   - Multiple browser tabs

3. **Performance Testing:**
   - Page load times with unified service
   - Database query performance
   - Memory usage patterns
   - API response times

## Support and Troubleshooting

If you encounter issues during migration:

1. Check the unified service logs: `[UserSession]` prefix
2. Verify database migration completed successfully
3. Ensure environment variables are properly configured
4. Test webhook endpoint functionality
5. Validate customer mapping table structure

The unified architecture provides better debugging tools and clearer error messages to help identify and resolve issues quickly.