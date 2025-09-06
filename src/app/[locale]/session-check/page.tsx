'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SessionCheckPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function checkSession() {
      console.log('[SessionCheck] Starting session check...')
      
      const supabase = createClient()
      
      // Try different methods to get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check auth state
      const { data: authState } = supabase.auth.onAuthStateChange((event, session) => {
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
    }
    
    checkSession()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Check</h1>
      {loading ? (
        <p>Checking session...</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      )}
    </div>
  )
}