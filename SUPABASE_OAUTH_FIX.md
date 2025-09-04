# Supabase OAuth Configuration Fix

## Problem Summary
The Google OAuth flow is redirecting to `/en?code=xxx` instead of `/auth/callback`, causing the authentication to fail because:
1. The OAuth code is not being properly exchanged for a session
2. Supabase's default behavior is appending the code to the site URL instead of using the callback route
3. The middleware was adding locale prefixes to auth routes

## Applied Code Fixes

### 1. Middleware Update
Updated `src/middleware.ts` to skip auth routes, preventing locale prefix addition:
```typescript
const shouldSkip = [
  '/api',
  '/auth',  // Skip auth routes to prevent locale prefix
  // ... other paths
].some(path => pathname.includes(path))
```

### 2. Auth Callback Route Enhancement
Enhanced `/auth/callback/route.ts` with better error handling and logging:
- Added detailed logging for debugging
- Improved error handling with specific error messages
- Fixed redirect URL construction

## Required Supabase Dashboard Configuration

### 1. Update Redirect URLs in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following settings:

   **Site URL:**
   ```
   http://localhost:3001
   ```

   **Redirect URLs (add all of these):**
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/auth/callback?next=/en
   http://localhost:3001/auth/callback?next=/zh
   ```

   For production, add:
   ```
   https://your-domain.com/auth/callback
   https://your-domain.com/auth/callback?next=/en
   https://your-domain.com/auth/callback?next=/zh
   ```

### 2. Update Google OAuth Provider Settings

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Google**
2. Ensure the **Callback URL (for Google)** shown there is copied
3. Go to [Google Cloud Console](https://console.cloud.google.com/)
4. Select your project
5. Navigate to **APIs & Services** → **Credentials**
6. Click on your OAuth 2.0 Client ID
7. Add the Supabase callback URL to **Authorized redirect URIs**:
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```

### 3. Environment Variables Check

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## How the Fixed Flow Works

1. User clicks "Sign in with Google"
2. `authService.signInWithGoogle()` redirects to Google with `redirectTo: ${siteUrl}/auth/callback?next=/${locale}`
3. Google authenticates and redirects to Supabase
4. Supabase redirects to `/auth/callback?code=xxx&next=/en`
5. The `/auth/callback` route:
   - Exchanges the code for a session server-side
   - Sets session cookies via `createServerClient`
   - Redirects to the `next` parameter (e.g., `/en`)
6. The middleware updates the session on subsequent requests
7. The AuthContext detects the session change and updates the UI

## Testing the Fix

1. Clear all cookies and local storage
2. Navigate to http://localhost:3001
3. Click "Sign in with Google"
4. After Google authentication, you should be redirected to `/en` with a valid session
5. Check the browser console - there should be no "session from storage null" errors

## Troubleshooting

If OAuth still redirects to `/en?code=xxx`:
1. Double-check the Redirect URLs in Supabase Dashboard
2. Ensure the Site URL is exactly `http://localhost:3001` (no trailing slash)
3. Clear browser cache and cookies completely
4. Check browser network tab to see the exact redirect chain

If the session is not persisting:
1. Check that cookies are being set (look for `sb-` prefixed cookies)
2. Verify the middleware is running (add console.logs)
3. Ensure the Supabase URL and anon key are correct