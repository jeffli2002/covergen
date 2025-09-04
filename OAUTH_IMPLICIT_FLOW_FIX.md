# OAuth Implicit Flow Fix

## Problem
After Google OAuth, the URL shows tokens in the fragment (#access_token=...) instead of going through /auth/callback route. This is "implicit grant flow" behavior.

## Root Cause
Supabase uses implicit flow when the redirect URL doesn't match configured URLs exactly.

## Solution

### 1. Update Supabase Dashboard Settings

Go to Supabase Dashboard → Authentication → URL Configuration:

**Site URL:** (must match EXACTLY)
```
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app
```

**Redirect URLs:** (add ALL of these)
```
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/**
http://localhost:3001/auth/callback
http://localhost:3001/**
```

### 2. Client-Side Session Recovery (Temporary Fix)

If tokens appear in URL fragment, the app should detect and process them:

```typescript
// Add to app layout or auth context
useEffect(() => {
  const hash = window.location.hash
  if (hash && hash.includes('access_token')) {
    // Parse tokens from URL fragment
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    
    if (accessToken && refreshToken) {
      // Set session manually
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
}, [])
```

### 3. Verify OAuth Flow

After fixing Supabase settings:
1. Clear all cookies/storage
2. Try OAuth again
3. Should redirect to: `/auth/callback?code=...` (not `/#access_token=...`)

## Why This Happens

Supabase decides between:
- **Authorization Code Flow**: Redirects to `/auth/callback?code=...` when redirect URL matches
- **Implicit Flow**: Returns tokens in URL fragment `/#access_token=...` when redirect URL doesn't match

The implicit flow bypasses your callback route entirely, which is why the session isn't being set properly.