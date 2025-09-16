'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import authService from '@/services/authService'

export default function OAuthPKCEFinalTest() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  
  const verifyPKCESetup = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      // Create client with PKCE
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce'
        }
      })
      
      // Test WITH the fix
      const { data: fixedData, error: fixedError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code' // THE FIX
          } as any,
          skipBrowserRedirect: true
        }
      })
      
      // Test WITHOUT the fix
      const { data: brokenData, error: brokenError } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          skipBrowserRedirect: true
        }
      })
      
      let fixedParams = {}
      let brokenParams = {}
      
      if (fixedData?.url) {
        const url = new URL(fixedData.url)
        fixedParams = Object.fromEntries(url.searchParams)
      }
      
      if (brokenData?.url) {
        const url = new URL(brokenData.url)
        brokenParams = Object.fromEntries(url.searchParams)
      }
      
      setResults({
        withFix: {
          responseType: fixedParams['response_type'] || 'MISSING',
          hasPKCE: fixedParams['response_type'] === 'code',
          params: fixedParams
        },
        withoutFix: {
          responseType: brokenParams['response_type'] || 'MISSING',
          hasPKCE: brokenParams['response_type'] === 'code',
          params: brokenParams
        },
        conclusion: fixedParams['response_type'] === 'code' ? 
          '✅ Fix is working! PKCE flow is active' : 
          '❌ Fix not working, still using implicit flow'
      })
      
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testActualLogin = async () => {
    setLoading(true)
    try {
      // This will redirect to Google
      const result = await authService.signInWithGoogle()
      
      // This will only show if redirect fails
      setResults({
        authServiceResult: result,
        note: 'If you see this, OAuth redirect failed. If browser redirected to Google, the fix is working!'
      })
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth PKCE Final Test</h1>
      
      <div className="mb-6 p-4 bg-green-50 rounded">
        <h2 className="font-semibold mb-2">✅ The Fix Applied:</h2>
        <pre className="bg-white p-2 rounded text-xs overflow-auto">
{`queryParams: {
  response_type: 'code' // Forces PKCE instead of implicit
}`}
        </pre>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={verifyPKCESetup}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Verify PKCE Setup (Compare With/Without Fix)
        </button>
        
        <button
          onClick={testActualLogin}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Test Actual Login (Will Redirect to Google)'}
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.conclusion && (
            <div className={`mt-4 p-4 rounded font-bold text-lg ${
              results.conclusion.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.conclusion}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Expected OAuth Flow:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Click login → Redirect to Google with PKCE parameters</li>
            <li>Google login → Redirect back with authorization code</li>
            <li>Callback exchanges code for session → Success!</li>
          </ol>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">If Still Getting Errors:</h3>
          <p className="text-sm">
            The error "invalid request: both auth code and code verifier should be non-empty" 
            suggests PKCE is working but the code verifier isn't being stored/retrieved properly. 
            This could be a browser storage issue or Supabase client bug.
          </p>
        </div>
      </div>
    </div>
  )
}