'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export default function OAuthClientTest() {
  const [results, setResults] = useState<any>({})
  
  const testSSRClient = async () => {
    try {
      const supabase = createBrowserClient(
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        setResults({
          client: '@supabase/ssr',
          responseType: url.searchParams.get('response_type'),
          hasCodeChallenge: url.searchParams.has('code_challenge'),
          isPKCE: url.searchParams.get('response_type') === 'code'
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testRegularClient = async () => {
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        setResults({
          client: '@supabase/supabase-js',
          responseType: url.searchParams.get('response_type'),
          hasCodeChallenge: url.searchParams.has('code_challenge'),
          isPKCE: url.searchParams.get('response_type') === 'code'
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testWithoutFlowType = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        // No auth config at all
      )
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        setResults({
          client: 'No flowType specified',
          responseType: url.searchParams.get('response_type'),
          hasCodeChallenge: url.searchParams.has('code_challenge'),
          isPKCE: url.searchParams.get('response_type') === 'code'
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Client Library Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <p className="text-sm">Testing different Supabase client libraries to see which one properly uses PKCE flow.</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testSSRClient}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test @supabase/ssr Client (Current)
        </button>
        
        <button
          onClick={testRegularClient}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Test @supabase/supabase-js Client
        </button>
        
        <button
          onClick={testWithoutFlowType}
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 w-full"
        >
          Test Without flowType Config
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.isPKCE !== undefined && (
            <div className={`mt-2 p-2 rounded ${results.isPKCE ? 'bg-green-200' : 'bg-red-200'}`}>
              {results.isPKCE ? '✅ Using PKCE Flow' : '❌ Using Implicit Flow'}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Note:</h3>
        <p className="text-sm">The default flow type in Supabase JS v2 should be PKCE, but something is forcing implicit flow.</p>
      </div>
    </div>
  )
}