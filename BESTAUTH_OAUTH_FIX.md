# BestAuth OAuth Fix Guide

## Problem
The Google OAuth callback is redirecting to `/auth/callback` (old Supabase URL) instead of `/api/auth/callback/google` (BestAuth URL).

## Root Cause
The OAuth redirect URL configured in Google Cloud Console is still pointing to the old Supabase callback URL.

## Solution

### 1. Update Google Cloud Console
Go to your Google Cloud Console and update the OAuth redirect URL:

**Old (Supabase):**
```
https://your-domain.com/auth/callback
http://localhost:3000/auth/callback
```

**New (BestAuth):**
```
https://your-domain.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### 2. OAuth Flow with BestAuth
The correct OAuth flow is:
1. User clicks "Sign in with Google"
2. Frontend calls `signInWithGoogle()` from BestAuth context
3. This redirects to `/api/auth/oauth/google`
4. BestAuth generates OAuth URL and redirects to Google
5. Google redirects back to `/api/auth/callback/google`
6. BestAuth handles the callback and sets session cookie
7. User is redirected to dashboard

### 3. Current Implementation
- OAuth initiation: `/api/auth/oauth/[provider]/route.ts`
- OAuth callback: `/api/auth/callback/[provider]/route.ts`
- Frontend hook: `useBestAuth.ts` - `signInWithOAuth()`
- Context wrapper: `BestAuthContext.tsx` - `signInWithGoogle()`

### 4. Testing
After updating the redirect URL in Google Cloud Console:
1. Clear all cookies and browser storage
2. Try signing in with Google
3. Check that the redirect goes to `/api/auth/callback/google`
4. Verify the session cookie is set correctly

## Note
The middleware should not intercept BestAuth OAuth callbacks. The current middleware correctly allows `/api` routes to pass through.