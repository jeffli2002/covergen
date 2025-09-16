'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthFixChecklist() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  
  const runChecks = async () => {
    setLoading(true)
    const checks: any = {
      timestamp: new Date().toISOString(),
      items: []
    }
    
    // 1. Check production URL
    const isProduction = window.location.hostname === 'covergen.pro'
    const currentUrl = window.location.origin
    checks.items.push({
      name: 'Production URL Check',
      status: isProduction ? 'pass' : 'warning',
      current: currentUrl,
      expected: 'https://covergen.pro',
      action: isProduction ? null : 'Test on production URL'
    })
    
    // 2. Check HTTPS
    const isHttps = window.location.protocol === 'https:'
    checks.items.push({
      name: 'HTTPS Protocol',
      status: isHttps || !isProduction ? 'pass' : 'fail',
      current: window.location.protocol,
      expected: 'https:',
      action: !isHttps && isProduction ? 'Must use HTTPS in production' : null
    })
    
    // 3. Check Supabase config
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    checks.items.push({
      name: 'Supabase Configuration',
      status: hasUrl && hasKey ? 'pass' : 'fail',
      hasUrl,
      hasKey,
      action: !hasUrl || !hasKey ? 'Check environment variables' : null
    })
    
    // 4. Test OAuth URL generation
    if (hasUrl && hasKey) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { flowType: 'pkce' } }
        )
        
        const redirectUrl = `${currentUrl}/auth/callback`
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true
          }
        })
        
        if (data?.url) {
          const url = new URL(data.url)
          const redirectUri = url.searchParams.get('redirect_uri')
          
          checks.items.push({
            name: 'OAuth URL Generation',
            status: 'pass',
            redirectUrl: redirectUrl,
            extractedRedirect: redirectUri ? decodeURIComponent(redirectUri) : null,
            matches: redirectUri === encodeURIComponent(redirectUrl),
            action: null
          })
        } else {
          checks.items.push({
            name: 'OAuth URL Generation',
            status: 'fail',
            error: error?.message,
            action: 'Check Supabase OAuth settings'
          })
        }
      } catch (err) {
        checks.items.push({
          name: 'OAuth URL Generation',
          status: 'fail',
          error: err instanceof Error ? err.message : 'Unknown error',
          action: 'Check Supabase client initialization'
        })
      }
    }
    
    // 5. Cookie check
    const hasCookies = document.cookie.includes('sb-')
    checks.items.push({
      name: 'Supabase Cookies',
      status: hasCookies ? 'info' : 'info',
      present: hasCookies,
      note: 'Cookies will be set after successful auth',
      action: null
    })
    
    // 6. Callback routes
    checks.callbackRoutes = [
      `${currentUrl}/auth/callback`,
      `${currentUrl}/auth/callback-v2`,
      `${currentUrl}/auth/callback-v3`
    ]
    
    setResults(checks)
    setLoading(false)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600'
      case 'fail': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }
  
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Production Fix Checklist</h1>
      
      <div className="mb-6">
        <button
          onClick={runChecks}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Checks...' : 'Run All Checks'}
        </button>
      </div>
      
      {results.items && (
        <>
          <div className="space-y-4 mb-8">
            {results.items.map((check: any, index: number) => (
              <div key={index} className="border rounded p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getStatusIcon(check.status)}</span>
                  <h3 className="font-semibold text-lg">{check.name}</h3>
                </div>
                
                <div className="ml-10 text-sm space-y-1">
                  {Object.entries(check).map(([key, value]) => {
                    if (key === 'name' || key === 'status' || key === 'action') return null
                    return (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span className="text-gray-600">{JSON.stringify(value)}</span>
                      </div>
                    )
                  })}
                  
                  {check.action && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <span className="font-medium text-yellow-800">Action Required: </span>
                      <span className="text-yellow-700">{check.action}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {results.callbackRoutes && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-3">Callback Routes to Add in Supabase Dashboard:</h3>
              <ul className="space-y-2">
                {results.callbackRoutes.map((route: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{route}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(route)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Production OAuth Fix Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to Supabase Dashboard → Authentication → URL Configuration</li>
              <li>Add ALL callback routes listed above to "Redirect URLs"</li>
              <li>Ensure "Site URL" is set to: https://covergen.pro</li>
              <li>In your code, use consistent PKCE flow (not implicit)</li>
              <li>Deploy and test on production URL (not localhost)</li>
              <li>Check browser console for any cookie warnings</li>
              <li>If using custom domain, update all URLs accordingly</li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}