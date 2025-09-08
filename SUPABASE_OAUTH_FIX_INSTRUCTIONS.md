# OAuth Fix Instructions for Vercel Deployment

## The Problem
OAuth is redirecting to `/en` but the code is not being processed. This happens because:
1. Supabase ignores the `redirectTo` parameter in OAuth flows
2. It uses the Site URL configured in the Supabase dashboard instead
3. The OAuthCodeHandler might not be detecting the code properly

## Immediate Fix Steps

### 1. Verify Supabase Site URL Configuration

Go to your Supabase Dashboard:
1. Navigate to Authentication > URL Configuration
2. Set the **Site URL** to exactly:
   ```
   https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app
   ```
   - NO trailing slash
   - NO path like /en
   - Must match your Vercel deployment URL exactly

### 2. Check Google OAuth Configuration

In Supabase Dashboard:
1. Go to Authentication > Providers > Google
2. Ensure it's enabled
3. Check that Client ID and Secret are set

In Google Cloud Console:
1. Ensure these redirect URIs are authorized:
   ```
   https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback
   ```

### 3. Test OAuth Flow

1. Visit: `/en/test-oauth-simple`
2. Click "Sign in with Google"
3. After authentication, you should see:
   - URL changes to include `?code=...`
   - Purple debug box showing "OAuth Handler Debug"
   - Code being processed

### 4. Debug Steps

If OAuth still fails:

1. **Check Console Logs**:
   - Look for `[OAuthCodeHandler]` logs
   - Look for `[TestOAuth]` logs
   - Any error messages

2. **Visit Debug Page**: `/en/debug-oauth-state`
   - Shows current URL and parameters
   - Shows if code is detected
   - Shows current session state

3. **Check for Multiple Instances**:
   - Look for "Multiple GoTrueClient instances" error
   - This means there's a conflict in Supabase client creation

## Code Components

1. **OAuthCodeHandler** (`/src/components/auth/OAuthCodeHandler.tsx`):
   - Added to layout to run on every page
   - Detects OAuth codes in URL
   - Exchanges them for sessions
   - Shows purple debug box when code is present

2. **Debug Pages**:
   - `/en/debug-oauth-state` - Shows current auth state
   - `/en/test-oauth-simple` - Simple OAuth test

## Why This Should Work

1. OAuthCodeHandler is in the layout, so it runs on every page
2. It uses the singleton Supabase client from `/lib/supabase-simple`
3. It exchanges codes immediately when detected
4. Debug info is visible to confirm it's running

## If Still Not Working

The issue is likely:
1. Site URL mismatch in Supabase dashboard
2. OAuthCodeHandler not mounting properly
3. Race condition in code detection

Check the purple debug box and console logs to see which step is failing.