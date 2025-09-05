'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthTestSimple() {
  const [logs, setLogs] = useState<string[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Test] ${message}`)
  }
  
  useEffect(() => {
    checkSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      log(`Auth event: ${event}`)
      if (session) {
        log(`Session detected for: ${session.user.email}`)
        setSession(session)
      } else {
        log('Session cleared')
        setSession(null)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const checkSession = async () => {
    log('Checking current session...')
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        log(`Session check error: ${error.message}`)
      } else if (session) {
        log(`Active session found: ${session.user.email}`)
        setSession(session)
      } else {
        log('No active session')
      }
    } catch (error) {
      log(`Error checking session: ${error}`)
    } finally {
      setLoading(false)
    }
  }
  
  const signInWithGoogle = async () => {
    log('Starting Google OAuth...')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        log(`OAuth error: ${error.message}`)
      } else {
        log('OAuth initiated, redirecting to Google...')
      }
    } catch (error) {
      log(`Sign in error: ${error}`)
    }
  }
  
  const signOut = async () => {
    log('Signing out...')
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        log(`Sign out error: ${error.message}`)
      } else {
        log('Signed out successfully')
      }
    } catch (error) {
      log(`Sign out error: ${error}`)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Simple OAuth Test</h1>
        
        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Signed In</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Provider:</strong> {session.user.app_metadata?.provider}</p>
              <p><strong>User ID:</strong> {session.user.id.substring(0, 8)}...</p>
            </div>
          ) : (
            <p className="text-gray-600">Not signed in</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {!session ? (
              <button
                onClick={signInWithGoogle}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                Sign in with Google
              </button>
            ) : (
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                Sign Out
              </button>
            )}
            <button
              onClick={checkSession}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              disabled={loading}
            >
              Check Session
            </button>
          </div>
        </div>
        
        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="py-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Click "Sign in with Google" to test OAuth flow</li>
            <li>Complete Google authentication</li>
            <li>You should be redirected back and see your session</li>
            <li>Check the logs for any errors</li>
            <li>Click "Sign Out" to clear the session</li>
          </ol>
        </div>
      </div>
    </div>
  )
}