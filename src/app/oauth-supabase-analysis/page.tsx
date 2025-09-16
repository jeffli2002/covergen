'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export default function OAuthSupabaseAnalysis() {
  const [results, setResults] = useState<any>({})
  const [authUrl, setAuthUrl] = useState<string>('')
  
  const analyzeCurrentSetup = async () => {
    try {
      // Test with current supabase client from /lib/supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        const params = Object.fromEntries(url.searchParams)
        
        setResults({
          method: 'Current /lib/supabase client',
          supabaseVersion: '@supabase/supabase-js v2.57.0',
          responseType: params.response_type || 'NOT FOUND',
          codeChallenge: params.code_challenge || 'NOT FOUND',
          codeChallengeMethod: params.code_challenge_method || 'NOT FOUND',
          redirectUri: decodeURIComponent(params.redirect_uri || ''),
          isPKCE: params.response_type === 'code' && !!params.code_challenge,
          allParams: params
        })
        setAuthUrl(data.url)
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testCorrectUsage = async () => {
    try {
      // Create a fresh client with explicit PKCE config
      const freshClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )
      
      // Use the exact pattern Supabase recommended
      const { data, error } = await freshClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://covergen.pro/auth/callback',
          // Note: flowType should be in the auth config, not here
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        const params = Object.fromEntries(url.searchParams)
        
        setResults({
          method: 'Fresh client with PKCE config (Supabase recommended pattern)',
          responseType: params.response_type || 'NOT FOUND',
          codeChallenge: params.code_challenge || 'NOT FOUND',
          codeChallengeMethod: params.code_challenge_method || 'NOT FOUND',
          redirectUri: decodeURIComponent(params.redirect_uri || ''),
          isPKCE: params.response_type === 'code' && !!params.code_challenge,
          allParams: params
        })
        setAuthUrl(data.url)
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const checkSupabaseInternals = () => {
    try {
      // Try to access internal auth config
      const authConfig = (supabase as any)?.auth?.options || {}
      const clientConfig = (supabase as any)?.options || {}
      
      setResults({
        method: 'Checking Supabase client internals',
        authConfig: JSON.stringify(authConfig),
        hasFlowType: 'flowType' in authConfig,
        flowTypeValue: authConfig.flowType,
        clientType: typeof supabase,
        clientKeys: Object.keys(supabase || {}),
        note: 'If flowType is not showing here, the client might not be properly configured'
      })
    } catch (err) {
      setResults({ error: 'Could not access Supabase internals' })
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Supabase Analysis</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-semibold mb-2">Based on Supabase Analysis:</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>PKCE flow should have: response_type=code</li>
          <li>PKCE flow should have: code_challenge and code_challenge_method=S256</li>
          <li>Implicit flow has: response_type=token or access_token in URL fragment</li>
          <li>Your supabase-js version: v2.57.0 (supports PKCE)</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={analyzeCurrentSetup}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Analyze Current Setup
        </button>
        
        <button
          onClick={testCorrectUsage}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Test Supabase Recommended Pattern
        </button>
        
        <button
          onClick={checkSupabaseInternals}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 w-full"
        >
          Check Supabase Client Internals
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Analysis Results:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.isPKCE !== undefined && (
            <div className={`mt-4 p-4 rounded font-bold ${results.isPKCE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.isPKCE ? '✅ USING PKCE FLOW' : '❌ NOT USING PKCE FLOW'}
              <div className="text-sm font-normal mt-2">
                {!results.isPKCE && (
                  <div>
                    Missing: {!results.responseType || results.responseType !== 'code' ? 'response_type=code' : ''} 
                    {!results.codeChallenge ? ', code_challenge' : ''}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {authUrl && (
            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <h4 className="font-semibold mb-2">Full Authorization URL:</h4>
              <div className="text-xs break-all bg-white p-2 rounded">
                {authUrl}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(authUrl)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Copy URL
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-purple-50 rounded">
        <h3 className="font-semibold mb-2">Current signInWithOAuth call in authService.ts:</h3>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
{`const { data, error } = await supabaseClient.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    skipBrowserRedirect: false
  }
})`}
        </pre>
      </div>
    </div>
  )
}