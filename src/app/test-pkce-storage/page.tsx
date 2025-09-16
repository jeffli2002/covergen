'use client'

import { useState } from 'react'
import { supabasePKCE } from '@/lib/supabase-pkce-fixed'
import { supabase } from '@/lib/supabase'

export default function TestPKCEStorage() {
  const [results, setResults] = useState<any>({})
  
  const testOriginalClient = async () => {
    try {
      // Clear storage
      sessionStorage.clear()
      
      // Test with original client
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code'
          } as any,
          skipBrowserRedirect: true
        }
      })
      
      // Check what was stored
      const storageAfter = {
        sessionStorage: {} as any,
        localStorage: {} as any
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          storageAfter.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }
      
      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase')) {
          const value = localStorage.getItem(key)
          storageAfter.localStorage[key] = value ? value.substring(0, 100) + '...' : null
        }
      }
      
      setResults({
        client: 'Original /lib/supabase',
        error: error?.message,
        oauthUrl: data?.url,
        storageAfter,
        hasPKCEVerifier: Object.keys(storageAfter.sessionStorage).some(k => k.includes('verifier'))
      })
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const testFixedClient = async () => {
    try {
      // Clear storage
      sessionStorage.clear()
      
      // Test with fixed client
      const { data, error } = await supabasePKCE.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code'
          } as any,
          skipBrowserRedirect: true
        }
      })
      
      // Check what was stored
      const storageAfter = {
        sessionStorage: {} as any,
        localStorage: {} as any
      }
      
      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) {
          storageAfter.sessionStorage[key] = sessionStorage.getItem(key)
        }
      }
      
      setResults({
        client: 'Fixed supabase-pkce-fixed',
        error: error?.message,
        oauthUrl: data?.url,
        storageAfter,
        hasPKCEVerifier: Object.keys(storageAfter.sessionStorage).some(k => k.includes('verifier'))
      })
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  const actualOAuthTest = async () => {
    try {
      // Clear storage and use fixed client
      sessionStorage.clear()
      
      const { data, error } = await supabasePKCE.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code'
          } as any
        }
      })
      
      if (error) {
        setResults({ error: error.message })
      } else {
        setResults({ message: 'Redirecting to Google...', data })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test PKCE Storage Fix</h1>
      
      <div className="mb-6 p-4 bg-red-50 rounded">
        <h2 className="font-semibold mb-2">The Problem:</h2>
        <p className="text-sm">PKCE code verifier is not being stored in sessionStorage</p>
        <p className="text-sm">This causes "both auth code and code verifier should be non-empty" error</p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={testOriginalClient}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 w-full"
        >
          Test Original Client (Should Fail)
        </button>
        
        <button
          onClick={testFixedClient}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test Fixed Client with Custom Storage
        </button>
        
        <button
          onClick={actualOAuthTest}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Actual OAuth with Fixed Client (Will Redirect)
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
          
          {results.hasPKCEVerifier !== undefined && (
            <div className={`mt-4 p-4 rounded font-bold ${
              results.hasPKCEVerifier ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.hasPKCEVerifier ? '✅ PKCE Verifier Stored!' : '❌ No PKCE Verifier Found'}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">What This Tests:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Whether PKCE code verifier is properly stored in sessionStorage</li>
          <li>Custom storage implementation to ensure verifier persistence</li>
          <li>Comparison between original and fixed Supabase clients</li>
        </ul>
      </div>
    </div>
  )
}