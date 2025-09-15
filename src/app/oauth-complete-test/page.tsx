'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function OAuthCompleteTest() {
  const { user: authUser, loading: authLoading } = useAuth()
  const [directUser, setDirectUser] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<string[]>([])
  const [storage, setStorage] = useState<any>({})

  const addLog = (message: string) => {
    console.log(`[OAuth Test] ${message}`)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  // Check everything on mount and whenever auth state changes
  useEffect(() => {
    checkEverything()
  }, [authUser, authLoading])

  const checkEverything = async () => {
    addLog('=== Starting complete check ===')
    
    // 1. Check AuthContext state
    addLog(`AuthContext: loading=${authLoading}, user=${authUser?.email || 'null'}`)
    
    // 2. Check direct Supabase session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Direct session error: ${error.message}`)
      } else {
        addLog(`Direct session: ${session ? session.user.email : 'null'}`)
        setDirectUser(session?.user || null)
      }
    } catch (e: any) {
      addLog(`Exception checking session: ${e.message}`)
    }
    
    // 3. Check all cookies
    const allCookies = document.cookie.split(';').map(c => c.trim())
    setCookies(allCookies)
    
    const authCookies = allCookies.filter(c => 
      c.startsWith('sb-') || c.includes('auth') || c.includes('oauth')
    )
    addLog(`Found ${authCookies.length} auth-related cookies:`)
    authCookies.forEach(c => {
      const [name, value] = c.split('=')
      addLog(`  ${name}: ${value ? value.substring(0, 50) + '...' : 'empty'}`)
    })
    
    // 4. Check localStorage
    const localStorageData: any = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        const value = localStorage.getItem(key)
        localStorageData[key] = value ? JSON.parse(value) : null
        addLog(`LocalStorage ${key}: ${JSON.stringify(localStorageData[key]).substring(0, 100)}...`)
      }
    }
    setStorage(localStorageData)
    
    // 5. Check for OAuth callback flag
    const hasOAuthFlag = allCookies.some(c => c.startsWith('oauth-callback-success='))
    addLog(`OAuth callback flag present: ${hasOAuthFlag}`)
    
    // 6. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}, user: ${session?.user?.email || 'null'}`)
    })
    
    // Cleanup
    return () => {
      subscription.unsubscribe()
    }
  }

  const testOAuth = async () => {
    addLog('Starting OAuth flow...')
    const redirectUrl = `${window.location.origin}/auth/callback?next=/oauth-complete-test`
    addLog(`Redirect URL: ${redirectUrl}`)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      addLog(`OAuth error: ${error.message}`)
    } else {
      addLog('OAuth started successfully')
    }
  }

  const clearEverything = () => {
    // Clear all cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.trim().split("=")[0] + "=;expires=" + new Date(0).toUTCString() + ";path=/"
    })
    
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Reload
    window.location.reload()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Complete Test</h1>
      
      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-semibold">AuthContext State</h3>
          <p>Loading: {String(authLoading)}</p>
          <p>User: {authUser?.email || 'null'}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-semibold">Direct Supabase</h3>
          <p>User: {directUser?.email || 'null'}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={checkEverything}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Check Everything
        </button>
        
        <button
          onClick={testOAuth}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Start OAuth
        </button>
        
        <button
          onClick={clearEverything}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear & Reload
        </button>
      </div>
      
      {/* Cookies */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Cookies ({cookies.length})</h3>
        <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-40 overflow-auto">
          {cookies.map((c, i) => (
            <div key={i} className={c.includes('sb-') || c.includes('auth') ? 'text-blue-600' : ''}>
              {c}
            </div>
          ))}
        </div>
      </div>
      
      {/* Storage */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Storage</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
          {JSON.stringify(storage, null, 2)}
        </pre>
      </div>
      
      {/* Logs */}
      <div>
        <h3 className="font-semibold mb-2">Debug Logs</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}