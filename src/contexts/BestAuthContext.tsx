// BestAuth Context Provider
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import type { User, SignUpData, SignInData } from '@/lib/bestauth/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string; message?: string; user?: User }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string; user?: User }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; message?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>
  getUserUsageToday: () => Promise<number>
  incrementUsage: () => Promise<{ success: boolean; error?: string }>
  getUserSubscription: () => Promise<any>
  // Original BestAuth methods
  signInWithOAuth: (provider: 'google' | 'github') => void
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  resetPasswordWithToken: (token: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function BestAuthProvider({ children }: { children: ReactNode }) {
  const auth = useBestAuth()
  
  // Create an adapter to match the existing AuthContext interface
  const authContextValue: AuthContextValue = {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    
    // Adapted methods for compatibility
    signUp: async (email: string, password: string, metadata?: any) => {
      const result = await auth.signUp({
        email,
        password,
        name: metadata?.fullName || metadata?.name || ''
      })
      
      if (result.success) {
        return {
          success: true,
          message: 'Account created successfully!',
          user: auth.user || undefined
        }
      } else {
        return {
          success: false,
          error: result.error || 'Sign up failed'
        }
      }
    },
    
    signIn: async (email: string, password: string) => {
      const result = await auth.signIn({ email, password })
      
      if (result.success) {
        return {
          success: true,
          message: 'Sign in successful!',
          user: auth.user || undefined
        }
      } else {
        return {
          success: false,
          error: result.error || 'Sign in failed'
        }
      }
    },
    
    signInWithGoogle: async () => {
      try {
        auth.signInWithOAuth('google')
        return {
          success: true,
          message: 'Redirecting to Google...'
        }
      } catch (error) {
        return {
          success: false,
          error: 'Google sign in failed'
        }
      }
    },
    
    signOut: auth.signOut,
    
    resetPassword: async (email: string) => {
      const result = await auth.requestPasswordReset(email)
      
      if (result.success) {
        return {
          success: true,
          message: result.message || 'Password reset instructions have been sent to your email'
        }
      } else {
        return {
          success: false,
          error: result.error || 'Password reset failed'
        }
      }
    },
    
    updatePassword: async (newPassword: string) => {
      // This would need to be implemented based on the current user context
      return {
        success: false,
        error: 'Not implemented'
      }
    },
    
    getUserUsageToday: async () => {
      // TODO: Implement usage tracking with BestAuth
      return 0
    },
    
    incrementUsage: async () => {
      // TODO: Implement usage tracking with BestAuth
      return { success: true }
    },
    
    getUserSubscription: async () => {
      // TODO: Implement subscription management with BestAuth
      return null
    },
    
    // Original BestAuth methods
    signInWithOAuth: auth.signInWithOAuth,
    sendMagicLink: auth.sendMagicLink,
    requestPasswordReset: auth.requestPasswordReset,
    resetPasswordWithToken: auth.resetPassword,
    checkSession: auth.checkSession
  }
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a BestAuthProvider')
  }
  return context
}