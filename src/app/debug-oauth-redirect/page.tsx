'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DebugOAuthRedirect() {
  const [results, setResults] = useState<any[]>([])

  const testRedirectConfigs = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const configs = [
      {
        name: 'With explicit callback',
        redirectTo: `${window.location.origin}/auth/callback`
      },
      {
        name: 'With callback and next param',
        redirectTo: `${window.location.origin}/auth/callback?next=/test`
      },
      {
        name: 'With PKCE response_type',
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { response_type: 'code' }
      }
    ]
    
    const testResults = []
    
    for (const config of configs) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: config.redirectTo,
          queryParams: config.queryParams,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        
        testResults.push({
          config: config.name,
          redirectTo: config.redirectTo,
          actualRedirectUri: redirectUri,
          fullUrl: data.url,
          matches: redirectUri === config.redirectTo
        })
      } else {
        testResults.push({
          config: config.name,
          error: error?.message || 'No URL returned'
        })
      }
    }
    
    setResults(testResults)
  }

  const testActualFlow = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    )
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          response_type: 'code' // Force PKCE flow
        } as any
      }
    })
    
    if (error) {
      console.error('OAuth error:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Redirect Debug</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testRedirectConfigs}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 block"
        >
          Test Different Redirect Configurations
        </button>
        
        <button
          onClick={testActualFlow}
          className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 block"
        >
          Test Actual OAuth Flow
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results:</h2>
          {results.map((result, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">{result.config}</h3>
              <div className="text-sm space-y-1">
                <p><strong>Requested:</strong> {result.redirectTo}</p>
                <p><strong>Actual redirect_uri:</strong> {result.actualRedirectUri}</p>
                <p className={`font-bold ${result.matches ? 'text-green-600' : 'text-red-600'}`}>
                  {result.matches ? '✅ Matches!' : '❌ Does not match'}
                </p>
                {result.error && <p className="text-red-600">Error: {result.error}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">Debugging Info:</h3>
        <p className="text-sm mb-2">If redirect_uri doesn't match what we request:</p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Check Supabase Dashboard → Authentication → URL Configuration</li>
          <li>The "Site URL" setting might be overriding our redirectTo</li>
          <li>Ensure callback URLs are in the allowed list</li>
          <li>Try using response_type: 'code' to force PKCE flow</li>
        </ul>
      </div>
    </div>
  )
}