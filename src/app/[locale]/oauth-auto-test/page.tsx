'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'
import { useRouter } from 'next/navigation'

export default function OAuthAutoTest() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[OAuth Auto Test] Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('[OAuth Auto Test] User signed in successfully')
        setUser(session.user)
        setError(null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })
    
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('[OAuth Auto Test] Current session:', session?.user?.email, error?.message)
        
        if (session) {
          setUser(session.user)
        }
        if (error) {
          setError(error.message)
        }
      } catch (err: any) {
        console.error('[OAuth Auto Test] Error checking session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    checkSession()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  const handleGoogleSignIn = async () => {
    try {
      console.log('[OAuth Auto Test] Starting Google sign in...')
      
      // For auto-detection, we just need to redirect to the same page
      // The Supabase client will detect the code in the URL and handle it
      const redirectTo = window.location.href.split('?')[0] // Current page without params
      
      console.log('[OAuth Auto Test] Redirect URL:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        }
      })
      
      if (error) {
        console.error('[OAuth Auto Test] Error:', error)
        setError(error.message)
      } else {
        console.log('[OAuth Auto Test] OAuth initiated, URL:', data.url)
      }
    } catch (err: any) {
      console.error('[OAuth Auto Test] Unexpected error:', err)
      setError(err.message)
    }
  }
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[OAuth Auto Test] Sign out error:', error)
    }
  }
  
  if (loading) {
    return <div className="p-8">Loading...</div>
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Auto-Detection Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="text-sm mb-2">
          This test relies on Supabase's <code>detectSessionInUrl: true</code> to automatically
          handle OAuth callbacks. No manual code exchange needed.
        </p>
        <p className="text-sm">
          Check browser console for detailed logs.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}
      
      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            <h2 className="font-bold mb-2">Signed In Successfully!</h2>
            <p>Email: {user.email}</p>
            <p>Provider: {user.app_metadata?.provider}</p>
            <p>ID: {user.id}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign in with Google
        </button>
      )}
    </div>
  )
}