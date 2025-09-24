# Checkout Session Safeguards Documentation

## Overview

This document describes the comprehensive safeguards implemented to prevent multiple concurrent checkout sessions in the payment system. The implementation uses a multi-layered approach to ensure robustness and handle edge cases properly.

## Architecture

### Database Layer

1. **Checkout Sessions Table** (`checkout_sessions`)
   - Tracks all checkout sessions with their status
   - Enforces unique constraint: only one pending session per user
   - Automatic expiration after 30 minutes
   - Status tracking: pending, completed, expired, cancelled

2. **Rate Limiting Table** (`checkout_rate_limits`)
   - Tracks checkout attempts per user
   - Enforces maximum 5 attempts per hour per user
   - Automatically cleaned up after 24 hours

### Application Layer

1. **Pre-creation Checks**
   - Verify no active sessions exist
   - Check rate limits
   - Return existing session if still valid

2. **Session Recording**
   - Record every checkout session creation
   - Track metadata for debugging
   - Update rate limit counters

3. **Webhook Integration**
   - Mark sessions as completed on successful payment
   - Handle edge cases like duplicate webhooks

### Frontend Layer

1. **Protected Upgrade Button**
   - Disables on click to prevent double-clicks
   - Shows loading state during session creation
   - Handles errors gracefully with user feedback

2. **Debouncing & Request Management**
   - Prevents requests within 2 seconds of each other
   - Blocks concurrent requests
   - Provides clear error messages

## Implementation Details

### Database Functions

```sql
-- Check if user can create checkout session
can_create_checkout_session(user_id, max_attempts, window_minutes)
Returns: {allowed, reason, active_session_id, attempts_remaining}

-- Record new checkout session
record_checkout_session(user_id, session_id, plan_id, expires_minutes, metadata)
Returns: session_id

-- Complete checkout session
complete_checkout_session(session_id, subscription_id)
Returns: success

-- Expire old sessions
expire_old_checkout_sessions()
Returns: expired_count

-- Clean up rate limits
cleanup_old_rate_limits()
Returns: deleted_count
```

### API Endpoints

1. **POST /api/payment/create-checkout**
   - Checks eligibility before creating session
   - Records session in database
   - Returns existing session if active

2. **GET/POST /api/cron/cleanup-checkout-sessions**
   - Expires old sessions
   - Cleans up rate limit records
   - Should be called hourly

### React Hooks

1. **useCheckoutSession**
   - Manages checkout session creation
   - Handles loading states
   - Prevents concurrent requests
   - Provides error handling

2. **useUpgradeButton**
   - Specialized hook for upgrade buttons
   - Manages button disabled state
   - Auto-redirects on success

## Configuration

```typescript
const CHECKOUT_CONFIG = {
  maxAttemptsPerHour: 5,          // Maximum checkout attempts per hour
  sessionExpirationMinutes: 30,   // Session expiration time
  concurrentCheckMessage: '...',  // Message for concurrent session
  rateLimitMessage: '...'         // Message for rate limit
}
```

## Error Handling

### User-Facing Errors

1. **Active Session Exists**
   - Message: "You already have an active checkout session..."
   - Action: Returns existing session URL
   - HTTP Status: 200 (with existing session)

2. **Rate Limit Exceeded**
   - Message: "Too many checkout attempts..."
   - Action: Blocks creation
   - HTTP Status: 429

3. **System Errors**
   - Message: "Unable to process checkout request..."
   - Action: Logs error, safe fallback
   - HTTP Status: 500

### Monitoring

The system includes comprehensive monitoring:

1. **Analytics View** (`checkout_session_analytics`)
   - Daily session counts
   - Conversion rates
   - Average completion times
   - Unique user counts

2. **Admin Dashboard Component**
   - Real-time analytics
   - Session status breakdown
   - Conversion tracking

## Usage Examples

### Basic Upgrade Button

```tsx
import { ProtectedUpgradeButton } from '@/components/payment/ProtectedUpgradeButton'

<ProtectedUpgradeButton planId="pro" />
```

### Custom Implementation

```tsx
import { useCheckoutSession } from '@/hooks/useCheckoutSession'

function CustomUpgrade() {
  const { createCheckoutSession, isCreating, error } = useCheckoutSession({
    onSuccess: (sessionId) => console.log('Session created:', sessionId),
    onError: (error) => console.error('Error:', error)
  })

  return (
    <button 
      onClick={() => createCheckoutSession('pro')}
      disabled={isCreating}
    >
      {isCreating ? 'Creating...' : 'Upgrade'}
    </button>
  )
}
```

### Admin Monitoring

```tsx
import { CheckoutSessionMonitor } from '@/components/admin/CheckoutSessionMonitor'

// In admin dashboard
<CheckoutSessionMonitor />
```

## Maintenance

### Automated Tasks

1. **Hourly Cleanup**
   - Set up cron job to call `/api/cron/cleanup-checkout-sessions`
   - Expires sessions older than 30 minutes
   - Cleans rate limit records older than 24 hours

2. **Monitoring**
   - Review analytics weekly
   - Monitor conversion rates
   - Check for unusual patterns

### Manual Interventions

If needed, admins can:
1. Manually expire sessions via database
2. Reset rate limits for specific users
3. View detailed session history

## Security Considerations

1. **Database Constraints**
   - Enforced at database level (cannot bypass)
   - Unique constraints prevent race conditions

2. **Rate Limiting**
   - Prevents abuse and excessive API calls
   - Configurable limits

3. **Session Expiration**
   - Automatic cleanup prevents stale sessions
   - Configurable expiration time

4. **Audit Trail**
   - All sessions tracked with metadata
   - Complete history for debugging

## Future Enhancements

1. **Dynamic Rate Limits**
   - Different limits for different user tiers
   - Adaptive limits based on behavior

2. **Session Recovery**
   - Allow users to recover expired sessions
   - Email reminders for abandoned checkouts

3. **Advanced Analytics**
   - Funnel analysis
   - A/B testing support
   - Revenue impact tracking

## Troubleshooting

### Common Issues

1. **"Active session exists" but user can't find it**
   - Check session expiration time
   - Verify Creem/Stripe session is still valid
   - Check for browser issues

2. **Rate limit hit unexpectedly**
   - Check for automated/bot traffic
   - Review user's attempt history
   - Consider increasing limits

3. **Sessions not completing**
   - Verify webhook configuration
   - Check webhook signatures
   - Review webhook logs

### Debug Queries

```sql
-- View active sessions for a user
SELECT * FROM checkout_sessions 
WHERE user_id = ? AND status = 'pending';

-- Check rate limits for a user
SELECT * FROM checkout_rate_limits 
WHERE user_id = ? AND window_end > NOW();

-- View analytics for specific date
SELECT * FROM checkout_session_analytics 
WHERE date = ?;
```

## Contact

For questions or issues with the checkout session system:
- Review logs in application monitoring
- Check database constraints and functions
- Contact the payment team for assistance