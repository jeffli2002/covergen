'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function TestOAuthDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [authUrl, setAuthUrl] = useState('')
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Debug] ${message}`)
  }
  
  useEffect(() => {
    // Check current session
    addLog('Checking initial session...')
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        addLog(`Session error: ${error.message}`)
      } else if (session) {
        addLog(`Session found: ${session.user.email}`)
        setSession(session)
      } else {
        addLog('No session found')
      }
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}`)
      if (session) {
        addLog(`New session: ${session.user.email}`)
        setSession(session)
      } else {
        addLog('Session cleared')
        setSession(null)
      }
    })
    
    // Check URL for OAuth params (only in browser)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('code')) {
        addLog(`OAuth code detected in URL: ${params.get('code')}`)
      }
      if (params.get('error')) {
        addLog(`OAuth error detected: ${params.get('error')}`)
      }
    }
    
    return () => subscription.unsubscribe()
  }, [])
  
  const handleGoogleSignIn = async () => {
    setLoading(true)
    addLog('Starting Google OAuth flow...')
    
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent('/test-oauth-debug')}`
        : `/auth/callback?next=${encodeURIComponent('/test-oauth-debug')}`
      addLog(`Redirect URL: ${redirectUrl}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) {
        addLog(`OAuth error: ${error.message}`)
      } else {
        addLog('OAuth initiated successfully')
        if (data.url) {
          setAuthUrl(data.url)
          addLog(`Auth URL: ${data.url}`)
          // Redirect happens automatically
        }
      }
    } catch (err: any) {
      addLog(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignOut = async () => {
    addLog('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out successfully')
    }
  }
  
  const clearLogs = () => setLogs([])
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Debug Page</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Current Session</h2>
        {session ? (
          <div>
            <p>Email: {session.user.email}</p>
            <p>Provider: {session.user.app_metadata?.provider}</p>
            <p>ID: {session.user.id}</p>
            <Button onClick={handleSignOut} className="mt-3">Sign Out</Button>
          </div>
        ) : (
          <div>
            <p>No active session</p>
            <Button onClick={handleGoogleSignIn} disabled={loading} className="mt-3">
              {loading ? 'Loading...' : 'Sign in with Google'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Configuration</h2>
        <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}
Auth Callback URL: ${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback
PKCE Callback URL: ${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback-pkce`}
        </pre>
        {authUrl && (
          <div className="mt-3">
            <p className="font-semibold">Last Auth URL:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto break-all">
              {authUrl}
            </pre>
          </div>
        )}
      </div>
      
      <div className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Debug Logs</h2>
          <Button onClick={clearLogs} variant="outline" size="sm">Clear</Button>
        </div>
        <div className="bg-gray-100 p-3 rounded max-h-96 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="text-xs font-mono mb-1">{log}</div>
            ))
          ) : (
            <p className="text-gray-500">No logs yet</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>This page helps debug OAuth authentication flow.</p>
        <p>Check the browser console for additional logs.</p>
      </div>
    </div>
  )
}