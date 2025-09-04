# OAuth 500 Error Fix

## Problem
Google OAuth callback to Supabase fails with 500 "unexpected_failure" error.

## Root Cause
The error occurs at Supabase's OAuth endpoint before redirecting to your app, indicating:
1. Google OAuth client configuration mismatch
2. Missing/incorrect redirect URLs in Google Cloud Console
3. Supabase OAuth provider misconfiguration

## Fix Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. In **Authorized redirect URIs**, add:
   ```
   https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback
   ```
6. Save changes

### 2. Supabase Dashboard Configuration
1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Verify these settings:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
   - **Redirect URL**: Should be `https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback`

3. Go to **Authentication** → **URL Configuration**
4. Set:
   - **Site URL**: `https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app`
   - **Redirect URLs**: Add all of these:
     ```
     https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback
     https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback?next=/en
     ```

### 3. Verify Environment Variables
Ensure your production environment has:
```
NEXT_PUBLIC_SITE_URL=https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

### 4. Test the Flow
1. Clear cookies and try OAuth again
2. Check browser network tab for the exact redirect chain
3. Verify the flow goes: App → Google → Supabase → App callback

## Common Issues
- **Missing redirect URI**: The exact Supabase callback URL must be in Google Console
- **Domain mismatch**: Site URL in Supabase must match your deployment URL
- **Case sensitivity**: URLs must match exactly including protocol (https://)