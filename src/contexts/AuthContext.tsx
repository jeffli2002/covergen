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
        console.log('[AuthContext] Window location:', window.location.href)
        console.log('[AuthContext] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        
        // Set up auth change handler first
        authService.setAuthChangeHandler((user) => {
          console.log('[AuthContext] Auth change handler called:', !!user, user?.email)
          setUser(user)
        })
        
        // Initialize auth service with timeout to prevent infinite loading
        const initPromise = authService.initialize()
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('[AuthContext] Auth initialization timeout - proceeding without auth')
            resolve(false)
          }, 5000) // 5 second timeout
        })
        
        // Race between initialization and timeout
        await Promise.race([initPromise, timeoutPromise])
        
        // Get current user
        const currentUser = authService.getCurrentUser()
        console.log('[AuthContext] Current user after init:', currentUser?.email)
        setUser(currentUser)
        
        // If we're returning from an OAuth callback, trigger a session refresh
        // to ensure we pick up the newly set session
        const urlParams = new URLSearchParams(window.location.search)
        const wasOAuthCallback = window.location.pathname.includes('/auth/callback') || 
                                document.referrer.includes('/auth/callback') ||
                                sessionStorage.getItem('oauth_in_progress')
                                
        if (wasOAuthCallback) {
          console.log('[AuthContext] Detected OAuth callback return, forcing session refresh')
          sessionStorage.removeItem('oauth_in_progress')
          
          // Delay slightly to allow server-side session to be fully set
          setTimeout(async () => {
            console.log('[AuthContext] Refreshing session after OAuth callback...')
            const refreshedUser = authService.getCurrentUser()
            if (refreshedUser) {
              console.log('[AuthContext] Found user after OAuth refresh:', refreshedUser.email)
              setUser(refreshedUser)
            } else {
              // Try one more time with the Supabase client directly
              try {
                const { createSupabaseClient } = await import('@/lib/supabase-client')
                const supabase = createSupabaseClient()
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.user) {
                  console.log('[AuthContext] Found session via direct check:', session.user.email)
                  setUser(session.user)
                }
              } catch (e) {
                console.error('[AuthContext] Error checking session after OAuth:', e)
              }
            }
          }, 1000)
        }
        
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error)
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