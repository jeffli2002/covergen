'use client'

import { useState } from 'react'
import { supabasePKCE } from '@/lib/supabase-pkce-fixed'

export default function TestOAuthCallback() {
  const [status, setStatus] = useState('')
  const [details, setDetails] = useState<any>({})

  const testOAuth = async () => {
    setStatus('Starting OAuth flow...')
    
    try {
      // Clear any existing session first
      await supabasePKCE.auth.signOut()
      
      // Check what redirect URL will be used
      const redirectTo = `${window.location.origin}/auth/callback?next=/test-oauth-callback`
      
      setDetails(prev => ({
        ...prev,
        expectedRedirect: redirectTo,
        origin: window.location.origin
      }))
      
      // Start OAuth with explicit redirect
      const { data, error } = await supabasePKCE.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        setStatus(`Error: ${error.message}`)
        setDetails(prev => ({ ...prev, error }))
        return
      }
      
      if (data?.url) {
        setStatus('Redirecting to Google...')
        setDetails(prev => ({ 
          ...prev, 
          oauthUrl: data.url,
          redirectUri: new URL(data.url).searchParams.get('redirect_uri')
        }))
        
        // Check PKCE verifier storage
        const verifierKeys = Object.keys(sessionStorage).filter(k => 
          k.includes('verifier') || k.includes('pkce')
        )
        setDetails(prev => ({ 
          ...prev, 
          verifierKeys,
          hasVerifier: verifierKeys.length > 0
        }))
      }
    } catch (err) {
      setStatus(`Exception: ${err instanceof Error ? err.message : 'Unknown'}`)
      setDetails(prev => ({ ...prev, exception: err }))
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Callback Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <p className="text-sm mb-2">
          This test verifies the OAuth flow is using the correct callback URL.
        </p>
        <p className="text-sm">
          Expected: {window.location.origin}/auth/callback
        </p>
      </div>
      
      <button
        onClick={testOAuth}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
      >
        Test OAuth Flow
      </button>
      
      {status && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <p className="font-semibold">{status}</p>
        </div>
      )}
      
      {Object.keys(details).length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Debug Details:</h3>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Required Supabase Configuration:</h3>
        <p className="text-sm mb-2">Add these URLs to your Supabase Dashboard → Authentication → URL Configuration:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>https://covergen.pro/auth/callback</li>
          <li>http://localhost:3000/auth/callback</li>
          <li>http://localhost:3001/auth/callback</li>
        </ul>
      </div>
    </div>
  )
}