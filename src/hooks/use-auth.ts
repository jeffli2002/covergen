import { useState, useEffect } from 'react'
import { createSimpleClient } from '@/lib/supabase/simple-client'

interface User {
  id: string
  email?: string
  user_metadata?: Record<string, any>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // First try direct API verification
        const response = await fetch('/api/auth/verify')
        const data = await response.json()
        
        if (data.authenticated && data.user) {
          setUser(data.user)
          setLoading(false)
          return
        }
      } catch (err) {
        console.log('[useAuth] API verify failed, trying client')
      }

      // Fallback to Supabase client with timeout
      try {
        const supabase = createSimpleClient()
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<{ data: { user: null }, error: Error }>((resolve) => 
            setTimeout(() => resolve({ 
              data: { user: null }, 
              error: new Error('Timeout') 
            }), 2000)
          )
        ])

        if (result.data.user) {
          setUser(result.data.user)
        }
      } catch (err) {
        console.error('[useAuth] Client check failed:', err)
      }

      setLoading(false)
    }

    checkAuth()

    // Listen for auth changes if client works
    const supabase = createSimpleClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = async () => {
    const supabase = createSimpleClient()
    const currentPath = window.location.pathname
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      }
    })
    
    if (error) {
      console.error('[useAuth] Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const supabase = createSimpleClient()
      await supabase.auth.signOut()
      
      // Clear auth cookies manually
      document.cookie.split(';').forEach(cookie => {
        if (cookie.includes('sb-') || cookie.includes('auth-')) {
          const name = cookie.split('=')[0].trim()
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('[useAuth] Sign out error:', error)
      setUser(null)
      window.location.href = '/'
    }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }
}