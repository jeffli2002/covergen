'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function OAuthDebugVercel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOAuthFlow = async () => {
    setLoading(true)
    try {
      const supabase = supabase
      const currentPath = window.location.pathname
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      
      console.log('[OAuth Debug] Starting OAuth with:', {
        currentPath,
        redirectUrl,
        origin: window.location.origin,
        hostname: window.location.hostname,
        isVercelPreview: window.location.hostname.includes('vercel.app')
      })
      
      setDebugInfo({
        step: 'Initiating OAuth',
        currentPath,
        redirectUrl,
        origin: window.location.origin,
        hostname: window.location.hostname,
        isVercelPreview: window.location.hostname.includes('vercel.app'),
        timestamp: new Date().toISOString()
      })

      // Don't actually start OAuth, just prepare it
      console.log('[OAuth Debug] Would call signInWithOAuth with redirectUrl:', redirectUrl)
      
      setDebugInfo((prev: any) => ({
        ...prev,
        step: 'OAuth prepared (not executed)',
        wouldRedirectTo: redirectUrl
      }))
      
    } catch (error: any) {
      console.error('[OAuth Debug] Error:', error)
      setDebugInfo({
        step: 'Error',
        error: error.message,
        stack: error.stack
      })
    }
    setLoading(false)
  }

  const actualOAuthTest = async () => {
    setLoading(true)
    try {
      const supabase = supabase
      const currentPath = window.location.pathname
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
      
      console.log('[OAuth Debug] Actually starting OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      })

      if (error) {
        setDebugInfo({
          step: 'OAuth Error',
          error: error.message,
          errorCode: error.status
        })
      } else {
        setDebugInfo({
          step: 'OAuth Initiated',
          data,
          redirectUrl
        })
      }
    } catch (error: any) {
      setDebugInfo({
        step: 'Exception',
        error: error.message
      })
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Vercel Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Environment Info</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
{JSON.stringify({
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  origin: typeof window !== 'undefined' ? window.location.origin : 'server',
  href: typeof window !== 'undefined' ? window.location.href : 'server',
  isVercelPreview: typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false,
  cookies: typeof document !== 'undefined' ? document.cookie.substring(0, 200) + '...' : 'server'
}, null, 2)}
        </pre>
      </div>

      <div className="mb-6 space-x-4">
        <button 
          onClick={testOAuthFlow}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test OAuth Setup (No Redirect)
        </button>
        <button 
          onClick={actualOAuthTest}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Actually Start OAuth
        </button>
      </div>

      {debugInfo && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}