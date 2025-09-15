'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '@/services/authService'

interface AuthContextType {
  user: any
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  getUserUsageToday: () => Promise<number>
  incrementUsage: () => Promise<any>
  getUserSubscription: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Starting initialization')
        console.log('[AuthContext] URL:', window.location.href)
        
        // Set up auth change handler BEFORE initialization
        authService.setAuthChangeHandler((user) => {
          console.log('[AuthContext] Auth change handler called:', !!user, user?.email)
          setUser(user)
          // Only set loading to false if we're not checking for OAuth callback
          const cookies = document.cookie.split(';')
          const hasOAuthPending = cookies.some(cookie => 
            cookie.trim().startsWith('oauth-callback-success=true')
          )
          if (!hasOAuthPending) {
            setLoading(false)
          }
        })
        
        // Initialize auth service
        await authService.initialize()
        
        // Check for OAuth callback - this might take some time
        const hasOAuthCallback = await authService.checkForOAuthCallback()
        if (hasOAuthCallback) {
          console.log('[AuthContext] OAuth callback handled successfully')
          // The auth change handler should have been called by now
          // Force loading to false in case it wasn't
          setLoading(false)
        } else {
          // No OAuth callback, use current user state
          const currentUser = authService.getCurrentUser()
          console.log('[AuthContext] Current user after init:', currentUser?.email)
          setUser(currentUser)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      authService.destroy()
    }
  }, [])

  const authContextValue: AuthContextType = {
    user,
    loading,
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    signInWithGoogle: authService.signInWithGoogle.bind(authService),
    signOut: authService.signOut.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
    getUserUsageToday: authService.getUserUsageToday.bind(authService),
    incrementUsage: authService.incrementUsage.bind(authService),
    getUserSubscription: authService.getUserSubscription.bind(authService),
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