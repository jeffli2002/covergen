'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthSimpleClient() {
  const [results, setResults] = useState<any>({})
  
  const testSimpleClient = async () => {
    try {
      // Create the simplest possible Supabase client with PKCE
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const simpleClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })
      
      // Test OAuth with this simple client
      const { data, error } = await simpleClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        setResults({ error: error.message })
        return
      }
      
      if (data?.url) {
        const url = new URL(data.url)
        const params = Object.fromEntries(url.searchParams)
        
        setResults({
          method: 'Simple @supabase/supabase-js client',
          library: '@supabase/supabase-js (no SSR)',
          responseType: params.response_type || 'NOT FOUND',
          codeChallenge: params.code_challenge || 'NOT FOUND',
          codeChallengeMethod: params.code_challenge_method || 'NOT FOUND',
          isPKCE: params.response_type === 'code' && !!params.code_challenge,
          authUrl: data.url,
          allParams: params
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const actualOAuthTest = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const simpleClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce'
        }
      })
      
      // Perform actual OAuth redirect
      const { data, error } = await simpleClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`
        }
      })
      
      if (error) {
        setResults({ error: error.message })
      } else {
        setResults({ 
          message: 'OAuth initiated, check if browser redirects to Google',
          data 
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple Supabase Client Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-semibold mb-2">Testing with @supabase/supabase-js directly</h2>
        <p className="text-sm">No @supabase/ssr, just the core library with PKCE configuration</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testSimpleClient}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test Simple Client (Skip Redirect)
        </button>
        
        <button
          onClick={actualOAuthTest}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Actual OAuth Test (Will Redirect)
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Results:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.isPKCE !== undefined && (
            <div className={`mt-4 p-4 rounded font-bold text-lg ${results.isPKCE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.isPKCE ? '✅ PKCE FLOW DETECTED' : '❌ IMPLICIT FLOW DETECTED'}
            </div>
          )}
          
          {results.authUrl && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Copy this URL to inspect:</p>
              <textarea
                readOnly
                value={results.authUrl}
                className="w-full p-2 border rounded text-xs"
                rows={4}
              />
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Key Differences:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Uses @supabase/supabase-js directly (not @supabase/ssr)</li>
          <li>Simple client creation with flowType: 'pkce'</li>
          <li>No complex cookie handling or SSR features</li>
        </ul>
      </div>
    </div>
  )
}