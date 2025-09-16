'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase-simple'

export default function OAuthSimpleTest() {
  const [status, setStatus] = useState('Loading...')
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createSupabaseClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(error.message)
        setStatus('Error checking auth')
      } else if (session) {
        setUser(session.user)
        setStatus('Authenticated')
      } else {
        setStatus('Not authenticated')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Error')
    }
  }
  
  const signIn = async () => {
    try {
      setStatus('Redirecting to Google...')
      const supabase = createSupabaseClient()
      const redirectUrl = `${window.location.origin}/auth/callback-production?next=/oauth-simple-test`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (error) {
        setError(error.message)
        setStatus('OAuth error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('Error')
    }
  }
  
  const signOut = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
    setStatus('Signed out')
    checkAuth()
  }
  
  // Don't render dynamic content until mounted to avoid hydration errors
  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple OAuth Test</h1>
      
      <div className="mb-4">
        <p className="text-lg">Status: <span className="font-semibold">{status}</span></p>
        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </div>
      
      {user ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded">
            <p className="font-semibold">Authenticated as:</p>
            <p>{user.email}</p>
            <p className="text-sm text-gray-600">ID: {user.id}</p>
          </div>
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Sign In with Google
        </button>
      )}
      
      <div className="mt-8 text-sm text-gray-600">
        <p>Using callback: {window.location.origin}/auth/callback-production</p>
        <p>Environment: {window.location.hostname}</p>
      </div>
    </div>
  )
}