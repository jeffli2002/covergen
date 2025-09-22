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
      const result = await bestAuth.signUp({ email, password, ...metadata })
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
      // BestAuth doesn't have direct updatePassword, needs to be implemented
      return { success: false, error: 'Not implemented in BestAuth' }
    },
    getUserUsageToday: async () => {
      // This would need to be implemented in BestAuth
      // For now, return 0
      return 0
    },
    incrementUsage: async () => {
      // This would need to be implemented in BestAuth
      return { success: false, error: 'Not implemented in BestAuth' }
    },
    getUserSubscription: async () => {
      // This would need to be implemented in BestAuth
      return null
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