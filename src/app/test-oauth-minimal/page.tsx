'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

// Create a minimal Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TestOAuthMinimalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Test] ${message}`)
  }

  useEffect(() => {
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search)
    const authError = urlParams.get('auth_error')
    if (authError) {
      setError(`Auth error: ${authError}`)
      addLog(`Found auth error in URL: ${authError}`)
    }

    // Check current session
    checkSession()
  }, [])

  const checkSession = async () => {
    addLog('Checking current session...')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      addLog(`Session check error: ${error.message}`)
      setError(error.message)
    } else if (data?.session) {
      addLog(`Session found: ${data.session.user.email}`)
      setUser(data.session.user)
    } else {
      addLog('No session found')
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    setError(null)
    addLog('Starting Google sign in...')

    try {
      // Clear any existing session
      await supabase.auth.signOut()
      addLog('Cleared existing session')

      // Use the most basic OAuth setup
      const redirectTo = `${window.location.origin}/auth/callback-v2?next=${window.location.pathname}`
      addLog(`Redirect URL: ${redirectTo}`)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        }
      })

      if (error) {
        addLog(`OAuth error: ${error.message}`)
        throw error
      }

      if (data?.url) {
        addLog(`OAuth URL generated: ${data.url.substring(0, 50)}...`)
        addLog('Redirecting to Google...')
        // Add a small delay to ensure logs are visible
        setTimeout(() => {
          window.location.href = data.url
        }, 100)
      } else {
        throw new Error('No OAuth URL returned')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      addLog(`Error: ${message}`)
      setError(message)
      setLoading(false)
    }
  }

  const signOut = async () => {
    addLog('Signing out...')
    await supabase.auth.signOut()
    setUser(null)
    addLog('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Minimal OAuth Test</h1>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ Signed in as: {user.email}</p>
              <p className="text-sm text-gray-600">ID: {user.id}</p>
              <button
                onClick={signOut}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">Not signed in</p>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Sign in with Google'}
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, i) => <div key={i}>{log}</div>)
            ) : (
              <div className="text-gray-500">No logs yet</div>
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</div>
            <div><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'SSR'}</div>
            <div><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
            <div><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
            <div><strong>Node Env:</strong> {process.env.NODE_ENV}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal ml-6 text-sm space-y-1">
            <li>Click "Sign in with Google"</li>
            <li>Watch the debug logs for any errors</li>
            <li>Complete Google sign in</li>
            <li>You should be redirected back and see your email</li>
            <li>Check browser console for additional errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}