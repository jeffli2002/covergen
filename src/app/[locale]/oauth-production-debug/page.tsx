'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase-simple'

interface DebugInfo {
  environment: {
    nodeEnv: string
    origin: string
    href: string
    protocol: string
    hostname: string
    port: string
  }
  supabaseConfig: {
    url: string
    hasAnonKey: boolean
    authUrl: string
  }
  cookies: {
    all: string
    supabaseAuth: string | null
  }
  localStorage: {
    hasSupabaseAuth: boolean
    keys: string[]
  }
  redirectUrls: {
    computed: string
    fromEnv: string | null
    fallback: string
  }
  headers: {
    userAgent: string
    referer: string | null
  }
}

export default function OAuthProductionDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Gather all debug information
    const info: DebugInfo = {
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        origin: window.location.origin,
        href: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port
      },
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        authUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1` || 'NOT SET'
      },
      cookies: {
        all: document.cookie,
        supabaseAuth: document.cookie.split(';').find(c => c.trim().startsWith('sb-'))?.trim() || null
      },
      localStorage: {
        hasSupabaseAuth: Object.keys(localStorage).some(key => key.includes('supabase')),
        keys: Object.keys(localStorage).filter(key => key.includes('supabase'))
      },
      redirectUrls: {
        computed: `${window.location.origin}/auth/callback`,
        fromEnv: process.env.NEXT_PUBLIC_SITE_URL || null,
        fallback: 'https://covergen.pro'
      },
      headers: {
        userAgent: navigator.userAgent,
        referer: document.referrer || null
      }
    }

    setDebugInfo(info)
    console.log('🔍 OAuth Production Debug Info:', info)
  }, [])

  const testOAuthFlow = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      // Test 1: Check Supabase client
      const clientTest = {
        hasClient: !!getSupabase,
        clientType: typeof getSupabase
      }

      // Test 2: Try to get current session
      const { data: session, error: sessionError } = await getSupabase().auth.getSession()
      const sessionTest = {
        hasSession: !!session?.session,
        sessionError: sessionError?.message || null,
        userId: session?.session?.user?.id || null
      }

      // Test 3: Generate OAuth URL
      const redirectTo = `${window.location.origin}/auth/callback`
      const { data: oauthData, error: oauthError } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true // Don't actually redirect, just get the URL
        }
      })

      const oauthTest = {
        hasUrl: !!oauthData?.url,
        url: oauthData?.url || null,
        error: oauthError?.message || null,
        redirectTo
      }

      // Test 4: Check auth settings
      const authSettings = {
        detectSessionInUrl: getSupabase().auth.detectSessionInUrl,
        flowType: getSupabase().auth.flowType || 'unknown'
      }

      const results = {
        timestamp: new Date().toISOString(),
        clientTest,
        sessionTest,
        oauthTest,
        authSettings
      }

      setTestResult(results)
      console.log('🧪 OAuth Test Results:', results)
    } catch (error) {
      console.error('Test error:', error)
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      })
    } finally {
      setLoading(false)
    }
  }

  const copyDebugInfo = () => {
    const data = {
      debugInfo,
      testResult,
      timestamp: new Date().toISOString()
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Debug info copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">OAuth Production Debug</h1>
        
        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          {debugInfo && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Node Env:</strong> {debugInfo.environment.nodeEnv}
                </div>
                <div>
                  <strong>Origin:</strong> {debugInfo.environment.origin}
                </div>
                <div>
                  <strong>Protocol:</strong> {debugInfo.environment.protocol}
                </div>
                <div>
                  <strong>Hostname:</strong> {debugInfo.environment.hostname}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Supabase Config */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Supabase Configuration</h2>
          {debugInfo && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.supabaseConfig.url}</code>
              </div>
              <div>
                <strong>Has Anon Key:</strong> {debugInfo.supabaseConfig.hasAnonKey ? '✅ Yes' : '❌ No'}
              </div>
            </div>
          )}
        </div>

        {/* Redirect URLs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Redirect URLs</h2>
          {debugInfo && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Computed:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.redirectUrls.computed}</code>
              </div>
              <div>
                <strong>From Env:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.redirectUrls.fromEnv || 'Not set'}</code>
              </div>
              <div>
                <strong>Fallback:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{debugInfo.redirectUrls.fallback}</code>
              </div>
            </div>
          )}
        </div>

        {/* Auth State */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Auth State</h2>
          {debugInfo && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Has Supabase Cookie:</strong> {debugInfo.cookies.supabaseAuth ? '✅ Yes' : '❌ No'}
              </div>
              <div>
                <strong>Has LocalStorage Auth:</strong> {debugInfo.localStorage.hasSupabaseAuth ? '✅ Yes' : '❌ No'}
              </div>
              {debugInfo.localStorage.keys.length > 0 && (
                <div>
                  <strong>Storage Keys:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {debugInfo.localStorage.keys.map(key => (
                      <li key={key}><code className="text-xs">{key}</code></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test OAuth Flow */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test OAuth Flow</h2>
          <button
            onClick={testOAuthFlow}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run OAuth Test'}
          </button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Copy Debug Info */}
        <div className="flex justify-center">
          <button
            onClick={copyDebugInfo}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Copy All Debug Info
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Production OAuth Checklist:</h3>
          <ol className="list-decimal ml-6 space-y-1 text-sm">
            <li>Verify Supabase URL and Anon Key are set in production environment</li>
            <li>Check that redirect URLs in Supabase dashboard include your production domain</li>
            <li>Ensure cookies are being set with proper domain and secure flags</li>
            <li>Verify CORS settings allow your production domain</li>
            <li>Check browser console for any security errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}