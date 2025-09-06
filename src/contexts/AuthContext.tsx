'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { userSessionService, type UnifiedUser } from '@/services/unified/UserSessionService'
import authService from '@/services/authService'

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
        console.log('[AuthContext] Starting unified service initialization')
        console.log('[AuthContext] URL:', window.location.href)
        
        // Initialize the unified service
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
          
          return unsubscribe
        } else {
          // Fallback to old auth service if unified service fails
          console.warn('[AuthContext] Unified service failed, falling back to old auth service')
          
          authService.setAuthChangeHandler((legacyUser) => {
            console.log('[AuthContext] Legacy auth change:', !!legacyUser, legacyUser?.email)
            // Convert legacy user to unified format
            if (legacyUser) {
              const unifiedUser: UnifiedUser = {
                id: legacyUser.id,
                email: legacyUser.email,
                name: legacyUser.user_metadata?.full_name,
                avatar: legacyUser.user_metadata?.avatar_url,
                provider: 'google',
                subscription: {
                  tier: 'free',
                  status: 'active',
                  customerId: undefined,
                  subscriptionId: undefined,
                  currentPeriodEnd: undefined,
                  cancelAtPeriodEnd: false,
                  trialEndsAt: undefined
                },
                usage: {
                  monthly: 0,
                  monthlyLimit: 10,
                  daily: 0,
                  dailyLimit: 3,
                  remaining: 3
                },
                session: {
                  accessToken: '',
                  refreshToken: '',
                  expiresAt: 0,
                  isValid: false
                }
              }
              setUser(unifiedUser)
            } else {
              setUser(null)
            }
            setLoading(false)
          })
          
          await authService.initialize()
          const legacyUser = authService.getCurrentUser()
          if (legacyUser) {
            const unifiedUser: UnifiedUser = {
              id: legacyUser.id,
              email: legacyUser.email,
              name: legacyUser.user_metadata?.full_name,
              avatar: legacyUser.user_metadata?.avatar_url,
              provider: 'google',
              subscription: { tier: 'free', status: 'active', customerId: undefined, subscriptionId: undefined, currentPeriodEnd: undefined, cancelAtPeriodEnd: false, trialEndsAt: undefined },
              usage: { monthly: 0, monthlyLimit: 10, daily: 0, dailyLimit: 3, remaining: 3 },
              session: { accessToken: '', refreshToken: '', expiresAt: 0, isValid: false }
            }
            setUser(unifiedUser)
          }
        }
      } catch (error) {
        console.error('[AuthContext] Initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    const cleanup = initAuth()

    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.())
      authService.destroy()
    }
  }, [])

  const authContextValue: AuthContextType = {
    user,
    loading,
    // Legacy email/password methods (keep for backward compatibility)
    signUp: authService.signUp.bind(authService),
    signIn: authService.signIn.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    updatePassword: authService.updatePassword.bind(authService),
    
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
      const result = await userSessionService.signOut()
      return {
        success: result.success,
        error: result.error?.message
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