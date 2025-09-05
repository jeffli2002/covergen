# Google OAuth Implementation Guide with Supabase and Next.js

## Overview

This guide documents a working Google OAuth implementation using Supabase Auth with Next.js App Router. It resolves common issues like "Multiple GoTrueClient instances detected" and authentication state not persisting after OAuth redirect.

## Key Principles

1. **Use ONE Supabase client instance** - Avoid creating multiple clients
2. **Choose ONE OAuth flow** - Either implicit or PKCE, not both
3. **Ensure proper redirect URL configuration** - Must match exactly in Supabase dashboard
4. **Handle authentication consistently** - Use a centralized auth service

## Implementation Steps

### 1. Create a Simple Supabase Client

Create a single Supabase client that will be used throughout your application:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Authentication features will be disabled.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE for better security
  }
})
```

### 2. Create an Authentication Service

Centralize all authentication logic in a service:

```typescript
// src/services/authService.ts
import { supabase } from '@/lib/supabase'

class AuthService {
  private user: any = null
  private session: any = null
  private initialized = false
  private authSubscription: any = null
  private onAuthChange: ((user: any) => void) | null = null

  async initialize() {
    if (this.initialized) return true

    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session) {
        this.session = session
        this.user = session.user
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          this.session = session
          this.user = session?.user || null
          
          if (this.onAuthChange) {
            this.onAuthChange(this.user)
          }
        }
      )
      this.authSubscription = subscription
      this.initialized = true
      return true
    } catch (error) {
      console.error('Auth initialization error:', error)
      return false
    }
  }

  async signInWithGoogle() {
    try {
      const currentPath = window.location.pathname || '/en'
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  getCurrentUser() {
    return this.user
  }

  getCurrentSession() {
    return this.session
  }

  setAuthChangeHandler(handler: (user: any) => void) {
    this.onAuthChange = handler
  }
}

export default new AuthService()
```

### 3. Create Auth Context Provider

```typescript
// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '@/services/authService'

interface AuthContextType {
  user: any
  loading: boolean
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        authService.setAuthChangeHandler((user) => {
          setUser(user)
          setLoading(false)
        })
        
        await authService.initialize()
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      // Cleanup if needed
    }
  }, [])

  const authContextValue: AuthContextType = {
    user,
    loading,
    signInWithGoogle: authService.signInWithGoogle.bind(authService),
    signOut: authService.signOut.bind(authService),
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### 4. Create OAuth Callback Route (PKCE Flow)

```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const origin = requestUrl.origin

  if (code) {
    try {
      const response = NextResponse.redirect(`${origin}${next}`)
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.headers.get('cookie')
                ?.split(';')
                ?.find(c => c.trim().startsWith(`${name}=`))
                ?.split('=')[1]
            },
            set(name: string, value: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value,
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            },
            remove(name: string, options: CookieOptions) {
              response.cookies.set({
                name,
                value: '',
                ...options,
                expires: new Date(0),
              })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        return NextResponse.redirect(`${origin}/?error=auth_failed`)
      }
      
      return response
    } catch (error) {
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=no_code`)
}
```

### 5. Update Middleware

Ensure the middleware handles auth routes properly:

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for auth routes
  const shouldSkip = [
    '/api',
    '/auth',
    '/_next',
    '/favicon.ico',
    // ... other static assets
  ].some(path => pathname.includes(path))

  if (shouldSkip) {
    return NextResponse.next()
  }

  // Your other middleware logic here
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
```

### 6. Configure Supabase Dashboard

In your Supabase Dashboard > Authentication > URL Configuration:

**Redirect URLs (add all):**
```
# Local development
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/
http://localhost:3001/auth/callback
http://localhost:3001/auth/callback?next=/

# Production
https://your-domain.com/auth/callback
https://your-domain.com/auth/callback?next=/

# Vercel preview deployments (if using Vercel)
https://*.vercel.app/auth/callback
https://*-your-team.vercel.app/auth/callback
```

### 7. Usage in Components

```tsx
// src/components/LoginButton.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function LoginButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  if (user) {
    return (
      <div>
        <span>Welcome, {user.email}</span>
        <button onClick={signOut}>Sign Out</button>
      </div>
    )
  }

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  )
}
```

## Common Issues and Solutions

### 1. Multiple GoTrueClient Instances Warning

**Cause:** Creating multiple Supabase clients in different parts of the app.

**Solution:** 
- Use a single Supabase client instance
- Import from one central location
- Don't mix @supabase/supabase-js and @supabase/ssr clients

### 2. Session Not Persisting After OAuth Redirect

**Cause:** Mixing implicit and PKCE flows, or incorrect redirect URL configuration.

**Solution:**
- Choose one flow type consistently (PKCE recommended)
- Ensure redirect URLs match exactly in Supabase dashboard
- Use server-side session handling for PKCE flow

### 3. OAuth Redirect Goes to Wrong Page

**Cause:** Not preserving the original page path during OAuth flow.

**Solution:**
- Include a `next` parameter in the redirect URL
- Handle the `next` parameter in the callback route

### 4. TypeScript Errors

**Cause:** Missing type annotations for Supabase auth callbacks.

**Solution:**
```typescript
// Add explicit types
.then(({ data, error }: { data: any; error: any }) => {
  // Handle response
})

// Or for auth state change
supabase.auth.onAuthStateChange((event: any, session: any) => {
  // Handle auth change
})
```

## Best Practices

1. **Centralize Authentication Logic** - Use a service pattern to avoid duplicate code
2. **Handle Loading States** - Show appropriate UI while checking authentication
3. **Error Handling** - Provide user-friendly error messages
4. **Session Refresh** - Implement automatic token refresh
5. **Security** - Use httpOnly cookies for session storage in production
6. **Environment Variables** - Never expose Supabase service keys in client code

## Testing OAuth Flow

1. Clear all cookies and localStorage
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to `/auth/callback?code=...`
5. Then redirect to original page with authenticated session
6. Verify session persists on page refresh

## Production Checklist

- [ ] All redirect URLs added to Supabase dashboard
- [ ] Environment variables properly set
- [ ] Using HTTPS in production
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Session persistence verified
- [ ] TypeScript types properly defined
- [ ] No console errors or warnings

This implementation provides a robust, production-ready Google OAuth flow that can be adapted for other OAuth providers supported by Supabase.