# OAuth Vercel Preview Deployment Fix

## Problem Summary

OAuth sessions were not persisting on Vercel preview deployments after successful Google login. Users would be redirected back from Google with a successful authentication, but the session would not be found by the client, resulting in users remaining logged out.

## Root Cause

The issue stems from how cookies are handled on Vercel preview deployments:

1. **Dynamic URLs**: Vercel preview deployments use dynamic URLs (e.g., `project-abc123-team.vercel.app`) which can cause issues with cookie domains
2. **Cookie Timing**: There's a race condition between when the server sets cookies and when the client tries to read them
3. **httpOnly Restrictions**: Setting auth cookies as httpOnly prevents the client from reading them, which is necessary for session recovery

## Solution

### 1. Session Bridge Pattern

Created a `VercelSessionBridge` class that:
- Waits for cookies to be available after OAuth redirect
- Transfers session data from temporary cookies to Supabase's auth system
- Handles cleanup of temporary cookies

### 2. Non-httpOnly Auth Cookies

Modified the OAuth callback to NOT set httpOnly for auth-related cookies on Vercel preview deployments. This allows the client to read the session data.

### 3. Enhanced Session Recovery

Updated the `SessionRecovery` component to:
- Wait for cookies to propagate before attempting recovery
- Use the session bridge for reliable session transfer
- Implement progressive retry logic with appropriate delays

## Files Modified

1. **`/src/lib/supabase/session-bridge.ts`** (NEW)
   - Centralized session recovery logic
   - Cookie management utilities
   - Session transfer mechanism

2. **`/src/components/auth/SessionRecovery.tsx`**
   - Added VercelSessionBridge integration
   - Enhanced cookie waiting logic
   - Improved error handling

3. **`/src/lib/supabase/vercel-client.ts`**
   - Removed duplicate session processing
   - Simplified to prevent race conditions

4. **`/src/app/auth/callback-vercel/route.ts`**
   - Already had the correct non-httpOnly setting for auth cookies
   - Creates temporary session data cookie

## Debug Tools

Created `/auth/debug-vercel` endpoint for diagnostics:

```bash
# Check current auth state
curl https://your-preview.vercel.app/auth/debug-vercel

# Test cookie setting
curl https://your-preview.vercel.app/auth/debug-vercel?action=test-cookie

# Clear all auth cookies
curl https://your-preview.vercel.app/auth/debug-vercel?action=clear
```

## Testing the Fix

1. Deploy to Vercel preview
2. Navigate to the preview URL
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected back and logged in successfully

## Key Insights

1. **Cookie Propagation**: On Vercel, there's a delay between when cookies are set by the server and when they're available to the client
2. **Session Storage**: Using localStorage as a fallback for session storage improves reliability
3. **Progressive Retries**: Multiple retry attempts with increasing delays handle the timing issues
4. **Explicit Cleanup**: Always clean up temporary cookies and URL parameters after successful recovery

## Monitoring

Look for these console logs to verify proper operation:

```
[SessionRecovery] Using VercelSessionBridge for recovery...
[VercelSessionBridge] Found session data, attempting to set session...
[VercelSessionBridge] Session successfully set
[SessionRecovery] Session recovered successfully via bridge
```

## Future Improvements

1. Consider implementing a WebSocket connection for real-time session updates
2. Add telemetry to track success rates of different recovery methods
3. Implement a fallback manual session entry UI for edge cases