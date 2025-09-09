'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'
import { useAuth } from '@/contexts/AuthContext'

export default function TestSessionCheck() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()
  
  useEffect(() => {
    async function checkSession() {
      try {
        // Check session from supabase client directly
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // Also check the user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        // Check localStorage
        const storageKey = `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`
        const storedSession = localStorage.getItem(storageKey)
        
        // Check cookies
        const cookies = document.cookie.split(';').filter(c => 
          c.trim().startsWith('sb-') || c.includes('auth')
        )
        
        setSessionInfo({
          timestamp: new Date().toISOString(),
          supabaseSession: {
            exists: !!session,
            user: session?.user?.email || null,
            expiresAt: session?.expires_at,
            accessTokenLength: session?.access_token?.length || 0,
            error: error?.message
          },
          supabaseUser: {
            exists: !!user,
            email: user?.email || null,
            error: userError?.message
          },
          localStorage: {
            hasSession: !!storedSession,
            sessionLength: storedSession?.length || 0
          },
          cookies: cookies.map(c => {
            const [name] = c.trim().split('=')
            return name
          }),
          authContext: {
            user: user?.email || null,
            loading: authLoading,
            hasUser: !!user
          }
        })
      } catch (error: any) {
        setSessionInfo({
          error: error.message
        })
      } finally {
        setLoading(false)
      }
    }
    
    // Check immediately
    checkSession()
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Test Session] Auth state change:', event, !!session)
      checkSession()
    })
    
    // Check every 2 seconds for debugging
    const interval = setInterval(checkSession, 2000)
    
    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [user, authLoading])
  
  async function testServerEndpoint() {
    try {
      const response = await fetch('/api/auth/debug-session')
      const data = await response.json()
      alert('Server session info:\n' + JSON.stringify(data, null, 2))
    } catch (error: any) {
      alert('Error checking server session: ' + error.message)
    }
  }
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Debug Information</h1>
        
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Client-Side Session Info</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testServerEndpoint}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Check Server Session
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}