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
        
        // Check if we just came back from OAuth callback
        const isOAuthCallback = window.location.search.includes('error=') || 
                               window.location.pathname.includes('/auth/callback')
        
        if (isOAuthCallback) {
          console.log('[AuthContext] OAuth callback detected, waiting for session...')
          // Give the callback route time to set cookies
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        authService.setAuthChangeHandler((user) => {
          console.log('[AuthContext] Auth change handler called:', !!user, user?.email)
          setUser(user)
          setLoading(false)
        })
        
        await authService.initialize()
        
        const currentUser = authService.getCurrentUser()
        console.log('[AuthContext] Current user after init:', currentUser?.email)
        setUser(currentUser)
        
        // If no user found but we just came from OAuth, check again
        if (!currentUser && isOAuthCallback) {
          console.log('[AuthContext] No user after OAuth callback, checking again...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          await authService.checkSession()
          const retryUser = authService.getCurrentUser()
          if (retryUser) {
            console.log('[AuthContext] User found on retry:', retryUser.email)
            setUser(retryUser)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
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