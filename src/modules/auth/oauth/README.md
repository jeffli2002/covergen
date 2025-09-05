# OAuth Module

A modular, isolated OAuth authentication system that can be easily integrated without affecting other features.

## Features

- **Isolated State Management**: Uses React Context to maintain OAuth state separately
- **Event-Driven Architecture**: Emits events for auth changes without tight coupling
- **Type-Safe**: Full TypeScript support with comprehensive types
- **Provider Agnostic**: Supports multiple OAuth providers (Google, GitHub, Facebook)
- **Auto-Refresh**: Automatically refreshes tokens before expiry
- **Error Boundaries**: Graceful error handling without crashing the app

## Usage

### 1. Wrap your app with OAuthProvider

```tsx
// app/layout.tsx
import { OAuthProvider } from '@/modules/auth/oauth'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OAuthProvider config={{
          providers: ['google', 'github'],
          onSuccess: (user) => console.log('User signed in:', user),
          onError: (error) => console.error('OAuth error:', error)
        }}>
          {children}
        </OAuthProvider>
      </body>
    </html>
  )
}
```

### 2. Use OAuth components

```tsx
import { OAuthButton, OAuthStatus, useOAuth } from '@/modules/auth/oauth'

export function MyComponent() {
  const { user, isAuthenticated } = useOAuth()
  
  return (
    <div>
      {!isAuthenticated ? (
        <OAuthButton provider="google" />
      ) : (
        <OAuthStatus showDetails />
      )}
    </div>
  )
}
```

### 3. Listen to auth events

```tsx
import { useOAuth } from '@/modules/auth/oauth'

function AuthListener() {
  const { onAuthChange } = useOAuth()
  
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        console.log('User signed in:', user)
        // Update your app state
      } else {
        console.log('User signed out')
        // Clear your app state
      }
    })
    
    return unsubscribe
  }, [onAuthChange])
}
```

## API Reference

### OAuthProvider

```tsx
interface OAuthConfig {
  providers: OAuthProvider[]      // ['google', 'github', 'facebook']
  redirectUrl?: string           // Custom redirect URL
  onSuccess?: (user) => void     // Success callback
  onError?: (error) => void      // Error callback
  autoRefresh?: boolean          // Auto-refresh tokens (default: true)
  persistSession?: boolean       // Persist session (default: true)
}
```

### useOAuth Hook

```tsx
const {
  // State
  user,           // Current user object
  session,        // Full session with tokens
  loading,        // Loading state
  error,          // Error state
  isAuthenticated, // Auth status
  
  // Actions
  signIn,         // Sign in function
  signOut,        // Sign out function
  refreshSession, // Manual refresh
  
  // Events
  onAuthChange    // Subscribe to auth changes
} = useOAuth()
```

### OAuthButton

```tsx
<OAuthButton
  provider="google"              // OAuth provider
  variant="default"              // Button style
  onSuccess={() => {}}          // Success callback
  onError={(error) => {}}       // Error callback
  disabled={false}              // Disable button
>
  Custom Button Text
</OAuthButton>
```

## Architecture

The module is completely isolated and communicates through:

1. **Props**: Configuration passed through OAuthProvider
2. **Context**: State management isolated within the module
3. **Events**: Emits events that other parts can subscribe to
4. **Callbacks**: Optional callbacks for success/error handling

This ensures the OAuth module remains independent and won't be affected by changes in other features.