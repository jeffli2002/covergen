'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export function PKCEDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    const checkPKCE = async () => {
      try {
        // Check if PKCE verifier is stored
        const storage = window.localStorage
        const keys = Object.keys(storage)
        const supabaseKeys = keys.filter(k => k.includes('supabase'))
        
        let pkceInfo: any = {}
        supabaseKeys.forEach(key => {
          const value = storage.getItem(key)
          if (value && (value.includes('code_verifier') || value.includes('pkce'))) {
            try {
              const parsed = JSON.parse(value)
              pkceInfo[key] = parsed
            } catch {
              pkceInfo[key] = value
            }
          }
        })
        
        // Check session storage too
        const sessionKeys = Object.keys(window.sessionStorage)
        const sessionSupabaseKeys = sessionKeys.filter(k => k.includes('supabase'))
        
        let sessionPkceInfo: any = {}
        sessionSupabaseKeys.forEach(key => {
          const value = window.sessionStorage.getItem(key)
          if (value && (value.includes('code_verifier') || value.includes('pkce'))) {
            try {
              const parsed = JSON.parse(value)
              sessionPkceInfo[key] = parsed
            } catch {
              sessionPkceInfo[key] = value
            }
          }
        })
        
        // Check current URL
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        
        // Check current session
        const { data: { session } } = await supabase.auth.getSession()
        
        setDebugInfo({
          localStorage: pkceInfo,
          sessionStorage: sessionPkceInfo,
          urlParams: {
            code: code ? `${code.substring(0, 10)}...` : null,
            error,
            hasHash: window.location.hash.length > 1
          },
          hasSession: !!session,
          sessionEmail: session?.user?.email,
          supabaseConfig: {
            detectSessionInUrl: true,
            flowType: 'pkce'
          }
        })
      } catch (error) {
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    checkPKCE()
    
    // Re-check when URL changes
    const interval = setInterval(checkPKCE, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md rounded-lg bg-gray-900 p-4 text-xs text-white shadow-lg">
      <h3 className="mb-2 font-bold">PKCE Debug Info</h3>
      <pre className="overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  )
}