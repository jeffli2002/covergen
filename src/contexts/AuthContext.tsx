'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'
import { User } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  provider: 'google' | 'email'
  subscription?: {
    tier: 'free' | 'pro' | 'pro_plus'
    status: string
  }
  usage?: {
    daily: number
    monthly: number
  }
}

interface AuthContextType {
  user: AuthUser | null
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Starting simple auth initialization')
        
        // Check if we're returning from OAuth
        const params = new URLSearchParams(window.location.search)
        const oauthSuccess = params.get('oauth_success')
        const oauthReturn = params.get('oauth_return')
        
        if (oauthSuccess || oauthReturn) {
          console.log('[AuthContext] Detected OAuth return, checking session...')
          // Remove the OAuth params from URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('oauth_success')
          newUrl.searchParams.delete('oauth_return')
          window.history.replaceState({}, '', newUrl.toString())
        }
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error)
        } else if (session?.user) {
          console.log('[AuthContext] Found session for:', session.user.email)
          // Build simple user object
          const authUser = await buildAuthUser(session.user)
          setUser(authUser)
        } else {
          console.log('[AuthContext] No session found')
        }
        
        setLoading(false)
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[AuthContext] Auth state change:', event)
          
          if (session?.user) {
            const authUser = await buildAuthUser(session.user)
            setUser(authUser)
          } else {
            setUser(null)
          }
        })
        
        return () => subscription.unsubscribe()
      } catch (error) {
        console.error('[AuthContext] Initialization error:', error)
        setLoading(false)
      }
    }

    const cleanup = initAuth()

    return () => {
      cleanup?.then(unsubscribe => unsubscribe?.())
    }
  }, [])

  // Helper function to build auth user from Supabase user
  async function buildAuthUser(supabaseUser: User): Promise<AuthUser> {
    try {
      // Get subscription data
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('status', 'active')
        .single()

      if (subError && subError.code !== 'PGRST116') {
        console.error('[AuthContext] Error fetching subscription:', subError)
      }

      // Get usage data
      const { data: usage, error: usageError } = await supabase
        .rpc('check_generation_limit', {
          p_user_id: supabaseUser.id,
          p_subscription_tier: subscription?.subscription_tier || 'free'
        })

      if (usageError) {
        console.error('[AuthContext] Error fetching usage:', usageError)
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        provider: (supabaseUser.app_metadata?.provider as 'google' | 'email') || 'email',
        subscription: {
          tier: subscription?.subscription_tier || 'free',
          status: subscription?.status || 'active'
        },
        usage: {
          daily: usage?.daily_usage || 0,
          monthly: usage?.monthly_usage || 0
        }
      }
    } catch (error) {
      console.error('[AuthContext] Error building auth user:', error)
      // Return minimal user object on error
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        provider: (supabaseUser.app_metadata?.provider as 'google' | 'email') || 'email',
        subscription: {
          tier: 'free',
          status: 'active'
        },
        usage: {
          daily: 0,
          monthly: 0
        }
      }
    }
  }

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
    
    // OAuth and payment methods
    signInWithGoogle: async () => {
      try {
        const currentPath = window.location.pathname || '/en'
        const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
        
        console.log('[AuthContext] Google sign-in initiated with redirect:', redirectUrl)

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        })

        if (error) {
          console.error('[AuthContext] OAuth error:', error)
          return {
            success: false,
            error: error.message
          }
        }

        return { success: true, data: 'redirecting' }
      } catch (error: any) {
        console.error('[AuthContext] Sign in error:', error)
        return {
          success: false,
          error: error.message || 'Failed to sign in'
        }
      }
    },
    
    signOut: async () => {
      try {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          console.error('[AuthContext] Sign out error:', error)
          return {
            success: false,
            error: error.message
          }
        }
        
        // Also call server-side signout for cleanup
        await fetch('/api/auth/signout', { method: 'POST' }).catch(console.error)
        
        // Clear local state
        setUser(null)
        
        return { success: true }
      } catch (error) {
        console.error('[AuthContext] Sign out error:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Sign out failed'
        }
      }
    },
    
    // Usage methods
    getUserUsageToday: async () => {
      return user?.usage?.daily || 0
    },
    
    incrementUsage: async () => {
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const { data, error } = await supabase.rpc('increment_generation_count', {
          p_user_id: user.id,
          p_subscription_tier: user.subscription?.tier || 'free'
        })

        if (error) {
          return { success: false, error: error.message }
        }

        // Update local user state
        if (data) {
          setUser(prev => prev ? {
            ...prev,
            usage: {
              daily: data.daily_usage || 0,
              monthly: data.monthly_usage || 0
            }
          } : null)
        }

        return { success: true, remaining: data?.remaining_daily || 0 }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },
    
    getUserSubscription: async () => {
      return user?.subscription || null
    },
    
    // Payment methods
    createCheckoutSession: async (planId: 'pro' | 'pro_plus') => {
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          return { success: false, error: 'No valid session' }
        }

        const response = await fetch('/api/payment/unified-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`
          },
          body: JSON.stringify({
            planId,
            successUrl: `${window.location.origin}/payment/success?plan=${planId}&user=${user.id}`,
            cancelUrl: `${window.location.origin}/payment/cancel?plan=${planId}`
          })
        })

        const result = await response.json()
        
        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to create checkout session' }
        }

        return { success: true, url: result.url }
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create checkout session' }
      }
    },
    
    createPortalSession: async () => {
      if (!user) {
        return { success: false, error: 'Not authenticated' }
      }

      try {
        const session = await supabase.auth.getSession()
        if (!session.data.session) {
          return { success: false, error: 'No valid session' }
        }

        const response = await fetch('/api/payment/portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session.access_token}`
          },
          body: JSON.stringify({
            returnUrl: `${window.location.origin}/account?portal_return=true`
          })
        })

        const result = await response.json()
        
        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to access portal' }
        }

        return { success: true, url: result.url }
      } catch (error: any) {
        return { success: false, error: error.message || 'Failed to access portal' }
      }
    },
    
    checkUsageLimit: async () => {
      if (!user) {
        return { canGenerate: false, remaining: 0, limit: 0 }
      }

      try {
        const { data, error } = await supabase.rpc('check_generation_limit', {
          p_user_id: user.id,
          p_subscription_tier: user.subscription?.tier || 'free'
        })

        if (error) {
          console.error('[AuthContext] Usage check error:', error)
          return { canGenerate: false, remaining: 0, limit: 0 }
        }

        return {
          canGenerate: data?.can_generate || false,
          remaining: data?.remaining_daily || 0,
          limit: data?.daily_limit || 0
        }
      } catch (error) {
        console.error('[AuthContext] Usage check error:', error)
        return { canGenerate: false, remaining: 0, limit: 0 }
      }
    },
    
    // Computed properties
    hasValidSubscription: user?.subscription?.tier !== 'free' && user?.subscription?.status === 'active',
    isTrialing: user?.subscription?.status === 'trialing'
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