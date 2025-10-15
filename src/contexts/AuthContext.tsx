'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { authConfig } from '@/config/auth.config'

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
  if (authConfig.USE_BESTAUTH) {
    // Use BestAuth implementation
    return <BestAuthProvider>{children}</BestAuthProvider>
  } else {
    // Use Supabase implementation (backup)
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
  }
}

// BestAuth implementation
function BestAuthProvider({ children }: { children: React.ReactNode }) {
  const bestAuth = useBestAuth()

  // Map BestAuth methods to AuthContext interface
  const authContextValue: AuthContextType = {
    user: bestAuth.user,
    loading: bestAuth.loading,
    signUp: async (email: string, password: string, metadata?: any) => {
      // Get session ID from cookie before signup
      let sessionId: string | undefined
      try {
        const cookies = document.cookie.split(';')
        const sessionCookie = cookies.find(c => c.trim().startsWith('covergen_session_id='))
        if (sessionCookie) {
          sessionId = sessionCookie.split('=')[1]
          console.log('[AuthContext] Found session ID for signup:', sessionId)
        }
      } catch (err) {
        console.error('[AuthContext] Failed to get session ID:', err)
      }

      const result = await bestAuth.signUp({ email, password, sessionId, ...metadata })
      
      // Create default subscription for new users via API
      if (result.success && bestAuth.user) {
        try {
          await fetch('/api/subscription/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: bestAuth.user.id,
              tier: 'free',
              status: 'active'
            })
          })
        } catch (error) {
          console.error('[AuthContext] Failed to create subscription:', error)
        }
      }
      
      return result
    },
    signIn: async (email: string, password: string) => {
      const result = await bestAuth.signIn({ email, password })
      return result
    },
    signInWithGoogle: async () => {
      // BestAuth uses direct OAuth redirect
      await bestAuth.signInWithOAuth('google')
      return { success: true }
    },
    signOut: bestAuth.signOut,
    resetPassword: async (email: string) => {
      const result = await bestAuth.requestPasswordReset(email)
      return result
    },
    updatePassword: async (newPassword: string) => {
      if (!bestAuth.user) {
        return { success: false, error: 'Not authenticated' }
      }
      
      try {
        const response = await fetch('/api/auth/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        })
        
        const result = await response.json()
        return result
      } catch (error) {
        console.error('Error updating password:', error)
        return { success: false, error: 'Failed to update password' }
      }
    },
    getUserUsageToday: async () => {
      if (!bestAuth.user) return 0
      try {
        const response = await fetch(`/api/usage/today?userId=${bestAuth.user.id}`)
        const data = await response.json()
        return data.usage || 0
      } catch (error) {
        console.error('Error getting usage:', error)
        return 0
      }
    },
    incrementUsage: async () => {
      if (!bestAuth.user) {
        return { success: false, error: 'Not authenticated' }
      }
      
      try {
        const response = await fetch('/api/usage/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: bestAuth.user.id })
        })
        return await response.json()
      } catch (error) {
        console.error('Error incrementing usage:', error)
        return { success: false, error: 'Failed to increment usage' }
      }
    },
    getUserSubscription: async () => {
      console.log('[AuthContext] getUserSubscription called', {
        hasUser: !!bestAuth.user,
        userId: bestAuth.user?.id
      })
      
      if (!bestAuth.user) {
        console.log('[AuthContext] No user found, returning null')
        return null
      }
      
      try {
        const response = await fetch(`/api/subscription?userId=${bestAuth.user.id}`)
        const subscription = await response.json()
        console.log('[AuthContext] Subscription loaded:', subscription)
        return subscription
      } catch (error) {
        console.error('[AuthContext] Failed to get subscription:', error)
        return null
      }
    }
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Supabase implementation (backup)
function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[SupabaseAuth] Starting initialization')
        const authService = (await import('@/services/authService')).default
        
        authService.setAuthChangeHandler((user) => {
          console.log('[SupabaseAuth] Auth change handler called:', !!user, user?.email)
          setUser(user)
          setLoading(false)
        })
        
        await authService.initialize()
        
        const currentUser = authService.getCurrentUser()
        console.log('[SupabaseAuth] Current user after init:', currentUser?.email)
        setUser(currentUser)
      } catch (error) {
        console.error('Supabase auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      import('@/services/authService').then(({ default: authService }) => {
        authService.destroy()
      })
    }
  }, [])

  const authContextValue: AuthContextType = {
    user,
    loading,
    signUp: async (email: string, password: string, metadata?: any) => {
      const authService = (await import('@/services/authService')).default
      return authService.signUp(email, password, metadata)
    },
    signIn: async (email: string, password: string) => {
      const authService = (await import('@/services/authService')).default
      return authService.signIn(email, password)
    },
    signInWithGoogle: async () => {
      const authService = (await import('@/services/authService')).default
      return authService.signInWithGoogle()
    },
    signOut: async () => {
      const authService = (await import('@/services/authService')).default
      return authService.signOut()
    },
    resetPassword: async (email: string) => {
      const authService = (await import('@/services/authService')).default
      return authService.resetPassword(email)
    },
    updatePassword: async (newPassword: string) => {
      const authService = (await import('@/services/authService')).default
      return authService.updatePassword(newPassword)
    },
    getUserUsageToday: async () => {
      const authService = (await import('@/services/authService')).default
      return authService.getUserUsageToday()
    },
    incrementUsage: async () => {
      const authService = (await import('@/services/authService')).default
      return authService.incrementUsage()
    },
    getUserSubscription: async () => {
      const authService = (await import('@/services/authService')).default
      return authService.getUserSubscription()
    }
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