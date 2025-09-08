'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function TestOAuthSimple() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get current URL info
      const currentUrl = window.location.href
      const origin = window.location.origin
      
      console.log('[TestOAuth] Starting OAuth flow from:', currentUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: origin, // Just redirect to the base URL
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('[TestOAuth] OAuth error:', error)
        setError(error.message)
      } else {
        console.log('[TestOAuth] OAuth initiated:', data)
      }
    } catch (err: any) {
      console.error('[TestOAuth] Unexpected error:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Simple OAuth Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>Current URL:</strong></p>
        <p className="text-sm break-all">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        <p className="mt-2"><strong>Site URL should be:</strong></p>
        <p className="text-sm">{typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</p>
      </div>

      <button
        onClick={testGoogleLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h2 className="font-bold mb-2">OAuth Flow:</h2>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Click "Sign in with Google"</li>
          <li>Authenticate with Google</li>
          <li>Google redirects to Supabase Site URL with code</li>
          <li>OAuthCodeHandler in layout detects code</li>
          <li>Code is exchanged for session</li>
        </ol>
      </div>
    </div>
  )
}