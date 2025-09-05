'use client'

import { useCallback } from 'react'
import { useOAuthContext } from '../provider/OAuthProvider'
import { oauthService } from '../services/OAuthService'
import type { OAuthProvider, OAuthUser } from '../types'

export function useOAuth() {
  const { state, config } = useOAuthContext()

  // Sign in with OAuth provider
  const signIn = useCallback(async (provider: OAuthProvider = 'google') => {
    if (!config.providers.includes(provider)) {
      throw new Error(`OAuth provider '${provider}' is not configured`)
    }
    
    return await oauthService.signIn(provider)
  }, [config.providers])

  // Sign out
  const signOut = useCallback(async () => {
    return await oauthService.signOut()
  }, [])

  // Refresh session
  const refreshSession = useCallback(async () => {
    return await oauthService.refreshSession()
  }, [])

  // Subscribe to auth events
  const onAuthChange = useCallback((callback: (user: OAuthUser | null) => void) => {
    const unsubscribeSignIn = oauthService.on('signIn', callback)
    const unsubscribeSignOut = oauthService.on('signOut', () => callback(null))
    
    return () => {
      unsubscribeSignIn()
      unsubscribeSignOut()
    }
  }, [])

  return {
    // State
    user: state.session?.user || null,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.session?.user,
    
    // Actions
    signIn,
    signOut,
    refreshSession,
    
    // Events
    onAuthChange
  }
}

// Convenience hook for just the user
export function useOAuthUser() {
  const { user } = useOAuth()
  return user
}

// Convenience hook for auth status
export function useOAuthStatus() {
  const { isAuthenticated, loading } = useOAuth()
  return { isAuthenticated, loading }
}