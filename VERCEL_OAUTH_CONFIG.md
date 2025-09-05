# Vercel OAuth Configuration for Test Branch

## Required Supabase Dashboard Configuration

For the OAuth flow to work on the Vercel deployment, you need to add the following URLs to your Supabase Dashboard:

### 1. In Supabase Dashboard > Authentication > URL Configuration

Add these to the **Redirect URLs** list:
```
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/en
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/zh
https://covergen-git-test-payment-webhooks-jeff-lees-projects-92a56a05.vercel.app/
```

### 2. OAuth Flow Explanation

The test branch now uses the same implicit flow as production:
1. User clicks "Sign in with Google"
2. Redirected to Google for authentication
3. Google redirects back to Supabase
4. Supabase redirects to the current page URL with tokens in the hash fragment
5. OAuthHashHandler component detects and processes the tokens
6. Session is established and user is authenticated

### 3. Important Notes

- The OAuth flow uses implicit grant (tokens in URL hash) instead of authorization code flow
- No `/auth/callback` route is used - it redirects directly to the current page
- Tokens are handled client-side by the OAuthHashHandler component
- Session syncing is handled by useServerSession hook

### 4. Troubleshooting

If OAuth still doesn't work:
1. Clear all cookies and localStorage
2. Check browser console for error messages
3. Verify the redirect URLs are exactly as shown above (no trailing slashes)
4. Ensure cookies are enabled in the browser
5. Check that the Vercel deployment URL hasn't changed