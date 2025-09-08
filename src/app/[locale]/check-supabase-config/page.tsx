'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function CheckSupabaseConfig() {
  const [results, setResults] = useState<any>({})
  
  const runChecks = async () => {
    const checks: any = {}
    
    // 1. Check environment variables
    checks.env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      currentOrigin: window.location.origin,
      currentHost: window.location.host
    }
    
    // 2. Check if Supabase client is configured
    checks.client = {
      hasClient: !!supabase,
      authConfig: {
        detectSessionInUrl: true,
        flowType: 'pkce',
        persistSession: true
      }
    }
    
    // 3. Try a test OAuth call to see the redirect URL
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true // Don't actually redirect
        }
      })
      
      checks.oauth = {
        url: data?.url,
        provider: data?.provider,
        error: error?.message
      }
    } catch (err: any) {
      checks.oauth = { error: err.message }
    }
    
    // 4. Check current session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      checks.session = {
        hasSession: !!session,
        error: error?.message
      }
    } catch (err: any) {
      checks.session = { error: err.message }
    }
    
    setResults(checks)
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Configuration Check</h1>
      
      <button
        onClick={runChecks}
        className="mb-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Run Configuration Checks
      </button>
      
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
          
          <div className="p-4 bg-yellow-100 rounded">
            <h2 className="font-bold mb-2">OAuth URL Analysis:</h2>
            {results.oauth?.url && (
              <div className="text-sm">
                <p className="font-semibold">Generated OAuth URL:</p>
                <p className="text-xs break-all bg-white p-2 rounded mt-1">
                  {results.oauth.url}
                </p>
                
                <p className="mt-2">Check if this URL contains:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>redirect_uri parameter</li>
                  <li>Your Supabase project URL</li>
                  <li>response_type=code</li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="font-bold mb-2">Expected Configuration:</h2>
            <p className="text-sm">
              <strong>Supabase Site URL should be:</strong><br/>
              <code className="bg-white px-2 py-1 rounded">{results.env?.currentOrigin}</code>
            </p>
            <p className="text-sm mt-2">
              <strong>Supabase URL should be:</strong><br/>
              <code className="bg-white px-2 py-1 rounded">{results.env?.NEXT_PUBLIC_SUPABASE_URL}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}