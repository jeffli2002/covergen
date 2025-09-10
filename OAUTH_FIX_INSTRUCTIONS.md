# OAuth Fix Instructions

## Current Issue
The "Multiple GoTrueClient instances" warning is caused by having multiple OAuth handling components that may be creating conflicts.

## Solution Overview
Based on the my-saas project and the learnings in CLAUDE.md, we need to:

1. **Use PKCE flow exclusively** - Remove any implicit flow handlers
2. **Single OAuth handler** - Have only one component handling OAuth callbacks
3. **Server-side code exchange** - Handle OAuth code exchange in the callback route
4. **Simple client architecture** - Use the singleton supabase-simple client everywhere

## Components to Remove

1. **Remove OAuthCallbackDetector** - This handles implicit flow (tokens in hash) which we don't use
2. **Consolidate OAuth handlers** - Keep only SessionRecovery for client-side recovery
3. **Remove duplicate SessionRecovery** - It's loaded in both layout and page-client

## Implementation Steps

### Step 1: Remove OAuthCallbackDetector from page-client.tsx

```typescript
// Remove these imports:
// import { OAuthCallbackDetector } from '@/components/auth/OAuthCallbackDetector'

// Remove this component:
// <OAuthCallbackDetector />
```

### Step 2: Remove duplicate SessionRecovery

Keep SessionRecovery only in the layout.tsx, remove from page-client.tsx

### Step 3: Ensure OAuth callback route uses PKCE

The `/auth/callback/route.ts` should handle the OAuth code exchange server-side.

### Step 4: Update authService to not create new clients

The authService should always use the singleton supabase client from supabase-simple.ts

## Testing

After making these changes:

1. Clear all cookies and localStorage
2. Sign out completely
3. Try signing in with Google OAuth
4. Check console for any "Multiple GoTrueClient instances" warnings

## Expected Result

- No multiple client warnings
- Clean OAuth flow with server-side code exchange
- Sessions persist correctly across page refreshes