# Supabase OAuth Configuration for Vercel Deployments

## Issue
OAuth redirects to `/en` without creating a session on Vercel deployment.

## Root Cause
The Supabase Site URL configuration is redirecting to `/en` instead of allowing the OAuth callback to process the authentication code.

## Solution

### 1. Update Supabase Dashboard Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → URL Configuration**
3. Update the following settings:

#### Site URL
- Set this to your production URL: `https://covergen.pro`
- **DO NOT** include `/en` or any path

#### Redirect URLs (Allow List)
Add the following URLs with wildcards to support all environments:

```
http://localhost:3000/**
https://covergen.pro/**
https://*.vercel.app/**
https://covergen-*.vercel.app/**
```

### 2. OAuth Provider Configuration

In your OAuth provider (Google, GitHub, etc.), ensure the redirect URI includes:
- `https://covergen.pro/auth/callback`
- `https://covergen-*.vercel.app/auth/callback` (for preview deployments)

### 3. Code Implementation

The OAuth flow is implemented correctly:
1. OAuth initiates with redirect to `/auth/callback`
2. Callback route exchanges code for session
3. Redirects to original page with `auth_callback=success` parameter
4. SessionRecovery component establishes the session

### 4. Environment Variables

Ensure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional, for explicit control)

### 5. Testing

1. Clear browser cookies
2. Try OAuth sign-in
3. Check browser console for:
   - `[OAuthService] Initiating OAuth sign-in`
   - `[Auth Callback] Processing OAuth callback`
   - `[SessionRecovery] Attempting session recovery`

## Common Pitfalls

1. **Site URL with path**: Don't include `/en` in Site URL
2. **Missing wildcards**: Vercel preview URLs need wildcard patterns
3. **Wrong callback URL**: Ensure OAuth redirects to `/auth/callback`
4. **Cookie issues**: Vercel preview deployments may have cookie restrictions

## Debug Steps

If OAuth still fails:
1. Check Supabase logs for auth errors
2. Verify redirect URLs in network tab
3. Check if code parameter is present in callback
4. Ensure cookies are being set correctly