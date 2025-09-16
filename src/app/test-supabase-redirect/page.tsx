'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestSupabaseRedirect() {
  const [results, setResults] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }])
  }

  const testRedirectWithDifferentConfigs = async () => {
    // Clear previous results
    setResults([])

    // Test 1: Basic PKCE flow with simple redirect
    try {
      const client1 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          }
        }
      )

      const { data: data1, error: error1 } = await client1.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: mounted ? `${window.location.origin}/auth/callback` : '',
          skipBrowserRedirect: true
        }
      })

      if (data1?.url) {
        const url = new URL(data1.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        addResult('Test 1: Basic PKCE', {
          success: true,
          generatedUrl: data1.url,
          redirectUri,
          decodedRedirectUri: redirectUri ? decodeURIComponent(redirectUri) : null
        })
      } else {
        addResult('Test 1: Basic PKCE', { success: false, error: error1 })
      }
    } catch (e) {
      addResult('Test 1: Basic PKCE', { success: false, error: e })
    }

    // Test 2: PKCE with query params including next
    try {
      const client2 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )

      const { data: data2, error: error2 } = await client2.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: mounted ? `${window.location.origin}/auth/callback?next=/en` : '',
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (data2?.url) {
        const url = new URL(data2.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        addResult('Test 2: PKCE with next param', {
          success: true,
          generatedUrl: data2.url,
          redirectUri,
          decodedRedirectUri: redirectUri ? decodeURIComponent(redirectUri) : null
        })
      } else {
        addResult('Test 2: PKCE with next param', { success: false, error: error2 })
      }
    } catch (e) {
      addResult('Test 2: PKCE with next param', { success: false, error: e })
    }

    // Test 3: Check what happens with no redirectTo
    try {
      const client3 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )

      const { data: data3, error: error3 } = await client3.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true
        }
      })

      if (data3?.url) {
        const url = new URL(data3.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        addResult('Test 3: No redirectTo specified', {
          success: true,
          generatedUrl: data3.url,
          redirectUri,
          decodedRedirectUri: redirectUri ? decodeURIComponent(redirectUri) : null
        })
      } else {
        addResult('Test 3: No redirectTo specified', { success: false, error: error3 })
      }
    } catch (e) {
      addResult('Test 3: No redirectTo specified', { success: false, error: e })
    }

    // Test 4: Try forcing response_type=code
    try {
      const client4 = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce'
          }
        }
      )

      const { data: data4, error: error4 } = await client4.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: mounted ? `${window.location.origin}/auth/callback` : '',
          skipBrowserRedirect: true,
          queryParams: {
            response_type: 'code'
          } as any
        }
      })

      if (data4?.url) {
        const url = new URL(data4.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        addResult('Test 4: Force response_type=code', {
          success: true,
          generatedUrl: data4.url,
          redirectUri,
          decodedRedirectUri: redirectUri ? decodeURIComponent(redirectUri) : null,
          responseType: url.searchParams.get('response_type')
        })
      } else {
        addResult('Test 4: Force response_type=code', { success: false, error: error4 })
      }
    } catch (e) {
      addResult('Test 4: Force response_type=code', { success: false, error: e })
    }
  }

  const analyzeSupabaseRedirect = async () => {
    if (!mounted) return
    // This will actually redirect to see what happens
    const confirmRedirect = window.confirm(
      'This will redirect you to Google OAuth. After authentication, note where you land. Continue?'
    )
    
    if (!confirmRedirect) return

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce'
        }
      }
    )

    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: mounted ? `${window.location.origin}/auth/callback?debug=true` : ''
      }
    })

    if (error) {
      console.error('OAuth error:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-4">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Redirect Analyzer</h1>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-2">Environment Info</h2>
          <div className="text-sm space-y-1">
            <div>Origin: {window.location.origin}</div>
            <div>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="font-bold mb-2">Tests</h2>
          <div className="space-y-2">
            <button
              onClick={testRedirectWithDifferentConfigs}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Different Redirect Configurations
            </button>
            <button
              onClick={analyzeSupabaseRedirect}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
            >
              Test Actual Redirect (Will Navigate)
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-2">Test Results</h2>
            {results.map((result, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                <h3 className="font-semibold text-sm mb-1">{result.test}</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <h3 className="font-bold text-yellow-800 mb-2">What to Look For:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Check if redirect_uri in the OAuth URL points to Supabase or your domain</li>
            <li>If it points to Supabase, that's where the redirect decision is made</li>
            <li>The actual redirect after OAuth depends on Supabase dashboard configuration</li>
            <li>Look for any pattern in how redirectTo is being processed</li>
          </ol>
        </div>
      </div>
    </div>
  )
}