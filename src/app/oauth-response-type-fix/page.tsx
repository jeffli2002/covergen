'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthResponseTypeFix() {
  const [results, setResults] = useState<any>({})
  
  const testWithResponseType = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce'
        }
      })
      
      // Add response_type=code explicitly
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code' // FORCE response_type=code
          } as any,
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
          method: 'With explicit response_type=code',
          responseType: params.response_type || 'NOT FOUND',
          codeChallenge: params.code_challenge || 'NOT FOUND',
          codeChallengeMethod: params.code_challenge_method || 'NOT FOUND',
          isPKCE: params.response_type === 'code' && !!params.code_challenge,
          authUrl: data.url,
          allParams: params,
          SUCCESS: params.response_type === 'code' ? 'YES - PKCE FLOW!' : 'NO - Still implicit'
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const updateAuthService = async () => {
    setResults({
      instructions: [
        "Update authService.ts signInWithGoogle method:",
        "",
        "const { data, error } = await supabaseClient.auth.signInWithOAuth({",
        "  provider: 'google',",
        "  options: {",
        "    redirectTo: redirectUrl,",
        "    queryParams: {",
        "      access_type: 'offline',",
        "      prompt: 'consent',",
        "      response_type: 'code' // ADD THIS LINE",
        "    },",
        "    skipBrowserRedirect: false",
        "  }",
        "})"
      ].join('\n')
    })
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Response Type Fix</h1>
      
      <div className="mb-6 p-4 bg-red-50 rounded">
        <h2 className="font-semibold mb-2">THE ISSUE:</h2>
        <p className="text-sm">The authorization URL is missing <code className="bg-gray-200 px-1">response_type=code</code></p>
        <p className="text-sm mt-1">This causes Supabase to fall back to implicit flow</p>
      </div>
      
      <div className="mb-6 p-4 bg-green-50 rounded">
        <h2 className="font-semibold mb-2">THE FIX:</h2>
        <p className="text-sm">Add <code className="bg-gray-200 px-1">response_type: 'code'</code> to queryParams</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testWithResponseType}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test With response_type=code
        </button>
        
        <button
          onClick={updateAuthService}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Show authService.ts Update
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {typeof results.instructions === 'string' ? results.instructions : JSON.stringify(results, null, 2)}
          </pre>
          
          {results.SUCCESS && (
            <div className={`mt-4 p-4 rounded font-bold text-lg ${results.SUCCESS === 'YES - PKCE FLOW!' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.SUCCESS}
            </div>
          )}
        </div>
      )}
    </div>
  )
}