// BestAuth React Hook
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, SignUpData, SignInData } from '@/lib/bestauth/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useBestAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (data.authenticated) {
        setAuthState({
          user: data.user,
          loading: false,
          error: null,
        })
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Session check error:', error)
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to check session',
      })
    }
  }, [])

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
        loading: false,
        error: null,
      })
      
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
        loading: false,
        error: null,
      })
      
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
        loading: false,
        error: null,
      })
      
      router.push('/')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed'
      setAuthState(prev => ({ ...prev, loading: false, error: message }))
      return { success: false, error: message }
    }
  }, [router])

  // Sign in with OAuth
  const signInWithOAuth = useCallback((provider: 'google' | 'github') => {
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