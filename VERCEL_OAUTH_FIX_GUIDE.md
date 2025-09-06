# Vercel OAuth Authentication Fix Guide

## Problem Summary

When using OAuth authentication on Vercel preview deployments, users were being redirected successfully but remained in an unsigned-in state. This occurs because the dynamic Vercel preview URLs (e.g., `https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app`) may not be configured as allowed redirect URLs in the Supabase dashboard.

## Root Cause

1. **Dynamic Preview URLs**: Vercel generates unique URLs for each preview deployment
2. **Redirect URL Mismatch**: Supabase OAuth requires exact redirect URL matches
3. **Cookie Domain Issues**: Preview deployments have different domains that can affect cookie persistence

## Solution Implementation

### 1. Enhanced Auth Callback Route
Added comprehensive logging to `/src/app/auth/callback/route.ts`:
- Logs environment details (NODE_ENV, VERCEL_ENV, VERCEL_URL)
- Tracks cookie operations during OAuth flow
- Provides detailed session exchange information
- Adds success marker cookie for debugging

### 2. UserSessionService Logging
Enhanced `/src/services/unified/UserSessionService.ts`:
- Logs redirect URL construction
- Identifies Vercel preview deployments
- Tracks OAuth initiation details

### 3. Debug Tools Created

#### Auth State Test Page (`/auth-state-test`)
- Compares authentication state across:
  - Supabase direct session
  - UserSessionService state
  - App Store state
- Highlights mismatches in auth state
- Shows current environment details

#### Auth Session Debug Page (`/auth-session-debug`)
- Displays current session details
- Shows all cookies
- Provides manual session refresh
- Environment information

## Configuration Requirements

### Supabase Dashboard Setup

1. **Add Wildcard Redirect URLs** (for development):
   ```
   http://localhost:3000/auth/callback
   https://*.vercel.app/auth/callback
   https://your-production-domain.com/auth/callback
   ```

2. **Alternative: Use Fixed Preview Domain**:
   - Set up a Vercel preview domain alias
   - Configure it in Supabase as an allowed redirect URL

### Environment Variables

Ensure these are set in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing OAuth Flow

1. Visit `/auth-state-test` on your preview deployment
2. Click "Sign In with Google"
3. Monitor browser console for detailed logs:
   - `[UserSession] Google sign-in initiated`
   - `[Auth Callback] Processing OAuth callback`
   - `[Auth Callback] Code exchange successful`

4. After redirect, check auth state consistency

## Common Issues and Solutions

### Issue: "Redirect URL mismatch" error
**Solution**: Add the exact preview URL to Supabase allowed redirect URLs

### Issue: Session exists but user appears signed out
**Solution**: Check cookie settings and ensure `secure` flag matches protocol

### Issue: Auth state mismatch between services
**Solution**: Force refresh the page or clear all auth-related cookies

## Debugging Commands

```bash
# Check auth cookies in browser console
document.cookie.split('; ').filter(c => c.includes('sb-') || c.includes('supabase'))

# Force session refresh
await userSessionService.refreshSession()

# Check all auth states
window.location.href = '/auth-state-test'
```

## Production Considerations

1. **Use environment-specific redirect URLs**:
   ```typescript
   const getRedirectUrl = () => {
     if (process.env.VERCEL_ENV === 'preview') {
       return `${window.location.origin}/auth/callback`
     }
     return process.env.NEXT_PUBLIC_APP_URL + '/auth/callback'
   }
   ```

2. **Implement OAuth state parameter** for additional security

3. **Monitor auth callback errors** in production logs

## Next Steps

1. Configure Supabase to accept wildcard Vercel preview URLs
2. Test OAuth flow on new preview deployments
3. Monitor auth state consistency using debug tools
4. Consider implementing a more robust session management strategy