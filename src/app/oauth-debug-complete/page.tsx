'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthDebugComplete() {
  const [info, setInfo] = useState<any>({})
  const [currentUrl, setCurrentUrl] = useState('')
  
  useEffect(() => {
    // Capture current URL and params
    const url = new URL(window.location.href)
    const params = Object.fromEntries(url.searchParams)
    const hash = window.location.hash
    
    // Check for OAuth response in URL
    const hashParams: any = {}
    if (hash) {
      const hashString = hash.substring(1)
      const pairs = hashString.split('&')
      pairs.forEach(pair => {
        const [key, value] = pair.split('=')
        if (key) hashParams[key] = decodeURIComponent(value || '')
      })
    }
    
    // Check session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Check all storage
      const storage: any = {
        sessionStorage: {},
        localStorage: {}
      }
      
      // Check sessionStorage for PKCE verifier
      try {
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('pkce') || key.includes('verifier') || key.includes('code')) {
            storage.sessionStorage[key] = sessionStorage.getItem(key)
          }
        })
      } catch (e) {
        storage.sessionStorage.error = 'Cannot access sessionStorage'
      }
      
      // Check localStorage for auth data
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('auth')) {
            const value = localStorage.getItem(key)
            storage.localStorage[key] = value ? value.substring(0, 100) + '...' : null
          }
        })
      } catch (e) {
        storage.localStorage.error = 'Cannot access localStorage'
      }
      
      // Check cookies
      const cookies = document.cookie.split(';').map(c => c.trim())
      const authCookies = cookies.filter(c => 
        c.startsWith('sb-') || c.includes('auth') || c.includes('oauth')
      )
      
      setInfo({
        currentUrl: url.href,
        urlParams: params,
        hashParams,
        hasSession: !!session,
        sessionUser: session?.user?.email,
        sessionError: error?.message,
        storage,
        authCookies: authCookies.map(c => c.split('=')[0]),
        timestamp: new Date().toISOString()
      })
    }
    
    checkSession()
    setCurrentUrl(url.href)
  }, [])
  
  const testOAuthWithDebug = async () => {
    try {
      console.log('[OAuth Debug] Starting OAuth flow...')
      
      // Clear any existing PKCE data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('pkce') || key.includes('verifier')) {
          console.log(`[OAuth Debug] Clearing ${key}`)
          sessionStorage.removeItem(key)
        }
      })
      
      // Initiate OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            response_type: 'code' // Force PKCE
          } as any
        }
      })
      
      if (error) {
        setInfo((prev: any) => ({ ...prev, oauthError: error.message }))
      } else {
        setInfo((prev: any) => ({ ...prev, oauthInitiated: true, oauthData: data }))
      }
    } catch (err) {
      setInfo((prev: any) => ({ ...prev, error: err instanceof Error ? err.message : 'Unknown error' }))
    }
  }
  
  const checkSupabaseInternals = () => {
    try {
      // Try to access Supabase internals
      const auth = (supabase as any).auth
      const storage = auth?.storage || auth?.localStorage || 'Not accessible'
      const flowType = auth?.flowType || auth?.options?.flowType || 'Not found'
      
      // Check what's in the auth storage
      let storageItems: any = {}
      if (auth?.storage) {
        try {
          const keys = ['auth-token', 'code-verifier', 'pkce-code-verifier']
          keys.forEach(key => {
            const value = auth.storage.getItem(key)
            if (value) storageItems[key] = value
          })
        } catch (e) {
          storageItems.error = 'Cannot access auth storage'
        }
      }
      
      setInfo((prev: any) => ({
        ...prev,
        supabaseInternals: {
          hasAuth: !!auth,
          storageType: typeof storage,
          flowType,
          storageItems,
          authKeys: auth ? Object.keys(auth) : []
        }
      }))
    } catch (err) {
      setInfo((prev: any) => ({ ...prev, internalsError: err instanceof Error ? err.message : 'Error accessing internals' }))
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Complete OAuth Debug</h1>
      
      {currentUrl.includes('error') && (
        <div className="mb-4 p-4 bg-red-50 rounded">
          <p className="font-semibold text-red-800">OAuth Error Detected in URL!</p>
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 w-full"
        >
          Refresh Page State
        </button>
        
        <button
          onClick={checkSupabaseInternals}
          className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 w-full"
        >
          Check Supabase Internals
        </button>
        
        <button
          onClick={testOAuthWithDebug}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Test OAuth Flow (Will Redirect)
        </button>
      </div>
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
          {JSON.stringify(info, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Common Issues:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>PKCE code verifier not stored in sessionStorage</li>
            <li>Callback URL mismatch in Supabase Dashboard</li>
            <li>Browser blocking third-party cookies</li>
            <li>Session storage cleared between redirect</li>
          </ul>
        </div>
        
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">What to Check:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Is there a code_verifier in sessionStorage after initiating OAuth?</li>
            <li>Are sb- cookies being set after callback?</li>
            <li>Is the redirect URL exactly matching Supabase Dashboard?</li>
            <li>Check browser console for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}