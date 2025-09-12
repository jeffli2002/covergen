'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function TestOAuthPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    checkDirectSession()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      addLog(`Auth state changed: ${event}`)
      if (session) {
        addLog(`Session active: ${session.user.email}`)
        setSessionData(session)
      } else {
        addLog('No session in auth state change')
        setSessionData(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkDirectSession = async () => {
    try {
      addLog('Checking session directly from Supabase...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`Session error: ${error.message}`)
        setError(error.message)
        return
      }

      if (session) {
        addLog(`Direct session found: ${session.user.email}`)
        setSessionData(session)
      } else {
        addLog('No direct session found')
      }
    } catch (err) {
      addLog(`Error checking session: ${err}`)
      setError(String(err))
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google OAuth...')
      setError(null)
      await signInWithGoogle()
      addLog('OAuth initiated via AuthContext')
    } catch (err) {
      addLog(`OAuth error: ${err}`)
      setError(String(err))
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">OAuth Test Page - Enhanced Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-semibold mb-2">AuthContext State:</h2>
            {loading ? (
              <p>Loading auth state...</p>
            ) : user ? (
              <div className="space-y-2">
                <p className="text-green-600">✓ Signed in via AuthContext</p>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Provider:</strong> {user.app_metadata?.provider || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Not signed in via AuthContext</p>
            )}
          </div>

          <div>
            <h2 className="font-semibold mb-2">Direct Supabase Session:</h2>
            {sessionData ? (
              <div className="space-y-2">
                <p className="text-green-600">✓ Direct session active</p>
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <p><strong>Email:</strong> {sessionData.user.email}</p>
                  <p><strong>Access Token:</strong> {sessionData.access_token.substring(0, 20)}...</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No direct session</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {user ? (
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          ) : (
            <Button onClick={handleGoogleSignIn} className="w-full">
              Sign in with Google
            </Button>
          )}
          <Button onClick={checkDirectSession} variant="secondary" className="w-full">
            Refresh Session Check
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Debug Logs:</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Environment Info:</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
        </div>
      </Card>
    </div>
  )
}