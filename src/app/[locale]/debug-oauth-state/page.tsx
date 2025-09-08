'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase-simple'
import { useSearchParams } from 'next/navigation'

function DebugOAuthStateInner() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<any>({})
  
  useEffect(() => {
    const checkState = async () => {
      // Get URL params
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      setState({
        url: window.location.href,
        hasCode: !!code,
        codePrefix: code?.substring(0, 10),
        hasError: !!error,
        errorMessage: error,
        hasSession: !!session,
        sessionUser: session?.user?.email,
        sessionExpiry: session?.expires_at,
        hasUser: !!user,
        userEmail: user?.email,
        userProvider: user?.app_metadata?.provider,
        sessionError: sessionError?.message,
        userError: userError?.message,
        timestamp: new Date().toISOString()
      })
    }
    
    checkState()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Debug] Auth state changed:', event)
      checkState()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [searchParams])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Debug State</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 space-y-2">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh Page
        </button>
        
        {state.hasCode && (
          <p className="text-green-600 font-semibold">
            ✓ OAuth code detected! Handler should process it automatically.
          </p>
        )}
        
        {state.hasSession && (
          <p className="text-green-600 font-semibold">
            ✓ Authenticated as: {state.sessionUser}
          </p>
        )}
      </div>
    </div>
  )
}

export default function DebugOAuthState() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DebugOAuthStateInner />
    </Suspense>
  )
}