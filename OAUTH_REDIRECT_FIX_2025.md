# OAuth Redirect to /en Fix Guide

## Problem Summary
OAuth authentication completes successfully but redirects to `/en?code=xxx` instead of `/auth/callback`, causing authentication to fail because the code is not processed properly.

## Root Cause Analysis

### 1. Supabase Site URL Configuration
The primary issue is that Supabase uses its dashboard "Site URL" configuration as the default redirect destination after OAuth, ignoring the `redirectTo` parameter in certain scenarios.

### 2. Browser-Specific Behavior
- **Works in Edge**: May have different cookie handling or session detection
- **Fails in Chrome**: Stricter cookie policies or different redirect handling

### 3. OAuth Flow Path
```
User → Google OAuth → Supabase Auth Endpoint → Site URL (not redirectTo)
```

## Solution Implementation

### Step 1: Update Supabase Dashboard Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com/project/exungkcoaihcemcmhqdr/auth/url-configuration)

2. Update **Site URL** to:
   ```
   http://localhost:3001
   ```
   (Remove any `/en` suffix or locale paths)

3. Update **Redirect URLs** to include:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/auth/callback/*
   http://localhost:3001/*
   ```

### Step 2: Code Updates Applied

#### 1. Enhanced OAuth Service (authServiceV2.ts)
- Added `response_type: 'code'` to force PKCE flow
- This ensures Supabase processes the redirect correctly

#### 2. Improved Middleware (middleware.ts)
- Enhanced OAuth code detection with error logging
- Preserves intended navigation path when redirecting
- Better handles edge cases where OAuth returns to wrong route

### Step 3: Test the Fix

1. Clear all browser data:
   ```javascript
   // In browser console
   localStorage.clear()
   sessionStorage.clear()
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

2. Test OAuth flow:
   - Navigate to http://localhost:3001/debug-oauth-redirect
   - Click "Test Actual OAuth Flow"
   - Verify redirect goes to `/auth/callback`

### Step 4: Production Configuration

For production, ensure:
```env
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```

And in Supabase Dashboard:
- Site URL: `https://covergen.pro`
- Redirect URLs: Include all production callback URLs

## Verification Steps

### 1. Check Middleware Logs
Look for in console:
```
[Middleware] OAuth callback detected: { pathname: '/auth/callback', hasCode: true, ... }
```

### 2. Verify Auth Service Logs
Look for:
```
[AuthV2] OAuth URL generated successfully
[OAuth Callback Route] Successfully authenticated, redirecting to: /en
```

### 3. Test Different Browsers
- Chrome: Should now work correctly
- Edge: Should continue to work
- Firefox: Test for consistency

## Alternative Workaround (If Dashboard Access is Limited)

If you cannot modify the Supabase dashboard configuration, use this client-side workaround:

```typescript
// In your login component
const handleGoogleLogin = async () => {
  // Store intended destination
  sessionStorage.setItem('auth_redirect', window.location.pathname)
  
  // Proceed with OAuth
  await authServiceV2.signInWithGoogle()
}

// In your root layout or app component
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code && !window.location.pathname.includes('/auth/callback')) {
    // Manually redirect to callback
    window.location.href = `/auth/callback${window.location.search}`
  }
}, [])
```

## Common Issues and Solutions

### Issue 1: Still Redirecting to /en
- **Cause**: Browser cache or Supabase session cache
- **Fix**: Hard refresh (Ctrl+Shift+R) and clear all site data

### Issue 2: "Multiple GoTrueClient instances" Warning
- **Cause**: Creating multiple Supabase clients
- **Fix**: Use a single client instance (already implemented in authServiceV2)

### Issue 3: Session Not Persisting
- **Cause**: Cookie domain mismatch
- **Fix**: Ensure Site URL in Supabase matches exactly (protocol, domain, port)

## Debug Tools Created

1. `/debug-oauth-redirect` - Comprehensive OAuth flow debugger
2. `/test-supabase-redirect` - Analyzes redirect URL generation
3. Enhanced logging in middleware and auth service

## Final Checklist

- [ ] Supabase Site URL updated to remove locale path
- [ ] Redirect URLs properly configured in dashboard
- [ ] Code updates deployed (authServiceV2.ts, middleware.ts)
- [ ] Browser cache and cookies cleared
- [ ] OAuth flow tested in multiple browsers
- [ ] Logs show correct redirect path

## Notes for Production

1. Always use HTTPS in production
2. Set proper cookie domain for production
3. Monitor OAuth callback logs for issues
4. Consider implementing fallback redirect handling