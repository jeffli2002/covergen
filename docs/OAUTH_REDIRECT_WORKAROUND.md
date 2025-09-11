# OAuth Popup Redirect Workaround

## The Problem

When using Supabase OAuth with Google:
1. Your app requests redirect to `http://localhost:3001/auth/callback-popup`
2. Supabase forwards to Google with its own redirect URI
3. Google redirects back to Supabase
4. Supabase redirects to your site's base URL (`/en?code=xxx`) instead of `/auth/callback-popup`

This happens because Supabase's OAuth flow doesn't preserve custom callback paths in development environments when the Site URL is set to production.

## The Solution

We implemented a workaround that:
1. Sets a `sessionStorage` flag when opening the OAuth popup
2. Detects when OAuth code arrives at the wrong URL (e.g., `/en?code=xxx`)
3. Redirects to the correct callback URL (`/auth/callback-popup?code=xxx`)
4. Processes the OAuth code in the popup context
5. Closes the popup and returns the session to the parent window

## How It Works

### 1. OAuth Popup Handler (`/src/lib/oauth-popup.ts`)
- Sets `sessionStorage.setItem('oauth_popup_active', 'true')` when opening popup
- Cleans up the flag when popup closes

### 2. OAuth Popup Handler Component (`/src/components/OAuthPopupHandler.tsx`)
- Checks for OAuth code in URL
- Detects popup context using multiple methods:
  - Window name (`oauth-popup`)
  - Session storage flag
  - Window size (≤ 600x800)
- If OAuth code arrives at wrong URL in popup context, redirects to `/auth/callback-popup`

### 3. Callback Popup Route (`/src/app/auth/callback-popup/route.ts`)
- Receives the OAuth code
- Returns HTML that posts message to parent window
- Parent window exchanges code for session

## Testing

1. Clear cookies/session storage
2. Click "Sign in with Google" (popup)
3. Complete Google OAuth
4. Popup should:
   - Redirect from `/en?code=xxx` to `/auth/callback-popup?code=xxx`
   - Display success message
   - Close automatically
   - Parent window receives session

## Future Improvements

The ideal solution would be:
1. Use separate Supabase projects for dev/prod
2. Or configure Supabase to preserve custom callback paths
3. Or use a different OAuth flow that doesn't rely on Supabase's redirect handling