# OAuth Setup for Vercel Preview Deployments

## Problem
OAuth sessions are not persisting on Vercel preview deployments because:
1. Preview deployments have dynamic URLs
2. Cookies are domain-specific
3. Supabase needs to whitelist callback URLs

## Solution

### 1. Update Supabase Dashboard

Add these callback URLs to your Supabase Auth settings (Authentication > URL Configuration > Redirect URLs):

```
# Production
https://covergen.pro/auth/callback-universal
https://www.covergen.pro/auth/callback-universal

# Vercel Preview Deployments (add all of these)
https://*.vercel.app/auth/callback-universal
https://covergen-*.vercel.app/auth/callback-universal
https://covergen-git-*.vercel.app/auth/callback-universal

# Local Development
http://localhost:3000/auth/callback-universal
http://localhost:3001/auth/callback-universal
```

### 2. Google OAuth Console

In Google Cloud Console, add these authorized redirect URIs:

```
# Production
https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/callback

# For Vercel previews, Google doesn't support wildcards, so you need to add specific URLs:
# Add each preview deployment URL as needed
```

### 3. Environment Variables

Ensure these are set in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Testing

1. Deploy to Vercel preview
2. Visit `/auth-session-debug` to check session state
3. Try signing in with Google
4. Check if session persists after redirect

### 5. Cookie Configuration

The updated callback routes now:
- Don't set explicit domain (works better with dynamic URLs)
- Use `sameSite: 'lax'` for OAuth compatibility
- Set proper `maxAge` for session persistence
- Use `httpOnly` for security

### 6. Debugging Tips

If sessions still don't persist:

1. Check browser DevTools > Application > Cookies
2. Look for cookies starting with `sb-exungkcoaihcemcmhqdr-auth-token`
3. Verify cookie domain matches current domain
4. Check Set-Cookie headers in network response
5. Use `/auth-session-debug` page to inspect session state

### 7. Alternative Solution for Preview Deployments

If wildcard URLs don't work in Supabase, you can:

1. Use a stable preview URL by setting up a custom domain for previews
2. Or update the Supabase redirect URLs for each preview deployment
3. Or use environment-specific Supabase projects (not recommended)