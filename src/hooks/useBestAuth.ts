// BestAuth React Hook
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, SignUpData, SignInData } from '@/lib/bestauth/types'
import { authEvents } from '@/lib/events/auth-events'

interface AuthState {
  user: User | null
  session: { token: string; expires_at: string } | null
  loading: boolean
  error: string | null
}

export function useBestAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      console.log('[useBestAuth] Session check response:', {
        status: response.status,
        authenticated: data.authenticated,
        user: data.user,
      })
      
      if (data.authenticated) {
        setAuthState({
          user: data.user,
          session: data.session,
          loading: false,
          error: null,
        })
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Session check error:', error)
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: 'Failed to check session',
      })
    }
  }, [])

  // Check session on mount and when page becomes visible
  useEffect(() => {
    checkSession()
    
    // Re-check session when page becomes visible (e.g., after OAuth redirect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useBestAuth] Page became visible, checking session')
        checkSession()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkSession)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkSession)
    }
  }, [checkSession])

  // Sign up
  const signUp = useCallback(async (data: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Sign up failed')
      }
      
      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
      })
      
      // Emit auth change event
      authEvents.emitAuthChange('signin')
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  // Sign in
  const signIn = useCallback(async (data: SignInData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Sign in failed')
      }
      
      setAuthState({
        user: result.user,
        session: result.session,
        loading: false,
        error: null,
      })
      
      // Emit auth change event
      authEvents.emitAuthChange('signin')
      
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Sign out failed')
      }
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })
      
      // Emit auth change event
      authEvents.emitAuthChange('signout')
      
      router.push('/')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [router])

  // Sign in with OAuth
  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    // Use BestAuth OAuth implementation
    window.location.href = `/api/auth/oauth/${provider}`
  }, [])

  // Send magic link
  const sendMagicLink = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send magic link')
      }
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true, message: result.message }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send magic link'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to request password reset')
      }
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true, message: result.message }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request password reset'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (token: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset password')
      }
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true, message: result.message }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [])

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    sendMagicLink,
    requestPasswordReset,
    resetPassword,
    checkSession,
  }
}