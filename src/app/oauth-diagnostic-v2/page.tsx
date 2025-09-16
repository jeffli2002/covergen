'use client'

import { useState, useEffect } from 'react'

export default function OAuthDiagnosticV2() {
  const [status, setStatus] = useState('Starting diagnostics...')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    runDiagnostics()
  }, [])
  
  const runDiagnostics = async () => {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      browser: {},
      environment: {},
      urls: {},
      supabase: {}
    }
    
    try {
      // 1. Basic browser info
      setStatus('Checking browser...')
      diagnostics.browser = {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine
      }
      
      // 2. Environment
      setStatus('Checking environment...')
      diagnostics.environment = {
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isProduction: window.location.hostname === 'covergen.pro',
        isSecure: window.location.protocol === 'https:'
      }
      
      // 3. URLs
      setStatus('Checking URLs...')
      diagnostics.urls = {
        currentCallback: `${window.location.origin}/auth/callback-production`,
        expectedProdCallback: 'https://covergen.pro/auth/callback-production',
        matches: `${window.location.origin}/auth/callback-production` === 'https://covergen.pro/auth/callback-production'
      }
      
      // 4. Supabase config
      setStatus('Checking Supabase config...')
      diagnostics.supabase = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'Not set'
      }
      
      setStatus('Diagnostics complete')
      setResults(diagnostics)
      
    } catch (err) {
      console.error('[Diagnostic V2] Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setStatus('Error during diagnostics')
    }
  }
  
  const testSignIn = () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Missing Supabase configuration')
      return
    }
    
    // Manually construct OAuth URL to avoid any client issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/callback-production`)
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`
    
    console.log('[Diagnostic V2] Redirecting to:', oauthUrl)
    window.location.href = oauthUrl
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Diagnostic V2</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <p className="font-semibold">Status: {status}</p>
        {error && (
          <p className="text-red-600 mt-2">Error: {error}</p>
        )}
      </div>
      
      {results && (
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Browser Info</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(results.browser, null, 2)}
            </pre>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Environment</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(results.environment, null, 2)}
            </pre>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">OAuth URLs</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(results.urls, null, 2)}
            </pre>
          </div>
          
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Supabase Config</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(results.supabase, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-6 space-x-4">
        <button
          onClick={testSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!results}
        >
          Test OAuth Sign In
        </button>
        
        <button
          onClick={runDiagnostics}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Re-run Diagnostics
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Quick Checks:</h3>
        <ul className="text-sm space-y-1">
          {results?.environment?.isProduction && !results?.environment?.isSecure && (
            <li className="text-red-600">❌ Production should use HTTPS</li>
          )}
          {!results?.supabase?.hasUrl && (
            <li className="text-red-600">❌ Missing Supabase URL</li>
          )}
          {!results?.supabase?.hasKey && (
            <li className="text-red-600">❌ Missing Supabase Key</li>
          )}
          {results?.urls?.matches === false && (
            <li className="text-red-600">❌ Callback URL mismatch</li>
          )}
          {results?.browser?.cookiesEnabled === false && (
            <li className="text-red-600">❌ Cookies are disabled</li>
          )}
          {results && results.environment?.isSecure && results.supabase?.hasUrl && results.supabase?.hasKey && (
            <li className="text-green-600">✅ Basic configuration looks good</li>
          )}
        </ul>
      </div>
    </div>
  )
}