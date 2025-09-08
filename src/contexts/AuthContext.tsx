'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { userSessionService, type UnifiedUser } from '@/services/unified/UserSessionService'

interface AuthContextType {
  user: UnifiedUser | null
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
  // New unified service methods
  createCheckoutSession: (planId: 'pro' | 'pro_plus') => Promise<{ success: boolean; url?: string; error?: string }>
  createPortalSession: () => Promise<{ success: boolean; url?: string; error?: string }>
  checkUsageLimit: () => Promise<{ canGenerate: boolean; remaining: number; limit: number }>
  hasValidSubscription: boolean
  isTrialing: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Starting simplified initialization')
        
        // Only use the unified service - no fallbacks, no legacy auth service
        const initialized = await userSessionService.initialize()
        
        if (initialized) {
          // Subscribe to unified user changes
          const unsubscribe = userSessionService.subscribe((unifiedUser) => {
            console.log('[AuthContext] Unified user change:', !!unifiedUser, unifiedUser?.email)
            setUser(unifiedUser)
            setLoading(false)
          })
          
          // Get current user immediately
          const currentUser = userSessionService.getCurrentUser()
          console.log('[AuthContext] Current unified user:', currentUser?.email)
          setUser(currentUser)
          setLoading(false)
          
          return unsubscribe
        } else {
          console.error('[AuthContext] Failed to initialize unified service')
          setLoading(false)
        }
      } catch (error) {
        console.error('[AuthContext] Initialization error:', error)
        setLoading(false)
      }
    }

    const cleanupPromise = initAuth()

    return () => {
      cleanupPromise?.then(unsubscribe => unsubscribe?.())
    }
  }, [])

  const authContextValue: AuthContextType = {
    user,
    loading,
    // Email/password methods - redirect to unified service
    signUp: async (email: string, password: string, metadata?: any) => {
      // For now, return not implemented since unified service focuses on OAuth
      return {
        success: false,
        error: 'Email/password signup not implemented in unified service'
      }
    },
    signIn: async (email: string, password: string) => {
      // For now, return not implemented since unified service focuses on OAuth
      return {
        success: false,
        error: 'Email/password signin not implemented in unified service'
      }
    },
    resetPassword: async (email: string) => {
      return {
        success: false,
        error: 'Password reset not implemented in unified service'
      }
    },
    updatePassword: async (newPassword: string) => {
      return {
        success: false,
        error: 'Password update not implemented in unified service'
      }
    },
    
    // OAuth and payment methods from unified service
    signInWithGoogle: async () => {
      const result = await userSessionService.signInWithGoogle()
      return {
        success: result.success,
        error: result.error?.message,
        data: result.success ? 'redirecting' : undefined
      }
    },
    
    signOut: async () => {
      try {
        // Use server-side signout for reliability
        const response = await fetch('/api/auth/signout', { method: 'POST' })
        const data = await response.json()
        
        if (data.success) {
          // Clear local state
          setUser(null)
          
          // Try to sign out from userSessionService too
          userSessionService.signOut().catch(console.error)
          
          return { success: true }
        }
        
        return {
          success: false,
          error: data.error || 'Sign out failed'
        }
      } catch (error) {
        console.error('[AuthContext] Sign out error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Sign out failed'
        }
      }
    },
    
    // Usage methods from unified service
    getUserUsageToday: async () => {
      return user?.usage.daily || 0
    },
    
    incrementUsage: async () => {
      const result = await userSessionService.incrementUsage()
      return {
        success: result.success,
        error: result.error,
        remaining: result.remaining
      }
    },
    
    getUserSubscription: async () => {
      return user?.subscription || null
    },
    
    // New unified service methods
    createCheckoutSession: async (planId: 'pro' | 'pro_plus') => {
      const result = await userSessionService.createCheckoutSession(planId)
      return {
        success: result.success,
        url: result.url,
        error: result.error?.message
      }
    },
    
    createPortalSession: async () => {
      const result = await userSessionService.createPortalSession()
      return {
        success: result.success,
        url: result.url,
        error: result.error?.message
      }
    },
    
    checkUsageLimit: async () => {
      return await userSessionService.checkUsageLimit()
    },
    
    // Computed properties
    hasValidSubscription: userSessionService.hasValidSubscription(),
    isTrialing: userSessionService.isTrialing()
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