# OAuth Production Issues - Diagnosis and Solutions

## Common OAuth Production Failures

### 1. **Environment Variable Issues**
**Problem**: OAuth works in development but fails in production due to missing or incorrect environment variables.

**Solution**:
```bash
# Production .env must include:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```

### 2. **Cookie/Session Issues**
**Problem**: Production uses HTTPS and requires secure cookies, different domain settings.

**Key Differences**:
- Development: HTTP, localhost, no secure flag
- Production: HTTPS, actual domain, secure cookies required

**Solution**: Use the enhanced OAuth configuration in `supabase-oauth-config.ts` that handles:
- Secure cookie flags in production
- Proper domain settings
- SameSite attributes

### 3. **Redirect URL Mismatch**
**Problem**: The redirect URL sent by the app doesn't match what's configured in Supabase.

**Common Scenarios**:
- App sends: `https://covergen.pro/auth/callback`
- Supabase expects: `https://www.covergen.pro/auth/callback` (with www)

**Solution**: 
1. Check Supabase Dashboard → Authentication → URL Configuration
2. Add all variations:
   - `https://covergen.pro/auth/callback`
   - `https://www.covergen.pro/auth/callback`
   - `https://covergen.pro/auth/callback?next=**`
   - `https://www.covergen.pro/auth/callback?next=**`

### 4. **CORS/Origin Issues**
**Problem**: Supabase might block requests from production domain.

**Solution**: In Supabase Dashboard:
1. Go to Settings → API
2. Add your production domains to allowed origins

### 5. **Session Detection Issues**
**Problem**: The app fails to detect the session after OAuth callback.

**Common Causes**:
- Cookie not being set properly
- Session storage conflict
- Timing issues with redirect

**Solution**: Use the V2 auth service that:
- Properly handles PKCE flow
- Clears stale sessions
- Validates environment before attempting OAuth

## Production Debugging Steps

### Step 1: Test Environment
Visit `/en/oauth-production-debug` to check:
- Environment variables are set
- Cookies can be read/written
- Redirect URLs are correct
- Supabase client is initialized

### Step 2: Test OAuth Flow
Use the OAuth Production Test component:
```tsx
import { OAuthProductionTest } from '@/components/OAuthProductionTest'

// Add to any page
<OAuthProductionTest />
```

### Step 3: Check Browser Console
Look for:
- CORS errors
- Cookie warnings
- Security policy violations
- Network request failures

### Step 4: Verify Supabase Configuration
1. Site URL: Must match your production domain (no trailing slash)
2. Redirect URLs: Must include all callback URLs
3. OAuth Providers: Google OAuth must be enabled with correct credentials

## Quick Production Checklist

- [ ] Environment variables set in production
- [ ] Using HTTPS (required for secure cookies)
- [ ] Redirect URLs match in Supabase dashboard
- [ ] No trailing slashes in Site URL
- [ ] Cookies enabled in user's browser
- [ ] Using V2 auth service with proper production config
- [ ] Clear browser cache/cookies if testing multiple times

## Emergency Fixes

### If OAuth is completely broken in production:

1. **Clear all auth state**:
```javascript
// Run in browser console
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

2. **Verify redirect URL**:
```javascript
// Check what URL the app is using
console.log(window.location.origin + '/auth/callback')
```

3. **Use simplified OAuth flow**:
Create a minimal test at `/test-oauth` that only does OAuth without any other complexity.

## Implementation Priority

1. First, use the debugging page to identify the exact issue
2. Update environment variables if needed
3. Switch to V2 auth service for better production handling
4. Test with the OAuthProductionTest component
5. Monitor logs for any remaining issues