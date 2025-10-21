'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { bestAuthService } from '@/services/auth/BestAuthService'
import { sessionBridgeService } from '@/services/bridge/SessionBridgeService'
import type { User, SignUpData, SignInData } from '@/services/auth/BestAuthService'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
}

interface AuthContextValue extends AuthState {
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: 'google' | 'github') => void
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (data: any) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    initialized: false
  })

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setState({
            user: data.user,
            loading: false,
            error: null,
            initialized: true
          })
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
            initialized: true
          })
        }
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
          initialized: true
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      setState({
        user: null,
        loading: false,
        error: 'Failed to initialize authentication',
        initialized: true
      })
    }
  }

  const signUp = useCallback(async (data: SignUpData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.user) {
        setState({
          user: result.user,
          loading: false,
          error: null,
          initialized: true
        })
        router.push('/dashboard')
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sign up failed'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [router])

  const signIn = useCallback(async (data: SignInData) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.user) {
        setState({
          user: result.user,
          loading: false,
          error: null,
          initialized: true
        })
        router.push('/dashboard')
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sign in failed'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [router])

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setState({
          user: null,
          loading: false,
          error: null,
          initialized: true
        })
        router.push('/')
      } else {
        throw new Error('Sign out failed')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out'
      }))
    }
  }, [router])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    // Use BestAuth OAuth implementation
    const redirectUri = `${window.location.origin}/api/auth/callback/${provider}`
    
    // Generate OAuth state
    const state = crypto.randomUUID()
    
    // Store state in cookie for verification
    document.cookie = `oauth_state=${state}; path=/; max-age=600; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
    
    // Import OAuth helper
    const { getOAuthAuthorizationUrl } = await import('@/lib/bestauth/oauth')
    
    // Get authorization URL
    const authUrl = getOAuthAuthorizationUrl(provider, state, redirectUri)
    
    console.log('[useAuth] Initiating OAuth flow:', { provider, redirectUri, authUrl })
    
    // Redirect to OAuth provider
    window.location.href = authUrl
  }, [])

  const sendMagicLink = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to send magic link'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send magic link'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to request password reset'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request password reset'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  const resetPassword = useCallback(async (token: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, loading: false }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to reset password'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  const updateUser = useCallback(async (data: any) => {
    if (!state.user) {
      return { success: false, error: 'No user logged in' }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })

      const result = await response.json()

      if (response.ok && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          loading: false
        }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to update user'
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user'
      setState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [state.user])

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setState(prev => ({
            ...prev,
            user: data.user
          }))
        }
      }
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [])

  const value: AuthContextValue = {
    ...state,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    sendMagicLink,
    requestPasswordReset,
    resetPassword,
    updateUser,
    refreshSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access the unified auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Hook to get the current user
 */
export function useUser() {
  const { user, loading } = useAuth()
  return { user, loading }
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { user, initialized } = useAuth()
  return initialized ? !!user : null
}

/**
 * Hook for protected routes
 */
export function useRequireAuth(redirectTo: string = '/auth/signin') {
  const router = useRouter()
  const { user, initialized } = useAuth()

  useEffect(() => {
    if (initialized && !user) {
      router.push(redirectTo)
    }
  }, [user, initialized, router, redirectTo])

  return { user, loading: !initialized }
}