'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '@/services/authService'
import { useAppStore } from '@/lib/store'
import { SubscriptionTier } from '@/lib/rate-limit'

export interface UserSubscription {
  tier: SubscriptionTier
  monthlyUsage: number
  quotaLimit: number
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

interface AuthContextType {
  user: any
  subscription: UserSubscription | null
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
  refreshSubscription: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const { setUser: setStoreUser } = useAppStore()
  

  useEffect(() => {
    // Handle implicit flow tokens if present in URL
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      
      if (accessToken && refreshToken) {
        // Set session from URL tokens
        authService.setSessionFromTokens(accessToken, refreshToken).then(() => {
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        })
      }
    }

    const initAuth = async () => {
      try {
        // Set up auth change handler first, before initialization
        authService.setAuthChangeHandler(async (user) => {
          setUser(user)
          setLoading(false)
          
          // Sync with app store
          if (user) {
            const subscriptionData = await authService.getUserSubscription()
            const quotaLimits = {
              free: 10,
              pro: 120,
              pro_plus: 300
            }
            const tier = subscriptionData?.tier || 'free'
            const monthlyUsage = subscriptionData?.monthlyUsage || 0
            
            const subscription: UserSubscription = {
              tier: tier as SubscriptionTier,
              monthlyUsage,
              quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
              currentPeriodEnd: subscriptionData?.currentPeriodEnd,
              cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd
            }
            
            setSubscription(subscription)
            setStoreUser({
              id: user.id,
              email: user.email,
              tier: tier as 'free' | 'pro' | 'pro_plus',
              quotaUsed: monthlyUsage,
              quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10
            })
          } else {
            setSubscription(null)
            setStoreUser(null)
          }
        })
        
        // Initialize auth service and wait for completion
        await authService.initialize()
        
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)
        
        // Load subscription data on init
        if (currentUser) {
          const subscriptionData = await authService.getUserSubscription()
          const quotaLimits = {
            free: 10,
            pro: 120,
            pro_plus: 300
          }
          const tier = subscriptionData?.tier || 'free'
          const monthlyUsage = subscriptionData?.monthlyUsage || 0
          
          const subscription: UserSubscription = {
            tier: tier as SubscriptionTier,
            monthlyUsage,
            quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
            currentPeriodEnd: subscriptionData?.currentPeriodEnd,
            cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd
          }
          
          setSubscription(subscription)
          setStoreUser({
            id: currentUser.id,
            email: currentUser.email,
            tier: tier as 'free' | 'pro' | 'pro_plus',
            quotaUsed: monthlyUsage,
            quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10
          })
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
  }, [setStoreUser])

  const refreshSubscription = async () => {
    if (!user) return
    
    const subscriptionData = await authService.getUserSubscription()
    const quotaLimits = {
      free: 10,
      pro: 120,
      pro_plus: 300
    }
    const tier = subscriptionData?.tier || 'free'
    const monthlyUsage = subscriptionData?.monthlyUsage || 0
    
    const subscription: UserSubscription = {
      tier: tier as SubscriptionTier,
      monthlyUsage,
      quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
      currentPeriodEnd: subscriptionData?.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd
    }
    
    setSubscription(subscription)
  }

  const authContextValue: AuthContextType = {
    user,
    subscription,
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
    refreshSubscription,
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