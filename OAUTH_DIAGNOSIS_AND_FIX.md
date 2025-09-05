# OAuth Authentication Diagnosis and Fix

## Root Cause Analysis

After deep analysis, the OAuth issue was caused by **mixing two different OAuth flows**:

### Production (Working)
- Uses **implicit flow**: `flowType: 'implicit'` or `flowType: 'pkce'`
- Simple Supabase client from `@supabase/supabase-js`
- Tokens come in URL hash fragment (#access_token=...)
- Handled client-side
- Direct redirect to current page after OAuth

### Test Branch (Not Working)
- Attempted to use **PKCE flow** with server-side code exchange
- Complex Supabase SSR client from `@supabase/ssr`
- Has `/auth/callback` route for code exchange
- **BUT** was also trying to handle implicit flow with OAuthHashHandler
- Multiple Supabase client instances with different configurations

## The Fix Applied

### 1. Simplified Supabase Client
Created `src/lib/supabase-simple.ts` matching production:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Consistent PKCE flow
  }
})
```

### 2. Updated authService
- Changed import to use simple client
- Kept PKCE redirect URL: `/auth/callback?next=${currentPath}`

### 3. Removed Conflicting Components
- Removed OAuthHashHandler from providers (implicit flow handler)
- Kept the `/auth/callback/route.ts` for PKCE flow

## Required Supabase Configuration

Add these URLs to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs:

### For Vercel Deployment
```
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback?next=/en
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback?next=/zh
```

### For Local Development
```
http://localhost:3001/auth/callback
http://localhost:3001/auth/callback?next=/en
http://localhost:3001/auth/callback?next=/zh
```

## OAuth Flow (PKCE)

1. User clicks "Sign in with Google"
2. Redirected to Google with `redirectTo: /auth/callback?next=/en`
3. Google authenticates and redirects to Supabase
4. Supabase redirects to `/auth/callback?code=xxx&next=/en`
5. The `/auth/callback` route:
   - Exchanges code for session (server-side)
   - Sets httpOnly cookies
   - Redirects to the `next` parameter
6. User lands on `/en` with authenticated session

## Key Differences from Production

While production might use implicit flow, the test branch now consistently uses PKCE flow which is:
- More secure (no tokens in URL)
- Better for server-side rendering
- Supports httpOnly cookies

## Testing Checklist

- [ ] Clear all cookies and localStorage
- [ ] Click "Sign in with Google"
- [ ] Should redirect to Google
- [ ] After auth, should go to `/auth/callback?code=...`
- [ ] Then redirect to `/en` with user signed in
- [ ] No "Multiple GoTrueClient instances" warning
- [ ] Session persists on page refresh

## If Still Not Working

1. **Check Redirect URLs**: Ensure exact URLs are in Supabase Dashboard
2. **Check Browser Console**: Look for specific error messages
3. **Check Network Tab**: Follow the redirect chain
4. **Verify Environment Variables**: Ensure SUPABASE_URL and ANON_KEY are correct