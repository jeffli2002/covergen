'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function TestPKCEOAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    // Check for PKCE parameters in storage
    const checkPKCEParams = () => {
      const hasCodeVerifier = localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}-auth-token-code-verifier`)
      const sessionStorage = sessionStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}-auth-token`)
      
      setDebugInfo(prev => ({
        ...prev,
        storage: {
          hasCodeVerifierInLocalStorage: !!hasCodeVerifier,
          hasSessionInStorage: !!sessionStorage,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }
      }))
    }
    
    checkPKCEParams()
    
    // Check current session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setDebugInfo(prev => ({
        ...prev,
        session: {
          exists: !!session,
          user: session?.user?.email,
          error: error?.message
        }
      }))
    }
    
    checkSession()
  }, [])
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      console.log('[PKCE Test] Starting Google OAuth with PKCE flow...')
      
      // Use the server callback which will redirect to client handler
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      
      console.log('[PKCE Test] Redirect URL:', redirectUrl)
      console.log('[PKCE Test] Supabase config:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        flowType: 'pkce' // This should be set in supabase-simple.ts
      })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('[PKCE Test] OAuth initiation error:', error)
        setDebugInfo(prev => ({
          ...prev,
          lastError: {
            message: error.message,
            timestamp: new Date().toISOString()
          }
        }))
      } else {
        console.log('[PKCE Test] OAuth initiated successfully:', data)
        setDebugInfo(prev => ({
          ...prev,
          lastSuccess: {
            url: data.url,
            timestamp: new Date().toISOString()
          }
        }))
      }
    } catch (err: any) {
      console.error('[PKCE Test] Unexpected error:', err)
      setDebugInfo(prev => ({
        ...prev,
        unexpectedError: err.message
      }))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Alternative: Direct to client handler
  const handleDirectClientAuth = async () => {
    try {
      setIsLoading(true)
      console.log('[PKCE Test] Trying direct client callback...')
      
      // Skip server callback, go directly to client handler
      const redirectUrl = `${window.location.origin}/auth/callback-handler?next=${encodeURIComponent(window.location.pathname)}`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      })
      
      if (error) {
        console.error('[PKCE Test] Direct client error:', error)
      } else {
        console.log('[PKCE Test] Direct client success:', data)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PKCE OAuth Test Page</h1>
      
      <div className="grid gap-4 mb-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading...' : 'Sign in with Google (via /auth/callback)'}
        </button>
        
        <button
          onClick={handleDirectClientAuth}
          disabled={isLoading}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Loading...' : 'Sign in with Google (direct to client handler)'}
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Debug Information:</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">Important PKCE Notes:</h2>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>PKCE stores code_verifier in browser storage</li>
            <li>Server-side callbacks cannot access browser storage</li>
            <li>We redirect to client-side handler to complete exchange</li>
            <li>Check browser console for detailed logs</li>
          </ul>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-bold mb-2">Required Supabase Redirect URLs:</h2>
          <code className="text-xs block mb-1">{window.location.origin}/auth/callback</code>
          <code className="text-xs block mb-1">{window.location.origin}/auth/callback-handler</code>
          <code className="text-xs block">{window.location.origin}{'/**'}</code>
        </div>
      </div>
    </div>
  )
}