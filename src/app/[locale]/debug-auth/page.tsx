'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DebugAuthPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [environment, setEnvironment] = useState<any>({})

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    // Check environment
    setEnvironment({
      nodeEnv: process.env.NODE_ENV,
      url: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isProduction: process.env.NODE_ENV === 'production'
    })

    // Check session
    checkSession()
    
    // Check cookies
    updateCookies()
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      addLog(`Auth state changed: ${event}`)
      if (session) {
        addLog(`Session user: ${session.user.email}`)
      }
      checkSession()
      updateCookies()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    try {
      addLog('Checking session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`Session error: ${error.message}`)
      } else if (session) {
        addLog(`Session found: ${session.user.email}`)
        setSessionData({
          user: session.user.email,
          provider: session.user.app_metadata?.provider,
          expiresAt: new Date(session.expires_at! * 1000).toLocaleString(),
          hasAccessToken: !!session.access_token,
          hasRefreshToken: !!session.refresh_token
        })
      } else {
        addLog('No session found')
        setSessionData(null)
      }
    } catch (err) {
      addLog(`Error checking session: ${err}`)
    }
  }

  const updateCookies = () => {
    if (typeof window === 'undefined') return
    
    const allCookies = document.cookie.split(';').map(c => c.trim())
    setCookies(allCookies)
    
    const supabaseCookies = allCookies.filter(c => c.startsWith('sb-'))
    addLog(`Found ${supabaseCookies.length} Supabase cookies`)
  }

  const handleSignIn = async () => {
    try {
      addLog('Starting Google OAuth...')
      await signInWithGoogle()
      addLog('OAuth initiated')
    } catch (err) {
      addLog(`OAuth error: ${err}`)
    }
  }

  const clearAll = () => {
    // Clear localStorage
    localStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach(c => { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    addLog('Cleared all storage and cookies')
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="grid gap-6">
        {/* Environment Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            <p>Node Env: <span className={environment.isProduction ? 'text-red-600' : 'text-green-600'}>{environment.nodeEnv}</span></p>
            <p>URL: {environment.url}</p>
            <p>Origin: {environment.origin}</p>
            <p>Protocol: {environment.protocol}</p>
            <p>Supabase URL: {environment.supabaseUrl}</p>
          </div>
        </Card>

        {/* Auth State */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Auth State</h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">AuthContext:</p>
              <div className="bg-gray-100 p-3 rounded">
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
                <p>User: {user?.email || 'None'}</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium">Direct Session:</p>
              <div className="bg-gray-100 p-3 rounded">
                {sessionData ? (
                  <>
                    <p>User: {sessionData.user}</p>
                    <p>Provider: {sessionData.provider}</p>
                    <p>Expires: {sessionData.expiresAt}</p>
                    <p>Has Tokens: {sessionData.hasAccessToken && sessionData.hasRefreshToken ? 'Yes' : 'No'}</p>
                  </>
                ) : (
                  <p>No session</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Cookies */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cookies ({cookies.length} total)</h2>
          <div className="space-y-2">
            <p className="font-medium">Supabase Cookies:</p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-48 overflow-y-auto">
              {cookies.filter(c => c.startsWith('sb-')).map((cookie, i) => (
                <div key={i} className="text-green-400 mb-1">{cookie.split('=')[0]}</div>
              ))}
              {cookies.filter(c => c.startsWith('sb-')).length === 0 && (
                <p className="text-gray-400">No Supabase cookies found</p>
              )}
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex gap-4">
            {!user ? (
              <Button onClick={handleSignIn}>Sign in with Google</Button>
            ) : (
              <Button variant="outline">Already signed in</Button>
            )}
            <Button onClick={checkSession} variant="secondary">Refresh Session Check</Button>
            <Button onClick={clearAll} variant="destructive">Clear All & Reload</Button>
          </div>
        </Card>

        {/* Debug Logs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}