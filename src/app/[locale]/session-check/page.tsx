'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function SessionCheckPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function checkSession() {
      try {
        console.log('[SessionCheck] Starting session check...')
        setSessionInfo({ status: 'Starting check...' })
        
        const supabaseClient = supabase
        console.log('[SessionCheck] Supabase client created')
      
      // Try different methods to get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check auth state
      const { data: authState } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        console.log('[SessionCheck] Auth state change:', event, session?.user?.email)
      })
      
      const info = {
        timestamp: new Date().toISOString(),
        session: {
          exists: !!session,
          user: session?.user?.email,
          userId: session?.user?.id,
          expiresAt: session?.expires_at,
          provider: session?.user?.app_metadata?.provider
        },
        user: {
          exists: !!user,
          email: user?.email,
          id: user?.id
        },
        errors: {
          sessionError: sessionError?.message || null,
          userError: userError?.message || null
        },
        cookies: document.cookie.split('; ').filter(c => c.includes('sb-') || c.includes('auth')),
        localStorage: Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'))
      }
      
      console.log('[SessionCheck] Results:', info)
      setSessionInfo(info)
      setLoading(false)
      
      // Cleanup
      authState.subscription.unsubscribe()
      } catch (err) {
        console.error('[SessionCheck] Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }
    
    checkSession()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Check</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      {loading ? (
        <p>Checking session...</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      )}
      <div className="mt-4 text-sm text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  )
}