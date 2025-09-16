'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function DebugPKCEVerifier() {
  const [info, setInfo] = useState<any>({})
  
  useEffect(() => {
    // Check what's in session storage
    const keys = Object.keys(sessionStorage)
    const pkceData: any = {}
    
    keys.forEach(key => {
      if (key.includes('pkce') || key.includes('verifier') || key.includes('auth')) {
        pkceData[key] = sessionStorage.getItem(key)
      }
    })
    
    // Check localStorage too
    const localKeys = Object.keys(localStorage)
    const localAuthData: any = {}
    
    localKeys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('auth')) {
        const value = localStorage.getItem(key)
        localAuthData[key] = value ? `${value.substring(0, 50)}...` : null
      }
    })
    
    setInfo({
      sessionStorage: pkceData,
      localStorage: localAuthData,
      sessionStorageKeys: keys,
      localStorageKeys: localKeys.filter(k => k.startsWith('sb-'))
    })
  }, [])
  
  const testPKCEFlow = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            debug: true // Enable debug mode
          }
        }
      )
      
      // Clear any existing PKCE data
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.includes('pkce') || key.includes('verifier')) {
          sessionStorage.removeItem(key)
        }
      })
      
      console.log('[PKCE Debug] Starting OAuth flow...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            response_type: 'code',
            access_type: 'offline',
            prompt: 'consent'
          } as any
        }
      })
      
      if (error) {
        setInfo((prev: any) => ({ ...prev, error: error.message }))
        return
      }
      
      // Check what was stored after initiating OAuth
      const newKeys = Object.keys(sessionStorage)
      const newPkceData: any = {}
      
      newKeys.forEach(key => {
        if (key.includes('pkce') || key.includes('verifier') || key.includes('auth')) {
          newPkceData[key] = sessionStorage.getItem(key)
        }
      })
      
      setInfo((prev: any) => ({
        ...prev,
        afterOAuth: {
          sessionStorageKeys: newKeys,
          pkceData: newPkceData,
          oauthUrl: data?.url
        }
      }))
      
    } catch (err) {
      setInfo((prev: any) => ({ ...prev, error: err instanceof Error ? err.message : 'Unknown error' }))
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug PKCE Verifier Storage</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h2 className="font-semibold mb-2">PKCE Flow Requirements:</h2>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Client generates code_verifier and stores it</li>
          <li>Client creates code_challenge from verifier</li>
          <li>Client sends user to OAuth with challenge</li>
          <li>OAuth provider returns code</li>
          <li>Client uses stored verifier + code to get tokens</li>
        </ol>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Refresh Page Data
        </button>
        
        <button
          onClick={testPKCEFlow}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Test PKCE OAuth Flow (Will Redirect)
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Storage Inspection:</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6 p-4 bg-red-50 rounded">
        <h3 className="font-semibold mb-2">Possible Issue:</h3>
        <p className="text-sm">
          If no PKCE verifier is stored in sessionStorage, the code exchange will fail.
          Supabase should automatically handle this, but there might be a storage issue.
        </p>
      </div>
    </div>
  )
}