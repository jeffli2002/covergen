'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

export default function OAuthDebugCompletePage() {
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<any>({})
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry, data || '')
    setLogs(prev => [...prev, logEntry + (data ? ` - ${JSON.stringify(data)}` : '')])
  }

  // Check all cookies
  const checkCookies = () => {
    const allCookies: any = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name) {
        allCookies[name] = value ? decodeURIComponent(value) : ''
      }
    })
    setCookies(allCookies)
    log('Current cookies:', Object.keys(allCookies))
    
    // Check specifically for Supabase cookies
    const sbCookies = Object.keys(allCookies).filter(key => key.includes('sb-'))
    log(`Found ${sbCookies.length} Supabase cookies:`, sbCookies)
    
    return allCookies
  }

  // Check session with detailed logging
  const checkSession = async () => {
    log('=== Starting detailed session check ===')
    setLoading(true)
    
    try {
      const supabase = createSupabaseBrowser()
      log('Supabase client created')
      
      // First check cookies
      const currentCookies = checkCookies()
      
      // Get session
      log('Calling getSession()...')
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        log('getSession error:', error.message)
      } else if (session) {
        log('Session found!', {
          user: session.user.email,
          expires: new Date(session.expires_at! * 1000).toISOString(),
          provider: session.user.app_metadata?.provider
        })
        setSession(session)
      } else {
        log('No session found')
        setSession(null)
      }
      
      // Also check getUser
      log('Calling getUser()...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        log('getUser error:', userError.message)
      } else if (user) {
        log('User found via getUser:', user.email)
      } else {
        log('No user found via getUser')
      }
      
    } catch (err) {
      log('Unexpected error:', String(err))
    } finally {
      setLoading(false)
    }
  }

  // Start OAuth with maximum logging
  const startOAuth = async () => {
    log('=== Starting OAuth flow ===')
    
    try {
      const supabase = createSupabaseBrowser()
      const currentUrl = window.location.href
      const redirectTo = `${window.location.origin}/auth/callback-debug?next=${encodeURIComponent(currentUrl)}`
      
      log('OAuth config:', {
        provider: 'google',
        redirectTo,
        origin: window.location.origin,
        currentUrl
      })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        log('OAuth initiation error:', error.message)
      } else {
        log('OAuth initiated successfully', data)
      }
    } catch (err) {
      log('OAuth error:', String(err))
    }
  }

  // Clear everything
  const clearAll = async () => {
    log('Clearing all auth data...')
    
    try {
      const supabase = createSupabaseBrowser()
      await supabase.auth.signOut()
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=')
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        }
      })
      
      // Clear storage
      localStorage.clear()
      sessionStorage.clear()
      
      log('All auth data cleared')
      window.location.reload()
    } catch (err) {
      log('Clear error:', String(err))
    }
  }

  // Check on mount and set up listener
  useEffect(() => {
    log('=== Page loaded ===')
    checkSession()
    
    const supabase = createSupabaseBrowser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      log(`Auth state changed: ${event}`, session ? { user: session.user.email } : null)
      if (event === 'SIGNED_IN') {
        setSession(session)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])

  // Manual cookie check
  const manualCookieCheck = async () => {
    log('=== Manual cookie check ===')
    
    // Check cookies directly
    const allCookies = checkCookies()
    
    // Try to parse Supabase cookies manually
    Object.entries(allCookies).forEach(([name, value]) => {
      if (name.includes('sb-') && value) {
        try {
          const valueStr = String(value)
          const parts = valueStr.split('.')
          if (parts.length > 1) {
            const decoded = JSON.parse(atob(parts[1]))
            log(`Decoded ${name}:`, decoded)
          } else {
            log(`${name} doesn't appear to be a JWT`)
          }
        } catch (err) {
          log(`Could not decode ${name}`)
        }
      }
    })
    
    // Check server endpoint
    try {
      const response = await fetch('/api/check-session')
      const data = await response.json()
      log('Server session check:', data)
    } catch (err) {
      log('Server check error:', String(err))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete OAuth Debug</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Actions */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={checkSession}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Check Session
              </button>
              <button
                onClick={manualCookieCheck}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Manual Cookie Check
              </button>
              <button
                onClick={startOAuth}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Start OAuth
              </button>
              <button
                onClick={clearAll}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear All & Reload
              </button>
            </div>
          </div>

          {/* Current State */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Current State</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Session</h3>
                {session ? (
                  <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                    <p>User: {session.user.email}</p>
                    <p>Provider: {session.user.app_metadata?.provider}</p>
                    <p>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mt-2">No session</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700">Cookies ({Object.keys(cookies).length})</h3>
                <div className="mt-2 text-xs font-mono max-h-40 overflow-y-auto">
                  {Object.entries(cookies).map(([name, value]) => (
                    <div key={name} className={name.includes('sb-') ? 'text-blue-600' : 'text-gray-600'}>
                      {name}: {String(value).substring(0, 50)}...
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Environment */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
              <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]}...</p>
              <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-gray-900 text-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="font-mono text-xs max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Click actions above to start debugging.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="py-0.5 hover:bg-gray-800">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Testing Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>Click "Clear All & Reload" to start fresh</li>
            <li>Click "Check Session" to verify no existing session</li>
            <li>Click "Start OAuth" and complete Google sign-in</li>
            <li>When redirected back, immediately click "Check Session"</li>
            <li>If no session, click "Manual Cookie Check" for detailed diagnostics</li>
            <li>Share the complete logs for analysis</li>
          </ol>
        </div>
      </div>
    </div>
  )
}