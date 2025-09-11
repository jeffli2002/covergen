# OAuth Popup Redirect Issue - Root Cause and Fix

## Problem Summary

The OAuth popup is redirecting to `/en?code=xxx` instead of staying on `/auth/callback-popup?code=xxx`. This prevents the popup from closing automatically and breaks the popup OAuth flow.

## Root Cause

Google OAuth is configured in Supabase to redirect to the base URL instead of the specific callback-popup route. This is a **Supabase configuration issue**, not a code issue.

## Evidence

1. **Code Analysis**: The `signInWithGooglePopup()` method correctly sets:
   ```typescript
   redirectTo: `${window.location.origin}/auth/callback-popup?next=${encodeURIComponent(currentPath)}`
   ```

2. **Dev Server Logs** show OAuth redirecting to base URL:
   ```
   GET /en?code=3de52d7b-a0be-4b6f-b5e1-71635f311e53 200 in 296ms
   GET /en?code=c2fe3759-6ac5-43b1-b135-b0119abaa062 200 in 303ms
   ```

3. **Middleware** properly excludes `/auth` routes from redirection (line 56 in middleware.ts)

## Solution

### Step 1: Update Supabase Dashboard

1. Log in to your Supabase Dashboard
2. Navigate to **Authentication → Providers → Google**
3. In the **"Redirect URLs"** section, add ALL these URLs:
   - `http://localhost:3001/auth/callback-popup` (for development)
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3001/auth/callback-official`
   - `https://yourdomain.com/auth/callback-popup` (for production)
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/callback-official`

4. Click **Save**
5. Wait 1-2 minutes for changes to propagate

### Step 2: Verify Configuration

Visit `http://localhost:3001/auth/oauth-config-check` to see:
- Your current origin
- Expected redirect URLs
- Detailed fix instructions

### Step 3: Test

1. Clear browser cookies/cache
2. Try the Google OAuth popup flow
3. The popup should now:
   - Stay on `/auth/callback-popup?code=xxx`
   - Display "Sign In Successful!"
   - Close automatically after 1.5 seconds

## Why This Happens

When you call `supabase.auth.signInWithOAuth()` with a `redirectTo` parameter, Supabase passes this to the OAuth provider. However, the OAuth provider (Google) will only redirect to URLs that are explicitly whitelisted in the Supabase dashboard. If the URL isn't whitelisted, Google falls back to the default redirect URL (usually the base domain).

## Current Implementation

Our code already handles:
- ✅ COOP headers (`Cross-Origin-Opener-Policy: same-origin-allow-popups`)
- ✅ PostMessage communication with fallback to localStorage
- ✅ Popup detection and automatic closing
- ✅ Middleware exclusions for auth routes

The only missing piece is the Supabase dashboard configuration.

## Debugging Commands

```bash
# Check if popup route is accessible
curl -I http://localhost:3001/auth/callback-popup

# Test with a fake OAuth code
curl -I "http://localhost:3001/auth/callback-popup?code=TEST"

# Monitor redirect chain
curl -L -v "http://localhost:3001/auth/callback-popup?code=TEST" 2>&1 | grep -i location
```