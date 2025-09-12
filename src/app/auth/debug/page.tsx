'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log('[Auth Debug]', msg)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${msg}`])
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      addLog('Starting auth check...')
      
      // Get all cookies
      const allCookies: Record<string, string> = {}
      document.cookie.split(';').forEach(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=')
        if (name) {
          allCookies[name] = valueParts.join('=')
        }
      })
      setCookies(allCookies)
      addLog(`Found ${Object.keys(allCookies).length} cookies`)

      // Check for auth cookies specifically
      const authCookies = Object.keys(allCookies).filter(k => k.startsWith('sb-'))
      addLog(`Auth cookies: ${authCookies.join(', ') || 'none'}`)

      // Check session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        addLog(`Session error: ${error.message}`)
      } else if (session) {
        addLog(`Session found for: ${session.user.email}`)
        setSession(session)
      } else {
        addLog('No session found')
      }

      // Also check user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        addLog(`User found: ${user.email}`)
      } else {
        addLog('No user found')
      }
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const currentUrl = window.location.href
    addLog(`Current URL: ${currentUrl}`)
    addLog('Starting Google OAuth...')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/debug`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      addLog(`OAuth error: ${error.message}`)
    } else {
      addLog('Redirecting to OAuth provider...')
    }
  }

  const signOut = async () => {
    addLog('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out successfully')
      setSession(null)
      await checkAuth()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Current Status</h2>
        {loading ? (
          <p>Loading...</p>
        ) : session ? (
          <div className="space-y-1 text-sm">
            <p className="text-green-600 font-medium">✓ Authenticated</p>
            <p>Email: {session.user.email}</p>
            <p>Provider: {session.user.app_metadata?.provider}</p>
            <p>User ID: {session.user.id}</p>
          </div>
        ) : (
          <p className="text-red-600 font-medium">✗ Not authenticated</p>
        )}
      </div>

      <div className="mb-6 space-x-4">
        {!session ? (
          <button 
            onClick={signInWithGoogle}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        ) : (
          <button 
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        )}
        
        <button 
          onClick={checkAuth}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Refresh Status
        </button>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Cookies ({Object.keys(cookies).length})</h2>
        <div className="space-y-2 text-xs font-mono">
          {Object.entries(cookies).map(([name, value]) => (
            <div key={name} className={name.startsWith('sb-') ? 'text-blue-600' : ''}>
              <strong>{name}:</strong> {value.substring(0, 50)}...
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-900 text-gray-100">
        <h2 className="text-lg font-semibold mb-2 text-white">Debug Logs</h2>
        <div className="space-y-1 text-xs font-mono">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
        <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'SSR'}</p>
        <p>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'SSR'}</p>
      </div>
    </div>
  )
}