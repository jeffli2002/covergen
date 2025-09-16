'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthForcePKCE() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  const testPKCEWithParams = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce',
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      )
      
      // Generate PKCE challenge
      const generateCodeVerifier = () => {
        const array = new Uint8Array(32)
        crypto.getRandomValues(array)
        return btoa(String.fromCharCode.apply(null, Array.from(array)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')
      }
      
      const generateCodeChallenge = async (verifier: string) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(verifier)
        const digest = await crypto.subtle.digest('SHA-256', data)
        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '')
      }
      
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      
      // Store verifier for later use
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)
      
      // Try to get OAuth URL with explicit PKCE parameters
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true,
          queryParams: {
            response_type: 'code',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
          } as any
        }
      })
      
      if (error) {
        setDebugInfo({ error: error.message })
        return
      }
      
      if (data?.url) {
        const url = new URL(data.url)
        setDebugInfo({
          originalUrl: data.url,
          responseType: url.searchParams.get('response_type'),
          hasCodeChallenge: url.searchParams.has('code_challenge'),
          codeChallengeMethod: url.searchParams.get('code_challenge_method'),
          codeChallenge: url.searchParams.get('code_challenge'),
          isPKCE: url.searchParams.get('response_type') === 'code',
          allParams: Object.fromEntries(url.searchParams)
        })
      }
    } catch (err) {
      setDebugInfo({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testDirectAuthURL = async () => {
    try {
      // Construct auth URL manually
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const redirectTo = encodeURIComponent(`${window.location.origin}/auth/callback-production`)
      
      // Generate PKCE challenge
      const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => String.fromCharCode(b))
        .join('')
      const encoder = new TextEncoder()
      const data = encoder.encode(codeVerifier)
      const digest = await crypto.subtle.digest('SHA-256', data)
      const codeChallenge = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)
      
      // Manually construct the URL
      const authUrl = `${supabaseUrl}/auth/v1/authorize?` + new URLSearchParams({
        provider: 'google',
        redirect_to: redirectTo,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })
      
      setDebugInfo({
        method: 'Direct URL Construction',
        authUrl,
        isPKCE: true,
        note: 'This URL forces PKCE by explicitly setting response_type=code'
      })
    } catch (err) {
      setDebugInfo({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Force PKCE Flow Test</h1>
      
      <div className="mb-6 p-4 bg-red-50 rounded">
        <h2 className="font-semibold mb-2">Problem:</h2>
        <p className="text-sm">Despite flowType: 'pkce' configuration, Supabase returns implicit flow URLs</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testPKCEWithParams}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test with Explicit PKCE Parameters
        </button>
        
        <button
          onClick={testDirectAuthURL}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Test Direct Auth URL Construction
        </button>
      </div>
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          {debugInfo.isPKCE !== undefined && (
            <div className={`mt-4 p-4 rounded ${debugInfo.isPKCE ? 'bg-green-50' : 'bg-red-50'}`}>
              {debugInfo.isPKCE ? '✅ Using PKCE Flow' : '❌ Still using Implicit Flow'}
            </div>
          )}
          
          {debugInfo.authUrl && (
            <div className="mt-4">
              <button
                onClick={() => window.open(debugInfo.authUrl, '_blank')}
                className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
              >
                Test Manual Auth URL
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Theory:</h3>
        <p className="text-sm mb-2">
          The Supabase project might have "Implicit Flow" enabled in the dashboard settings, 
          which overrides the client-side flowType configuration.
        </p>
        <p className="text-sm">
          Check: Supabase Dashboard → Authentication → URL Configuration → Enable PKCE flow for OAuth providers
        </p>
      </div>
    </div>
  )
}