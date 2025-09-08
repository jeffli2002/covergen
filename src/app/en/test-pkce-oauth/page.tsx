'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-simple'
import authService from '@/services/authService'
import { PKCEDebug } from '@/components/auth/PKCEDebug'

export default function TestPKCEOAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 12)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[Test PKCE] ${message}`)
  }

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      addLog('Checking initial session...')
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        addLog(`Session found: ${session.user.email}`)
      } else {
        addLog('No session found')
      }
    }
    
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      addLog(`Auth state changed: ${event}`)
      setSession(session)
      if (session) {
        addLog(`New session: ${session.user.email}`)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      addLog('Starting Google OAuth flow...')
      
      // Use the current test page as the return URL
      const currentPath = '/en/test-pkce-oauth'
      
      // Test different callback URLs
      const useNewCallback = true // Toggle this to test different approaches
      const callbackRoute = useNewCallback ? '/auth/callback' : '/auth/callback-pkce'
      const redirectUrl = `${window.location.origin}${callbackRoute}?next=${encodeURIComponent(currentPath)}`
      
      addLog(`Using redirect URL: ${redirectUrl}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        throw error
      }
      
      addLog('OAuth initiated successfully')
    } catch (err: any) {
      addLog(`Error: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      addLog('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setSession(null)
      addLog('Signed out successfully')
    } catch (err: any) {
      addLog(`Sign out error: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">PKCE OAuth Test Page</h1>
        
        {/* Status */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Current Status</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ Authenticated</p>
              <p>Email: {session.user.email}</p>
              <p>Provider: {session.user.app_metadata?.provider}</p>
              <p>ID: {session.user.id}</p>
            </div>
          ) : (
            <p className="text-gray-600">Not authenticated</p>
          )}
        </div>

        {/* Actions */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Actions</h2>
          {!session ? (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign in with Google'}
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign Out'}
            </button>
          )}
          
          {error && (
            <div className="mt-4 rounded bg-red-100 p-3 text-red-700">
              Error: {error}
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Activity Log</h2>
          <div className="max-h-64 overflow-y-auto rounded bg-gray-100 p-4">
            <pre className="text-xs">
              {logs.length > 0 ? logs.join('\n') : 'No activity yet...'}
            </pre>
          </div>
        </div>

        {/* Debug Info */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Callback URLs Configured:</strong></p>
            <ul className="ml-6 list-disc">
              <li>/auth/callback (redirects to client handler)</li>
              <li>/auth/callback-handler (client-side PKCE handler)</li>
              <li>/auth/callback-pkce (direct client redirect)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PKCE Debug Component */}
      <PKCEDebug />
    </div>
  )
}