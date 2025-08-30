# Fix Google OAuth redirect_uri_mismatch Error

## Problem
You're getting a "redirect_uri_mismatch" error when trying to sign in with Google. This means the redirect URI configured in Google Console doesn't match what your application is using.

## Quick Diagnosis
When you see the error on Google's OAuth page, expand the error details. It will show you:
- **Redirect URI sent by app**: The URI your app is trying to use
- **Authorized redirect URIs**: The URIs configured in Google Console

Copy the exact redirect URI from the error message and add it to Google Console.

## Solution

### 1. Find Your Supabase Redirect URI
Your Supabase project URL is: `https://exungkcoaihcemcmhqdr.supabase.co`

The redirect URI that Supabase uses for Google OAuth is:
```
https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback
```

### 2. Update Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. In the **Authorized redirect URIs** section, add:
   ```
   https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback
   ```
6. Save the changes

### 3. Configure Supabase (if not already done)

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Enable Google provider
5. Add your Google OAuth credentials:
   - Client ID (from Google Console)
   - Client Secret (from Google Console)

### 4. For Local Development

If you also want Google OAuth to work locally, add this redirect URI to Google Console:
```
http://localhost:3001/auth/callback
```

However, Google OAuth typically doesn't work with localhost URLs. You might need to:
- Use a service like ngrok to create a public URL for your local development
- Or test Google OAuth only in production/staging environments

## Important Notes

1. Changes in Google Console can take a few minutes to propagate
2. Make sure there are no trailing slashes or extra spaces in the redirect URIs
3. The redirect URI must match EXACTLY (including http/https and port)
4. For production, update `NEXT_PUBLIC_SITE_URL` in your environment variables to your production URL

## Current Configuration in Code

Looking at your code (`src/services/authService.ts` line 234), the redirect URL is set to:
```javascript
const redirectUrl = `${window.location.origin}/`
```

This evaluates to `http://localhost:3001/` in development.

However, when using Supabase OAuth, the actual callback happens to Supabase first, then Supabase redirects to your app. So you need to add the Supabase callback URL to Google Console, not your app URL.