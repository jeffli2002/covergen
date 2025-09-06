'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OAuthOfficialTestPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      setUser(user)
    } catch (error: any) {
      console.error('Error loading user:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    
    try {
      const origin = window.location.origin
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback-official?next=${encodeURIComponent(window.location.pathname)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        throw error
      }

      // The redirect happens automatically on client-side
    } catch (error: any) {
      setError(error.message)
      console.error('OAuth error:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear all auth-related data
      router.push('/en')
    } catch (error: any) {
      console.error('Sign out error:', error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Official Supabase OAuth Test</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Authenticated!</h2>
              <p className="text-sm text-gray-700">Email: {user.email}</p>
              <p className="text-sm text-gray-700">Provider: {user.app_metadata?.provider || 'unknown'}</p>
              <p className="text-sm text-gray-700">ID: {user.id}</p>
            </div>
            
            <button
              onClick={signOut}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">You are not signed in.</p>
            
            <button
              onClick={signInWithGoogle}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Test Information:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Using official @supabase/ssr pattern</li>
            <li>• Client-side OAuth initiation</li>
            <li>• Server-side code exchange at /auth/callback-official</li>
            <li>• Proper cookie handling with SSR</li>
          </ul>
        </div>
      </div>
    </div>
  )
}