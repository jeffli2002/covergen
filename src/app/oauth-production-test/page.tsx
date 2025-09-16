'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthProductionTest() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    runDiagnostics()
  }, [])
  
  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      urls: {},
      cookies: {},
      oauth: {},
      session: {},
      client: {}
    }
    
    // 1. Check environment
    results.environment = {
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      origin: window.location.origin,
      pathname: window.location.pathname,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    }
    
    // 2. Check redirect URLs
    const origin = window.location.origin
    results.urls = {
      currentOrigin: origin,
      callbackUrl: `${origin}/auth/callback`,
      expectedProdUrl: 'https://covergen.pro/auth/callback',
      isCorrectProdUrl: origin === 'https://covergen.pro',
      allPossibleCallbacks: [
        `${origin}/auth/callback`,
        `${origin}/auth/callback-v2`,
        `${origin}/api/auth/callback`,
        `${origin}/auth/confirm`,
        `${origin}/[locale]/auth/callback`
      ]
    }
    
    // 3. Check cookies
    results.cookies = {
      hasDocument: typeof document !== 'undefined',
      cookieEnabled: navigator.cookieEnabled,
      currentCookies: document.cookie.split(';').map(c => c.trim().split('=')[0]),
      hasSupabaseCookies: document.cookie.includes('sb-'),
      secureContext: window.isSecureContext,
      sameSiteInfo: 'Production requires SameSite=Lax or None with Secure'
    }
    
    // 4. Test OAuth flow setup
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
              storage: {
                getItem: (key) => {
                  if (typeof window === 'undefined') return null
                  return window.localStorage.getItem(key)
                },
                setItem: (key, value) => {
                  if (typeof window === 'undefined') return
                  window.localStorage.setItem(key, value)
                },
                removeItem: (key) => {
                  if (typeof window === 'undefined') return
                  window.localStorage.removeItem(key)
                }
              }
            }
          }
        )
        
        // Check session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        results.session = {
          hasSession: !!sessionData?.session,
          sessionError: sessionError?.message,
          user: sessionData?.session?.user?.email
        }
        
        // Test OAuth URL generation
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${origin}/auth/callback`,
            skipBrowserRedirect: true,
            queryParams: {
              prompt: 'consent'
            }
          }
        })
        
        results.oauth = {
          urlGenerated: !!data?.url,
          error: error?.message,
          redirectTo: `${origin}/auth/callback`,
          urlComponents: data?.url ? {
            hasState: data.url.includes('state='),
            hasCodeChallenge: data.url.includes('code_challenge='),
            hasRedirectUri: data.url.includes('redirect_uri='),
            isPKCE: data.url.includes('code_challenge_method=S256'),
            extractedRedirect: decodeURIComponent(
              data.url.match(/redirect_uri=([^&]*)/)?.[1] || ''
            )
          } : null
        }
        
        results.client = {
          flowType: 'pkce',
          hasMultipleInstances: false,
          storageType: 'localStorage'
        }
        
      } catch (err) {
        results.oauth.error = err instanceof Error ? err.message : 'Unknown error'
      }
    }
    
    // 5. Check localStorage
    results.localStorage = {
      available: typeof window !== 'undefined' && !!window.localStorage,
      supabaseKeys: Object.keys(window.localStorage || {}).filter(k => k.includes('supabase')),
      hasAuthToken: Object.keys(window.localStorage || {}).some(k => 
        k.includes('supabase.auth.token')
      )
    }
    
    setDiagnostics(results)
    setLoading(false)
  }
  
  const signIn = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Missing Supabase credentials')
      return
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          flowType: 'pkce'
        }
      }
    )
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      alert(`Sign in error: ${error.message}`)
    }
  }
  
  const criticalChecks = () => {
    const checks = []
    
    if (diagnostics.environment?.protocol !== 'https:' && diagnostics.environment?.hostname !== 'localhost') {
      checks.push('🔴 Not using HTTPS in production')
    }
    
    if (!diagnostics.urls?.isCorrectProdUrl && diagnostics.environment?.isProduction) {
      checks.push('🔴 Production URL mismatch')
    }
    
    if (!diagnostics.cookies?.secureContext && diagnostics.environment?.isProduction) {
      checks.push('🔴 Not in secure context')
    }
    
    if (!diagnostics.oauth?.urlComponents?.isPKCE) {
      checks.push('🟡 Not using PKCE flow')
    }
    
    if (diagnostics.oauth?.urlComponents?.extractedRedirect !== diagnostics.urls?.callbackUrl) {
      checks.push('🔴 Redirect URL mismatch in OAuth request')
    }
    
    return checks
  }
  
  if (loading) return <div className="p-8">Running diagnostics...</div>
  
  const issues = criticalChecks()
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Production Diagnostics</h1>
      
      {issues.length > 0 && (
        <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 rounded">
          <h2 className="font-bold text-red-800 mb-2">Critical Issues Found:</h2>
          <ul className="space-y-1">
            {issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={signIn}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Test Google Sign In
        </button>
        <button
          onClick={runDiagnostics}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Re-run Diagnostics
        </button>
      </div>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">Environment Check</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.environment, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">URLs Configuration</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.urls, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">Cookie Status</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.cookies, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">OAuth Configuration</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.oauth, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.session, null, 2)}
          </pre>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold mb-2">Local Storage</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-auto text-sm">
            {JSON.stringify(diagnostics.localStorage, null, 2)}
          </pre>
        </section>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Checklist for Production OAuth:</h3>
        <ul className="space-y-1 text-sm">
          <li>✓ Supabase Dashboard: Add exact production redirect URL</li>
          <li>✓ Use HTTPS in production</li>
          <li>✓ Consistent PKCE flow across all auth calls</li>
          <li>✓ Single Supabase client instance</li>
          <li>✓ Proper cookie settings (SameSite, Secure)</li>
          <li>✓ Match redirect URLs exactly (no trailing slashes)</li>
        </ul>
      </div>
    </div>
  )
}