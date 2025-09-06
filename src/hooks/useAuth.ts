import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createSimpleClient } from '@/lib/supabase/simple-client'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        // First try the API endpoint (works reliably on Vercel)
        const apiResponse = await fetch('/api/auth/verify')
        const apiData = await apiResponse.json()

        if (apiData.authenticated && apiData.user && mounted) {
          setAuthState({
            user: apiData.user as User,
            loading: false,
            error: null
          })
          return
        }

        // If API check fails, try Supabase client with timeout
        const timeout = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 2000)
        })

        const supabase = createSimpleClient()
        const userCheck = supabase.auth.getUser()
        const result = await Promise.race([userCheck, timeout])

        if (!mounted) return

        if (result && 'data' in result && result.data.user) {
          setAuthState({
            user: result.data.user,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        if (!mounted) return
        
        console.error('[useAuth] Error checking auth:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const supabase = createSimpleClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session?.user) {
          setAuthState({
            user: session.user,
            loading: false,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      // Use server-side signout for reliability
      const response = await fetch('/api/auth/signout', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        // Clear local state
        setAuthState({
          user: null,
          loading: false,
          error: null
        })
        
        // Also try client-side signout
        const supabase = createSimpleClient()
        supabase.auth.signOut().catch(console.error)
        
        return { success: true }
      } else {
        throw new Error(data.error || 'Sign out failed')
      }
    } catch (error) {
      console.error('[useAuth] Error signing out:', error)
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }))
      return { success: false, error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signOut
  }
}