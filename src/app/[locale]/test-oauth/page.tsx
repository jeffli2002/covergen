'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestOAuth() {
  const [status, setStatus] = useState('Checking OAuth...')
  const [logs, setLogs] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`])
  }

  useEffect(() => {
    const checkOAuth = async () => {
      // Check for hash fragment with tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      if (accessToken) {
        addLog('OAuth tokens found in URL!')
        addLog(`Access token: ${accessToken.substring(0, 20)}...`)
        
        // Supabase should handle these automatically, but let's check the session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          addLog(`Session check error: ${error.message}`)
        } else if (session) {
          addLog(`Session found! User: ${session.user.email}`)
          setUser(session.user)
          setStatus(`Signed in as: ${session.user.email}`)
          
          // Clean up URL
          window.history.replaceState(null, '', window.location.pathname)
        } else {
          addLog('No session found despite tokens in URL')
        }
        
        return
      }
      
      // Check for code parameter (shouldn't happen with implicit flow)
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      addLog(`Page loaded with code: ${code ? 'YES' : 'NO'}`)
      
      if (!code) {
        // Check if already signed in
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          addLog(`Already signed in as: ${session.user.email}`)
          setUser(session.user)
          setStatus(`Signed in as: ${session.user.email}`)
        } else {
          setStatus('Not signed in')
        }
      }
    }

    checkOAuth()
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      addLog(`Auth state changed: ${event}`)
      if (session) {
        setUser(session.user)
        setStatus(`Signed in as: ${session.user.email}`)
      } else {
        setUser(null)
        setStatus('Not signed in')
      }
    })
    
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    addLog('Starting Google sign in...')
    
    try {
      if (!supabase) {
        addLog('ERROR: Supabase client is null!')
        return
      }
      
      const redirectTo = `${window.location.origin}/en/test-oauth`
      addLog(`Using redirect URL: ${redirectTo}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        }
      })

      if (error) {
        addLog(`Sign in error: ${error.message}`)
        addLog(`Error details: ${JSON.stringify(error)}`)
      } else {
        addLog('OAuth data received:')
        addLog(`- Provider: ${data?.provider}`)
        addLog(`- URL: ${data?.url}`)
        
        if (data?.url) {
          addLog('Redirecting to OAuth provider...')
        } else {
          addLog('ERROR: No OAuth URL returned!')
        }
      }
    } catch (err: any) {
      addLog(`Exception during sign in: ${err.message}`)
      addLog(`Stack: ${err.stack}`)
    }
  }
  
  const signOut = async () => {
    addLog('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out successfully')
      setUser(null)
      setStatus('Not signed in')
    }
  }
  
  const checkSupabaseConfig = async () => {
    addLog('Checking Supabase configuration...')
    addLog(`- Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    addLog(`- Supabase client exists: ${!!supabase}`)
    
    if (supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          addLog(`- Auth test error: ${error.message}`)
        } else {
          addLog(`- Auth test success, session: ${session ? 'EXISTS' : 'NULL'}`)
          if (session) {
            addLog(`- User: ${session.user.email}`)
            addLog(`- Provider: ${session.user.app_metadata?.provider}`)
            addLog(`- Expires at: ${new Date(session.expires_at! * 1000).toISOString()}`)
          } else {
            // Check if there's a user without session
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              addLog(`- User found without session: ${user.email}`)
            }
            
            // Check localStorage for tokens
            addLog('- Checking localStorage for auth tokens...')
            const keys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'))
            keys.forEach(key => {
              addLog(`  - Found: ${key.substring(0, 50)}...`)
            })
          }
        }
      } catch (err: any) {
        addLog(`- Auth test exception: ${err.message}`)
      }
    }
  }

  const quickDebug = () => {
    addLog('=== QUICK DEBUG ===')
    try {
      // Check cookies first (sync)
      addLog(`Cookies: ${document.cookie || 'NO COOKIES'}`)
      
      // Check localStorage (sync)
      const allKeys = Object.keys(localStorage)
      addLog(`Total localStorage keys: ${allKeys.length}`)
      
      const authKeys = allKeys.filter(k => k.includes('auth') || k.includes('sb-') || k.includes('supabase'))
      addLog(`Auth-related keys: ${authKeys.length}`)
      
      authKeys.forEach(k => {
        const val = localStorage.getItem(k)
        addLog(`- ${k}: ${val?.substring(0, 80)}...`)
      })
      
      // Try async session check
      addLog('Checking session...')
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          addLog(`Session error: ${error.message}`)
        } else {
          addLog(`Session exists: ${session ? 'YES' : 'NO'}`)
          if (session) {
            addLog(`User email: ${session.user.email}`)
            addLog(`Expires at: ${new Date(session.expires_at! * 1000).toLocaleString()}`)
          }
        }
      }).catch(err => {
        addLog(`Session check failed: ${err.message}`)
      })
      
    } catch (err: any) {
      addLog(`Debug error: ${err.message}`)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Test Page</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="font-semibold">Status: {status}</p>
        {user && (
          <div className="mt-2 text-sm">
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <p>Provider: {user.app_metadata?.provider}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {!user ? (
          <button 
            onClick={signInWithGoogle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
        ) : (
          <button 
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
        
        <button 
          onClick={checkSupabaseConfig}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Check Config
        </button>
        
        <button 
          onClick={quickDebug}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Quick Debug
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reload
        </button>
      </div>

      <div className="mb-4 p-4 bg-green-100 rounded">
        <p className="text-sm font-bold text-green-800">✅ OAuth is working!</p>
        <p className="text-sm text-green-700 mt-1">
          The fact that you see tokens in the URL means Google OAuth completed successfully.
          Now let's make sure the main app can use this session.
        </p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Logs:</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.includes('ERROR') ? 'text-red-400' : ''}`}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}