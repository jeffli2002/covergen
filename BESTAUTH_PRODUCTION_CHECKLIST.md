# BestAuth Production Deployment Checklist

## Cookie Configuration for Production

### Current Fix
The session cookie now uses:
- **Production/Vercel**: `secure: true, sameSite: 'none'` - Required for cross-site OAuth
- **Local Development**: `secure: false, sameSite: 'lax'` - Works on HTTP

### Why This Works
1. **OAuth Flow**: Google redirects from `accounts.google.com` to your domain
2. **Cross-Site Cookies**: `sameSite: 'none'` allows cookies to be set during cross-site redirects
3. **Security**: `secure: true` is required when using `sameSite: 'none'`

## Production Requirements

### 1. Google Cloud Console
Ensure these redirect URLs are configured:
```
https://covergen.pro/api/auth/callback/google
https://www.covergen.pro/api/auth/callback/google  # if using www
```

### 2. Environment Variables
Required in production:
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
BESTAUTH_JWT_SECRET=your-secure-random-secret
NODE_ENV=production
```

### 3. Domain Configuration
- Ensure HTTPS is enabled (required for secure cookies)
- Consider setting up both `covergen.pro` and `www.covergen.pro`

## Testing in Production

1. Clear all cookies
2. Try OAuth sign-in
3. Check `/debug-bestauth` to verify:
   - Session cookie is set
   - Cookie has correct attributes
   - Session endpoint returns authenticated

## Troubleshooting

If cookies still don't persist:

1. **Check Browser Console**
   - Look for cookie warnings
   - Verify no CORS issues

2. **Check Vercel Logs**
   - OAuth callback logs will show if token is received
   - Cookie setting logs will show exact headers

3. **Common Issues**
   - Mixed content (HTTP resources on HTTPS page)
   - Browser blocking third-party cookies
   - Incorrect redirect URLs in Google Console

## Security Best Practices

1. Always use HTTPS in production
2. Keep `httpOnly: true` to prevent XSS attacks
3. Use strong JWT secret (32+ characters)
4. Rotate secrets periodically
5. Monitor failed authentication attempts

## Future Improvements

1. Add CSRF protection for additional security
2. Implement refresh tokens for better UX
3. Add rate limiting to prevent brute force
4. Set up monitoring for authentication failures