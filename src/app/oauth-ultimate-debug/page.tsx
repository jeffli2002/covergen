'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

export default function OAuthUltimateDebug() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    runUltimateDebug()
  }, [])
  
  const runUltimateDebug = async () => {
    const debug: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      cookies: {},
      localStorage: {},
      supabaseClients: {},
      oauthTests: {},
      serverCallback: {},
      recommendations: []
    }
    
    // 1. Environment Analysis
    debug.environment = {
      isProduction: process.env.NODE_ENV === 'production',
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      origin: window.location.origin,
      isVercel: !!process.env.NEXT_PUBLIC_VERCEL_URL,
      isLocalhost: window.location.hostname === 'localhost',
      isHTTPS: window.location.protocol === 'https:',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    }
    
    // 2. Cookie Analysis
    const cookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies = cookies.filter(c => c.includes('sb-'))
    
    debug.cookies = {
      allCookies: cookies.map(c => c.split('=')[0]),
      supabaseCookies: supabaseCookies.map(c => c.split('=')[0]),
      hasAuthToken: cookies.some(c => c.includes('sb-') && c.includes('auth-token')),
      cookieString: document.cookie.length > 0 ? 'Has cookies' : 'No cookies',
      secureContext: window.isSecureContext,
      
      // Test cookie write
      canWriteCookie: await testCookieWrite(),
      
      // Cookie attributes test
      cookieTest: await testCookieAttributes()
    }
    
    // 3. LocalStorage Analysis
    const lsKeys = Object.keys(localStorage)
    debug.localStorage = {
      totalKeys: lsKeys.length,
      supabaseKeys: lsKeys.filter(k => k.includes('supabase')),
      hasAuthToken: lsKeys.some(k => k.includes('supabase.auth.token'))
    }
    
    // 4. Test Different Supabase Client Configurations
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Test 1: Basic createClient
      try {
        const client1 = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        const { data: session1 } = await client1.auth.getSession()
        debug.supabaseClients.basicClient = {
          hasSession: !!session1?.session,
          user: session1?.session?.user?.email
        }
      } catch (e) {
        debug.supabaseClients.basicClient = { error: e instanceof Error ? e.message : 'Unknown error' }
      }
      
      // Test 2: SSR createBrowserClient with cookie config
      try {
        const client2 = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              get(name: string) {
                const value = document.cookie
                  .split('; ')
                  .find(row => row.startsWith(`${name}=`))
                  ?.split('=')[1]
                console.log(`[Cookie Get] ${name}: ${value ? 'found' : 'not found'}`)
                return value
              },
              set(name: string, value: string, options: any) {
                console.log(`[Cookie Set] ${name}`, options)
                let cookieStr = `${name}=${value}`
                
                if (options?.path) cookieStr += `; path=${options.path}`
                if (options?.maxAge) cookieStr += `; max-age=${options.maxAge}`
                if (options?.domain) cookieStr += `; domain=${options.domain}`
                if (options?.secure) cookieStr += '; secure'
                if (options?.sameSite) cookieStr += `; samesite=${options.sameSite}`
                
                document.cookie = cookieStr
              },
              remove(name: string) {
                console.log(`[Cookie Remove] ${name}`)
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
              }
            }
          }
        )
        const { data: session2 } = await client2.auth.getSession()
        debug.supabaseClients.ssrClient = {
          hasSession: !!session2?.session,
          user: session2?.session?.user?.email
        }
      } catch (e) {
        debug.supabaseClients.ssrClient = { error: e instanceof Error ? e.message : 'Unknown error' }
      }
      
      // Test 3: OAuth URL Generation
      try {
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
        
        const redirectUrl = `${window.location.origin}/auth/callback-production`
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true
          }
        })
        
        debug.oauthTests = {
          redirectUrl,
          urlGenerated: !!data?.url,
          error: error?.message,
          oauthUrl: data?.url ? new URL(data.url) : null,
          urlDetails: data?.url ? {
            hasState: data.url.includes('state='),
            hasCodeChallenge: data.url.includes('code_challenge='),
            redirectUri: new URL(data.url).searchParams.get('redirect_uri'),
            responseType: new URL(data.url).searchParams.get('response_type')
          } : null
        }
      } catch (e) {
        debug.oauthTests.error = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    // 5. Server Callback Analysis
    debug.serverCallback = {
      expectedUrl: `${window.location.origin}/auth/callback-production`,
      willReceiveCode: 'Yes - PKCE flow uses ?code=',
      willReceiveTokens: 'No - Tokens in hash # are not visible to server',
      recommendation: 'Server-side callback should work with PKCE flow'
    }
    
    // 6. Recommendations based on findings
    if (!debug.cookies.canWriteCookie) {
      debug.recommendations.push('🔴 Cannot write cookies - check browser settings or cookie policy')
    }
    
    if (!debug.environment.isHTTPS && debug.environment.isProduction) {
      debug.recommendations.push('🔴 Production must use HTTPS for secure cookies')
    }
    
    if (debug.cookies.cookieTest?.secure && !debug.environment.isHTTPS) {
      debug.recommendations.push('🔴 Secure cookies require HTTPS')
    }
    
    if (!debug.cookies.hasAuthToken && !debug.localStorage.hasAuthToken) {
      debug.recommendations.push('🟡 No auth tokens found - user not authenticated')
    }
    
    if (debug.oauthTests.urlDetails?.responseType === 'token') {
      debug.recommendations.push('🔴 Using implicit flow - tokens in hash, need client-side callback')
    } else if (debug.oauthTests.urlDetails?.responseType === 'code') {
      debug.recommendations.push('✅ Using PKCE flow - server-side callback should work')
    }
    
    setResults(debug)
    setLoading(false)
  }
  
  const testCookieWrite = async () => {
    const testName = 'test-cookie-' + Date.now()
    document.cookie = `${testName}=test; path=/`
    const success = document.cookie.includes(testName)
    if (success) {
      document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
    return success
  }
  
  const testCookieAttributes = async () => {
    const tests: any = {}
    
    // Test different cookie configurations
    const configs = [
      { name: 'basic', value: 'test1', attrs: '' },
      { name: 'withPath', value: 'test2', attrs: '; path=/' },
      { name: 'withSecure', value: 'test3', attrs: '; path=/; secure' },
      { name: 'withSameSite', value: 'test4', attrs: '; path=/; samesite=lax' },
      { name: 'fullProd', value: 'test5', attrs: '; path=/; secure; samesite=lax' }
    ]
    
    for (const config of configs) {
      const cookieName = `test-${config.name}-${Date.now()}`
      document.cookie = `${cookieName}=${config.value}${config.attrs}`
      tests[config.name] = document.cookie.includes(cookieName)
      
      // Clean up
      if (tests[config.name]) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    }
    
    return tests
  }
  
  const testSignIn = async () => {
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback-production`
      }
    })
  }
  
  if (loading) {
    return <div className="p-8">Running ultimate OAuth debug...</div>
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ultimate OAuth Debug</h1>
      
      {results.recommendations?.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded">
          <h2 className="font-bold text-lg mb-2">Key Issues & Recommendations:</h2>
          <ul className="space-y-2">
            {results.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mb-6">
        <button
          onClick={testSignIn}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-4"
        >
          Test Google Sign In
        </button>
        <button
          onClick={runUltimateDebug}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          Re-run Debug
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">Environment</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.environment, null, 2)}
          </pre>
        </section>
        
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">Cookie Analysis</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.cookies, null, 2)}
          </pre>
        </section>
        
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">Supabase Clients</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.supabaseClients, null, 2)}
          </pre>
        </section>
        
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">OAuth Tests</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.oauthTests, null, 2)}
          </pre>
        </section>
        
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">LocalStorage</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.localStorage, null, 2)}
          </pre>
        </section>
        
        <section className="border rounded p-4">
          <h2 className="font-bold text-lg mb-3">Server Callback Analysis</h2>
          <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded">
            {JSON.stringify(results.serverCallback, null, 2)}
          </pre>
        </section>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Why Dev Works but Production Doesn't:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Cookie Security</strong>: Production requires secure cookies (HTTPS only)</li>
          <li>• <strong>Domain Mismatch</strong>: Cookie domain might be set incorrectly</li>
          <li>• <strong>SameSite Policy</strong>: Stricter in production environments</li>
          <li>• <strong>Storage Conflicts</strong>: Multiple Supabase client instances</li>
          <li>• <strong>Timing Issues</strong>: Server-side redirect happens before client can save session</li>
        </ul>
      </div>
    </div>
  )
}