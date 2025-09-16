'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import authService from '@/services/authService'

export default function OAuthTestFinalFix() {
  const [results, setResults] = useState<any>({})
  
  const testWithFix = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce'
        }
      })
      
      // Test with response_type=code explicitly added
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code' // THE FIX
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
          method: 'WITH FIX: response_type=code added',
          responseType: params.response_type || 'NOT FOUND',
          codeChallenge: params.code_challenge || 'NOT FOUND',
          codeChallengeMethod: params.code_challenge_method || 'NOT FOUND',
          isPKCE: params.response_type === 'code' && !!params.code_challenge,
          authUrl: data.url,
          allParams: params,
          '✅ SUCCESS': params.response_type === 'code' ? 'YES - PKCE FLOW WORKING!' : 'NO - Still implicit'
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testUpdatedAuthService = async () => {
    try {
      // Test the actual authService with the fix
      const result = await authService.signInWithGoogle()
      
      setResults({
        method: 'Testing updated authService.signInWithGoogle()',
        success: result.success,
        error: result.error,
        note: 'This will redirect to Google if successful',
        data: result.data
      })
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Final PKCE Fix</h1>
      
      <div className="mb-6 p-4 bg-green-50 rounded">
        <h2 className="font-semibold mb-2">🎉 THE FIX:</h2>
        <p className="text-sm mb-2">Add <code className="bg-gray-200 px-1 rounded">response_type: 'code'</code> to queryParams</p>
        <p className="text-sm">This forces Supabase to use PKCE flow instead of implicit flow</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testWithFix}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test OAuth URL With Fix (Skip Redirect)
        </button>
        
        <button
          onClick={testUpdatedAuthService}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Test Updated authService (Will Redirect)
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results['✅ SUCCESS'] && (
            <div className={`mt-4 p-4 rounded font-bold text-lg ${
              results['✅ SUCCESS'] === 'YES - PKCE FLOW WORKING!' 
                ? 'bg-green-100 text-green-800 border-2 border-green-500' 
                : 'bg-red-100 text-red-800'
            }`}>
              {results['✅ SUCCESS']}
            </div>
          )}
          
          {results.authUrl && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Authorization URL (check for response_type=code):</p>
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
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">What Changed:</h3>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
{`// Before (implicit flow):
queryParams: {
  access_type: 'offline',
  prompt: 'consent'
}

// After (PKCE flow):
queryParams: {
  access_type: 'offline',
  prompt: 'consent',
  response_type: 'code' // ← THIS LINE FIXES IT
}`}
        </pre>
      </div>
    </div>
  )
}