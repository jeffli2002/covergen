# Quick OAuth Fix for Vercel Preview Deployments

## Current Status ✅
- Supabase client: Working
- Environment variables: Configured correctly
- PKCE flow: Enabled

## Action Required 🔧

Add this URL to your Supabase Dashboard:
```
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/auth/callback
```

### Steps:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/exungkcoaihcemcmhqdr/auth/url-configuration)
2. Find "Redirect URLs" section
3. Click "Add URL"
4. Paste the URL above
5. Click "Save"

### For Future Vercel Deployments:
Each Vercel preview gets a unique URL. To avoid this issue:

#### Option 1: Use wildcards (if Supabase supports)
```
https://*.vercel.app/auth/callback
```

#### Option 2: Use production domain
Set up a custom domain in Vercel and use:
```
https://covergen.pro/auth/callback
```

#### Option 3: Use Vercel environment variables
In Vercel dashboard, set:
```
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```

This will make all preview deployments use the production URL for OAuth callbacks.