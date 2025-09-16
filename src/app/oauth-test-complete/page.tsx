'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthTestComplete() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  const [authUrl, setAuthUrl] = useState<string>('')

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
    console.log(`[OAuth Test] ${message}`)
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  useEffect(() => {
    // Check initial session
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}`)
      if (session) {
        addLog(`Session detected: ${session.user.email}`)
        setSession(session)
        setUser(session.user)
      } else {
        addLog('No session detected')
        setSession(null)
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    try {
      addLog('Checking current session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else if (session) {
        addLog(`Existing session found: ${session.user.email}`)
        setSession(session)
        setUser(session.user)
      } else {
        addLog('No existing session')
      }
    } catch (error) {
      addLog(`Session check exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const generateAuthUrl = async () => {
    try {
      addLog('Generating OAuth URL...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
          queryParams: {
            response_type: 'code'
          } as any
        }
      })

      if (error) {
        addLog(`OAuth URL generation error: ${error.message}`)
      } else if (data?.url) {
        addLog(`OAuth URL generated successfully`)
        setAuthUrl(data.url)
        
        // Parse and log the URL components
        const url = new URL(data.url)
        addLog(`Provider: ${url.hostname}`)
        addLog(`Redirect URI: ${url.searchParams.get('redirect_uri')}`)
        addLog(`Response Type: ${url.searchParams.get('response_type')}`)
      }
    } catch (error) {
      addLog(`OAuth URL generation exception: ${error}`)
    }
  }

  const signInWithGoogle = async () => {
    try {
      addLog('Starting Google sign in...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            response_type: 'code'
          } as any
        }
      })

      if (error) {
        addLog(`Sign in error: ${error.message}`)
      } else {
        addLog('Redirecting to Google...')
      }
    } catch (error) {
      addLog(`Sign in exception: ${error}`)
    }
  }

  const signOut = async () => {
    try {
      addLog('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
      } else {
        addLog('Signed out successfully')
        setUser(null)
        setSession(null)
      }
    } catch (error) {
      addLog(`Sign out exception: ${error}`)
    }
  }

  const refreshSession = async () => {
    try {
      addLog('Refreshing session...')
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        addLog(`Refresh error: ${error.message}`)
      } else if (data.session) {
        addLog(`Session refreshed successfully`)
        setSession(data.session)
        setUser(data.user)
      }
    } catch (error) {
      addLog(`Refresh exception: ${error}`)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Complete OAuth Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="space-y-3">
            <div>
              <strong>Status:</strong>{' '}
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            
            {user && (
              <>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Provider:</strong> {user.app_metadata?.provider || 'Unknown'}
                </div>
                <div>
                  <strong>User ID:</strong> {user.id}
                </div>
              </>
            )}

            {session && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                <strong>Session Expires:</strong>{' '}
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {!user ? (
              <button
                onClick={signInWithGoogle}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign in with Google
              </button>
            ) : (
              <>
                <button
                  onClick={signOut}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
                <button
                  onClick={refreshSession}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Refresh Session
                </button>
              </>
            )}
            
            <button
              onClick={checkSession}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Check Session
            </button>
            
            <button
              onClick={generateAuthUrl}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Generate Auth URL (Debug)
            </button>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>Current URL:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {window.location.href}
              </pre>
            </div>
            
            <div>
              <strong>Callback URL:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {`${window.location.origin}/auth/callback`}
              </pre>
            </div>
            
            <div>
              <strong>Supabase URL:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </pre>
            </div>

            {authUrl && (
              <div>
                <strong>Generated Auth URL:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                  {authUrl}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-600">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Sign in with Google" to test the OAuth flow</li>
          <li>Watch the Activity Logs for detailed information</li>
          <li>After signing in, check if the session is properly established</li>
          <li>Use "Generate Auth URL" to see the exact OAuth URL being used</li>
          <li>Check browser console for additional debug information</li>
        </ol>
        
        <div className="mt-4">
          <strong>Common Issues:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>If redirected to /en, the locale routing is interfering</li>
            <li>If no session after redirect, check cookie settings</li>
            <li>Check Supabase dashboard for allowed redirect URLs</li>
            <li>Ensure PKCE flow is enabled (response_type=code)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}