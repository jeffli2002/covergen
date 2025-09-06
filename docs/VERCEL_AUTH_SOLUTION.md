# Ultimate OAuth Solution for Vercel

## The Problem
1. Supabase JavaScript client hangs on Vercel preview deployments when checking auth state
2. Different parts of the app use different authentication methods, causing inconsistency
3. Complex session recovery mechanisms that don't work reliably

## The Solution: Server-First Auth

The key insight is that while the Supabase JS client hangs on Vercel, server-side API calls work perfectly. So we use a **server-first approach**:

1. **All auth checks go through `/api/auth/verify`** - This uses Supabase server client which works reliably
2. **Client-side is only used for OAuth initiation** - Starting the OAuth flow with Google
3. **Unified auth state management** - Single source of truth that all components use

## Implementation

### 1. Core Auth Module (`/src/lib/auth/vercel-auth.ts`)
- Singleton class that manages auth state
- Polls `/api/auth/verify` endpoint every 5 seconds
- Notifies all subscribers when auth state changes
- Provides methods for sign in and sign out

### 2. React Hook (`/src/hooks/useVercelAuth.ts`)
- Simple hook that subscribes to VercelAuth instance
- Returns current user, loading state, and auth methods
- Automatically updates when auth state changes

### 3. Unified Auth Button (`/src/components/auth/UnifiedAuthButton.tsx`)
- Single button component that works everywhere
- Shows user email when signed in
- Handles sign in/out with proper error handling

### 4. API Endpoints
- `/api/auth/verify` - Returns current auth status (already exists)
- `/api/auth/signout` - Server-side sign out with cookie cleanup

## Migration Guide

### Step 1: Replace AuthContext usage
```tsx
// Old
import { useAuth } from '@/contexts/AuthContext'

// New
import { useVercelAuth } from '@/hooks/useVercelAuth'
```

### Step 2: Update component code
```tsx
// Old
const { user, signOut, signInWithGoogle } = useAuth()

// New
const { user, signOut, signInWithGoogle } = useVercelAuth()
```

### Step 3: Replace auth buttons
```tsx
// Old
<WorkingAuthButton />

// New
<UnifiedAuthButton />
```

## Why This Works

1. **No Client-Side Hanging**: We never use Supabase client for auth checks on Vercel
2. **Single Source of Truth**: All components get auth state from the same place
3. **Real-time Updates**: Polling ensures auth state is always current
4. **Simple Implementation**: Much simpler than complex session recovery mechanisms

## Testing

1. Deploy to Vercel preview
2. Visit `/en/test-auth` 
3. Click "Sign In with Google" on the Unified Auth button
4. After OAuth completes, all components should show authenticated state
5. Sign out should work instantly

## Next Steps

1. Replace all auth usage with `useVercelAuth` hook
2. Remove old auth implementations (AuthContext, WorkingAuthButton, etc.)
3. Update header to use UnifiedAuthButton
4. Remove debug components once verified working