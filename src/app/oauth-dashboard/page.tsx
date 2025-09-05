'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { OAuthProvider, OAuthButton, OAuthStatus, useOAuth } from '@/modules/auth/oauth'

function OAuthTestDashboard() {
  const { user, loading, error } = useOAuth()
  const [directSession, setDirectSession] = useState<any>(null)
  const [testResults, setTestResults] = useState<any>({})
  
  useEffect(() => {
    runTests()
  }, [user])
  
  const runTests = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {
        port: typeof window !== 'undefined' ? window.location.port : '',
        origin: typeof window !== 'undefined' ? window.location.origin : '',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'Not set'
      },
      directSupabase: {
        session: null,
        error: null
      },
      modularOAuth: {
        user: user?.email || null,
        loading,
        error: error?.message || null
      }
    }
    
    // Test direct Supabase access
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      results.directSupabase.session = session ? {
        email: session.user.email,
        provider: session.user.app_metadata?.provider
      } : null
      results.directSupabase.error = error?.message || null
      setDirectSession(session)
    } catch (err) {
      results.directSupabase.error = String(err)
    }
    
    setTestResults(results)
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">OAuth Test Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Modular OAuth Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Modular OAuth Module</h2>
          <div className="space-y-4">
            <OAuthStatus showDetails className="p-4 bg-gray-50 rounded" />
            <OAuthButton provider="google" className="w-full" />
            <div className="text-sm space-y-1">
              <p><strong>Status:</strong> {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}</p>
              <p><strong>Module Error:</strong> {error?.message || 'None'}</p>
            </div>
          </div>
        </div>
        
        {/* Direct Supabase Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Access</h2>
          <div className="space-y-4">
            {directSession ? (
              <div className="p-4 bg-green-50 rounded">
                <p className="font-medium">Session Active</p>
                <p className="text-sm">{directSession.user.email}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded">
                <p>No direct session</p>
              </div>
            )}
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${typeof window !== 'undefined' ? window.location.pathname : ''}` }
                })
                if (error) alert(error.message)
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign in (Direct Supabase)
            </button>
          </div>
        </div>
      </div>
      
      {/* Test Results */}
      <div className="mt-8 bg-gray-900 text-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Test Results</h3>
        <pre className="text-sm overflow-auto">
{JSON.stringify(testResults, null, 2)}
        </pre>
      </div>
      
      {/* Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Checklist:</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Current callback URL: <code className="bg-white px-2 py-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}</code></li>
          <li>Add this URL to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs</li>
          <li>Enable Google provider in Supabase Dashboard → Authentication → Providers</li>
          <li>Add the callback URL to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs</li>
        </ul>
      </div>
    </div>
  )
}

export default function OAuthDashboardPage() {
  return (
    <OAuthProvider config={{
      providers: ['google'],
      onSuccess: (user) => console.log('[OAuth Dashboard] Sign in success:', user.email),
      onError: (error) => console.error('[OAuth Dashboard] OAuth error:', error)
    }}>
      <OAuthTestDashboard />
    </OAuthProvider>
  )
}