# OAuth Setup Guide for CoverGen Pro

## The OAuth Redirect Issue

When developing locally, OAuth might redirect to production URL instead of localhost. Here's how to fix it:

## Solution 1: Environment Variable (Recommended)

### 1. Update your `.env.local` file:
```env
# For local development
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. For production `.env.production`:
```env
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```

## Solution 2: Supabase Configuration

### In Supabase Dashboard:

1. Go to **Authentication > URL Configuration**
2. **Site URL**: Leave this as your production URL (`https://covergen.pro`)
3. **Redirect URLs**: Add ALL of these (one per line):
```
http://localhost:3001/auth/callback
http://localhost:3000/auth/callback
https://covergen.pro/auth/callback
https://www.covergen.pro/auth/callback
https://covergen.vercel.app/auth/callback
https://*.vercel.app/auth/callback
```

## Solution 3: Google OAuth Console

### In Google Cloud Console:

1. Go to **APIs & Services > Credentials**
2. Click on your OAuth 2.0 Client ID
3. Add these to **Authorized redirect URIs**:
```
http://localhost:3001/auth/callback
http://localhost:3000/auth/callback
https://covergen.pro/auth/callback
https://www.covergen.pro/auth/callback
```

## Testing OAuth Flow

1. Clear browser cookies for localhost and covergen.pro
2. Start dev server: `npm run dev`
3. Navigate to `http://localhost:3001`
4. Click Google sign-in
5. You should be redirected back to `http://localhost:3001/auth/callback`

## Troubleshooting

### If still redirecting to production:

1. Check browser network tab for the OAuth request
2. Look for the `redirect_uri` parameter
3. It should show `http://localhost:3001/auth/callback`

### Session timeout errors:

The timeout has been increased to 10 seconds. If still timing out:
- Check browser console for CORS errors
- Verify Supabase URL and anon key are correct
- Check if cookies are being set properly

### Cookie issues:

For local development, cookies need `sameSite: 'lax'` instead of `'none'`.
The middleware has been updated to handle this automatically.