'use client'

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { oauthService } from '../services/OAuthService'
import type { OAuthState, OAuthConfig, OAuthSession, OAuthError } from '../types'

// OAuth Context
const OAuthContext = createContext<{
  state: OAuthState
  config: OAuthConfig
} | null>(null)

// OAuth Reducer
type OAuthAction = 
  | { type: 'SET_SESSION'; payload: OAuthSession | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: OAuthError | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }

function oauthReducer(state: OAuthState, action: OAuthAction): OAuthState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.payload, error: null }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload }
    default:
      return state
  }
}

// OAuth Provider Component
interface OAuthProviderProps {
  children: React.ReactNode
  config?: Partial<OAuthConfig>
}

export function OAuthProvider({ children, config = {} }: OAuthProviderProps) {
  const defaultConfig: OAuthConfig = {
    providers: ['google'],
    autoRefresh: true,
    persistSession: true,
    ...config
  }

  const [state, dispatch] = useReducer(oauthReducer, {
    session: null,
    loading: true,
    error: null,
    initialized: false
  })

  // Handle session updates
  const handleSessionUpdate = useCallback((session: OAuthSession | null) => {
    dispatch({ type: 'SET_SESSION', payload: session })
    
    if (session?.user && config.onSuccess) {
      config.onSuccess(session.user)
    }
  }, [config])

  // Handle errors
  const handleError = useCallback((error: OAuthError) => {
    dispatch({ type: 'SET_ERROR', payload: error })
    
    if (config.onError) {
      config.onError(error)
    }
  }, [config])

  // Initialize OAuth
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let errorUnsubscribe: (() => void) | null = null

    const initialize = async () => {
      console.log('OAuthProvider: Starting initialization')
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        // Small delay to ensure client is ready
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get initial session
        console.log('OAuthProvider: Getting initial session')
        const session = await oauthService.getSession()
        console.log('OAuthProvider: Initial session:', session ? 'Found' : 'None')
        handleSessionUpdate(session)
        
        // Set up auth listener
        console.log('OAuthProvider: Setting up auth listener')
        unsubscribe = oauthService.initializeAuthListener(handleSessionUpdate)
        
        // Set up error listener
        errorUnsubscribe = oauthService.on('error', handleError)
        
        dispatch({ type: 'SET_INITIALIZED', payload: true })
        console.log('OAuthProvider: Initialization complete')
      } catch (error) {
        console.error('OAuthProvider: Initialization error', error)
        handleError({
          code: 'OAUTH_INIT_ERROR',
          message: 'Failed to initialize OAuth',
          details: error
        })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initialize()

    return () => {
      if (unsubscribe) unsubscribe()
      if (errorUnsubscribe) errorUnsubscribe()
    }
  }, [handleSessionUpdate, handleError])

  // Auto-refresh logic
  useEffect(() => {
    if (!defaultConfig.autoRefresh || !state.session?.expiresAt) return

    const checkAndRefresh = async () => {
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = state.session!.expiresAt!
      const timeUntilExpiry = expiresAt - now

      // Refresh if less than 5 minutes until expiry
      if (timeUntilExpiry < 300) {
        const result = await oauthService.refreshSession()
        if (result.success && result.session) {
          handleSessionUpdate(result.session)
        } else if (result.error) {
          handleError(result.error)
        }
      }
    }

    const interval = setInterval(checkAndRefresh, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [state.session, defaultConfig.autoRefresh, handleSessionUpdate, handleError])

  return (
    <OAuthContext.Provider value={{ state, config: defaultConfig }}>
      {children}
    </OAuthContext.Provider>
  )
}

// Hook to use OAuth context
export function useOAuthContext() {
  const context = useContext(OAuthContext)
  if (!context) {
    throw new Error('useOAuthContext must be used within an OAuthProvider')
  }
  return context
}