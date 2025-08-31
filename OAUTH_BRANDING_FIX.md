# Fix Google OAuth Branding to Show covergen.pro

## Current Issue
When users sign in with Google, they see "Choose an account to continue to exungkcoaihcemcmhqdr.supabase.co" instead of "Choose an account to continue to covergen.pro". This creates a poor user experience and looks unprofessional.

## Root Cause
The Google OAuth consent screen displays the redirect URI domain, which is currently the Supabase project URL. This happens because:
1. Supabase handles the OAuth flow through their authentication endpoint
2. The redirect URI must point to `https://[project-id].supabase.co/auth/v1/callback`
3. Google shows this domain in the consent screen

## Solutions

### Solution 1: Configure Google OAuth Consent Screen (Recommended)
This is the quickest fix that improves the UX significantly:

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Navigate to **APIs & Services** > **OAuth consent screen**

2. **Update OAuth Consent Screen Configuration**
   - Click "Edit App"
   - Update the following fields:
     - **App name**: CoverGen Pro (or your preferred name)
     - **User support email**: support@covergen.pro
     - **App logo**: Upload your CoverGen logo
     - **Application home page**: https://covergen.pro
     - **Application privacy policy link**: https://covergen.pro/privacy
     - **Application terms of service link**: https://covergen.pro/terms
     - **Authorized domains**: Add `covergen.pro`
   - Save all changes

3. **Important**: While the redirect URI will still show the Supabase domain in small text, the main branding (app name, logo) will show your brand, making it much more professional.

### Solution 2: Use Supabase Custom Domain (Pro/Enterprise Plans)
If you have a Supabase Pro or Enterprise plan:

1. **Configure Custom Domain in Supabase**
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Navigate to **Project Settings** > **API**
   - Look for "Custom Domains" section
   - Add `auth.covergen.pro` as your custom domain
   - Follow the DNS configuration instructions

2. **Update Google OAuth Redirect URI**
   - In Google Cloud Console, update the redirect URI to:
     ```
     https://auth.covergen.pro/auth/v1/callback
     ```

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://auth.covergen.pro
   ```

### Solution 3: Alternative OAuth Flow (Advanced)
Implement a custom OAuth flow that doesn't expose the Supabase URL:

1. **Create Custom OAuth Handler**
   - Set up an API endpoint at `https://covergen.pro/api/auth/google`
   - Handle the OAuth flow server-side
   - Exchange tokens with Supabase in the backend

2. **Update Google OAuth Configuration**
   - Set redirect URI to `https://covergen.pro/api/auth/google/callback`

This approach is more complex but provides complete control over the branding.

## Immediate Actions Required

### 1. Update Supabase Dashboard Settings
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication** > **URL Configuration**
3. Update the following:
   - **Site URL**: `https://covergen.pro`
   - **Redirect URLs**: Add `https://covergen.pro/*`

### 2. Update Environment Variables
Create or update `.env.production`:
```env
NEXT_PUBLIC_SITE_URL=https://covergen.pro
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Update Authentication Service
The authentication service is already correctly configured to use the site URL for redirects. No code changes needed.

## Verification Steps

1. **Test OAuth Flow**
   - Clear browser cookies
   - Go to https://covergen.pro
   - Click "Sign in with Google"
   - Verify the consent screen shows improved branding

2. **Check Redirect Behavior**
   - After Google authentication, ensure users are redirected to covergen.pro
   - Verify the user session is properly established

## Timeline

1. **Immediate (Today)**: 
   - Update Google OAuth consent screen configuration
   - Update Supabase URL configuration

2. **Short-term (This Week)**:
   - Monitor user feedback
   - Consider upgrading to Supabase Pro for custom domain support

3. **Long-term (Next Month)**:
   - Evaluate if custom OAuth flow is needed
   - Implement analytics to track auth conversion rates

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify all redirect URLs match exactly (no trailing slashes)
3. Ensure DNS propagation is complete (for custom domains)

For additional help, contact Supabase support with your project ID: `exungkcoaihcemcmhqdr`