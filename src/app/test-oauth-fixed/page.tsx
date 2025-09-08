'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function TestOAuthFixed() {
  const router = useRouter()
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Check for auth errors in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      setTestResults(prev => ({
        ...prev,
        urlError: error,
        timestamp: new Date().toISOString()
      }))
    }
  }, [])

  // Monitor auth state
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check session directly from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        setTestResults(prev => ({
          ...prev,
          authContext: {
            hasUser: !!user,
            userEmail: user?.email,
            isLoading: loading,
          },
          supabaseSession: {
            exists: !!session,
            userEmail: session?.user?.email,
            provider: session?.user?.app_metadata?.provider,
            error: error?.message
          },
          timestamp: new Date().toISOString()
        }))
      } catch (err) {
        console.error('[OAuth Test] Error checking auth state:', err)
      }
    }

    checkAuthState()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[OAuth Test] Auth state changed:', event)
      setTestResults(prev => ({
        ...prev,
        lastAuthEvent: {
          type: event,
          hasSession: !!session,
          timestamp: new Date().toISOString()
        }
      }))
    })

    return () => subscription.unsubscribe()
  }, [user, loading])

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      console.log('[OAuth Test] Starting Google sign in...')
      
      const result = await signInWithGoogle()
      
      setTestResults(prev => ({
        ...prev,
        signInResult: {
          success: result.success,
          error: result.error,
          timestamp: new Date().toISOString()
        }
      }))
      
      if (!result.success) {
        console.error('[OAuth Test] Sign in failed:', result.error)
      }
    } catch (err) {
      console.error('[OAuth Test] Unexpected error:', err)
      setTestResults(prev => ({
        ...prev,
        unexpectedError: {
          message: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      console.log('[OAuth Test] Sign out result:', result)
      setTestResults(prev => ({
        ...prev,
        signOutResult: {
          success: result.success,
          error: result.error,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (err) {
      console.error('[OAuth Test] Sign out error:', err)
    }
  }

  const runDiagnostics = async () => {
    console.log('[OAuth Test] Running diagnostics...')
    
    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    }
    
    // Check local storage for PKCE
    const storageCheck: Record<string, any> = {}
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.includes('supabase'))
      storageCheck.supabaseKeys = keys
      storageCheck.hasPKCEVerifier = keys.some(key => key.includes('code-verifier'))
    }
    
    setTestResults(prev => ({
      ...prev,
      diagnostics: {
        environment: envCheck,
        storage: storageCheck,
        timestamp: new Date().toISOString()
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Flow Test (Fixed)</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          {loading ? (
            <p className="text-gray-600">Loading auth state...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Authenticated</p>
              <p>Email: {user.email}</p>
              <p>Provider: {user.provider}</p>
              <p>Subscription: {user.subscription?.tier || 'free'}</p>
              <button
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-yellow-600 font-medium">Not authenticated</p>
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center gap-2"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Diagnostics</h2>
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Run Diagnostics
            </button>
          </div>
          
          <div className="bg-gray-100 rounded p-4 overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">OAuth Flow Overview</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Click "Sign in with Google" to initiate OAuth</li>
            <li>Google redirects to /auth/callback with authorization code</li>
            <li>Server route redirects to /auth/callback-pkce for client-side handling</li>
            <li>PKCE handler exchanges code for session using stored verifier</li>
            <li>Session is established and user is redirected back</li>
          </ol>
        </div>
      </div>
    </div>
  )
}