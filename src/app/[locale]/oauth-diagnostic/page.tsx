'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-simple'

interface DiagnosticInfo {
  url?: {
    full: string
    origin: string
    pathname: string
    search: string
    hasAuthParams: boolean
    authParams: Record<string, string>
  }
  supabase?: {
    url: string | undefined
    sessionInfo: any
  }
  recommendations?: {
    siteUrl: string
    redirectUrl: string
    issue: string | null
  }
  oauthError?: string
}

export default function OAuthDiagnostic() {
  const [info, setInfo] = useState<DiagnosticInfo>({})
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const gatherInfo = async () => {
      // Get current URL components
      const currentUrl = window.location.href
      const origin = window.location.origin
      const pathname = window.location.pathname
      const search = window.location.search
      
      // Check for any auth-related params
      const params = new URLSearchParams(search)
      const authParams: any = {}
      params.forEach((value, key) => {
        if (key.includes('code') || key.includes('error') || key.includes('state')) {
          authParams[key] = value
        }
      })
      
      // Get current session
      let sessionInfo: any = {}
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        sessionInfo = {
          hasSession: !!session,
          error: error?.message,
          user: session?.user?.email
        }
      } catch (err: any) {
        sessionInfo = { error: err.message }
      }
      
      setInfo({
        url: {
          full: currentUrl,
          origin,
          pathname,
          search,
          hasAuthParams: Object.keys(authParams).length > 0,
          authParams
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          sessionInfo
        },
        recommendations: {
          siteUrl: origin,
          redirectUrl: `${origin}/auth/callback`,
          issue: !search.includes('code') ? 'No OAuth code in URL - check Supabase Site URL' : null
        }
      })
    }
    
    gatherInfo()
  }, [])
  
  const signInWithGoogle = async () => {
    console.log('[Diagnostic] Starting OAuth with simple redirect')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      }
    })
    
    if (error) {
      console.error('[Diagnostic] OAuth error:', error)
      setInfo(prev => ({ ...prev, oauthError: error.message }))
    } else {
      console.log('[Diagnostic] OAuth data:', data)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Diagnostic</h1>
      
      <div className="mb-6">
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Google OAuth
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Current State:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(info, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">Supabase Configuration:</h2>
          <p className="text-sm mb-2">In your Supabase Dashboard, ensure these settings:</p>
          
          <div className="bg-white p-3 rounded mb-2">
            <p className="font-semibold">Site URL (MUST be exact):</p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {mounted ? window.location.origin : 'Loading...'}
            </code>
          </div>
          
          <div className="bg-white p-3 rounded mb-2">
            <p className="font-semibold">Redirect URLs (add both):</p>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded block mb-1">
              {mounted ? `${window.location.origin}/auth/callback` : 'Loading...'}
            </code>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
              {mounted ? `${window.location.origin}/**` : 'Loading...'}
            </code>
          </div>
        </div>
        
        {!info.url?.search?.includes('code') && (
          <div className="p-4 bg-red-100 rounded">
            <h2 className="font-bold mb-2 text-red-700">Issue Detected:</h2>
            <p className="text-sm">
              No OAuth code in URL. This means Supabase is not redirecting back properly.
            </p>
            <p className="text-sm mt-2">
              Most likely cause: The Site URL in Supabase doesn't match this deployment URL.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}