# Step-by-Step Guide: Fix Google OAuth Branding for CoverGen Pro

## Quick Fix Instructions

### Step 1: Update Google OAuth Consent Screen (5 minutes)

1. **Open Google Cloud Console**
   - Go to: https://console.cloud.google.com/
   - Select your project from the dropdown

2. **Navigate to OAuth Consent Screen**
   - In the left sidebar, click **APIs & Services**
   - Click **OAuth consent screen**

3. **Edit Your OAuth Consent Screen**
   - Click the **EDIT APP** button
   - Update these fields:
     - **App name**: `CoverGen Pro` (instead of your project name)
     - **User support email**: `support@covergen.pro`
     - **App logo**: Upload your CoverGen logo (must be 120x120px to 256x256px)
   
4. **Add App Information**
   - **Application home page**: `https://covergen.pro`
   - **Application privacy policy link**: `https://covergen.pro/privacy`
   - **Application terms of service link**: `https://covergen.pro/terms`

5. **Add Authorized Domain**
   - Under **Authorized domains**, click **ADD DOMAIN**
   - Enter: `covergen.pro`
   - Click **ADD**

6. **Save Changes**
   - Click **SAVE AND CONTINUE** through each section
   - On the summary page, click **BACK TO DASHBOARD**

### Step 2: Update Supabase Settings (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Select your project: `exungkcoaihcemcmhqdr`

2. **Update Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration** tab
   - Update these fields:
     - **Site URL**: `https://covergen.pro`
     - **Redirect URLs**: Add these URLs (one per line):
       ```
       https://covergen.pro/*
       https://covergen.pro
       http://localhost:3001/*
       http://localhost:3001
       ```
   - Click **Save**

3. **Verify Google Provider Settings**
   - Click **Providers** tab
   - Make sure **Google** is enabled
   - Verify your Client ID and Client Secret are set

### Step 3: Verify Google Console Redirect URIs (2 minutes)

1. **Check OAuth 2.0 Client Settings**
   - In Google Cloud Console, go to **APIs & Services** > **Credentials**
   - Click on your OAuth 2.0 Client ID

2. **Verify Authorized Redirect URIs**
   - Make sure this URI is present:
     ```
     https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback
     ```
   - Also add (for local development):
     ```
     http://localhost:3001/auth/callback
     ```

3. **Save if you made changes**

## What This Fixes

After completing these steps:

✅ **Before**: "Choose an account to continue to exungkcoaihcemcmhqdr.supabase.co"

✅ **After**: Users will see:
- Your app name: "CoverGen Pro"
- Your logo
- Professional branding
- (The Supabase URL will still appear in small text as the redirect domain)

## Testing the Changes

1. **Clear Browser Data**
   - Clear cookies for google.com and your app
   - Or use an incognito/private window

2. **Test the Flow**
   - Go to https://covergen.pro
   - Click "Sign in with Google"
   - You should see the improved branding

## Important Notes

- Changes may take 5-10 minutes to propagate
- The Supabase domain will still show in the redirect URI text, but your branding will be prominent
- For complete custom domain (no Supabase URL visible), you need Supabase Pro plan

## Troubleshooting

If the branding doesn't update:
1. Make sure you saved all changes in Google Console
2. Try a different browser or incognito mode
3. Wait 10-15 minutes for propagation
4. Double-check your logo meets Google's requirements (120x120 to 256x256 pixels)

## Next Steps

For a fully branded experience without any Supabase URLs:
1. Consider upgrading to Supabase Pro ($25/month)
2. Set up a custom domain like `auth.covergen.pro`
3. Update all redirect URIs to use your custom domain

## Need Help?

- Supabase Dashboard: https://app.supabase.com/project/exungkcoaihcemcmhqdr
- Google Console: https://console.cloud.google.com/
- Your Supabase project ID: `exungkcoaihcemcmhqdr`