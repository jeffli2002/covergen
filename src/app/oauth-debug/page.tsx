'use client'

import { useEffect, useState } from 'react'

export default function OAuthDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    runDiagnostics()
  }, [])
  
  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabase: {},
      network: {},
      errors: []
    }
    
    try {
      // 1. Check environment variables
      results.environment = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
        NODE_ENV: process.env.NODE_ENV
      }
      
      // 2. Check if Supabase client can be created
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !key) {
          results.supabase.error = 'Missing environment variables'
          results.errors.push('Supabase credentials not found in environment')
        } else {
          const client = createClient(url, key)
          results.supabase.clientCreated = true
          
          // Test auth functionality
          const { data, error } = await client.auth.getSession()
          results.supabase.authTest = {
            success: !error,
            error: error?.message,
            hasSession: !!data?.session
          }
        }
      } catch (error) {
        results.supabase.error = String(error)
        results.errors.push(`Supabase client error: ${error}`)
      }
      
      // 3. Test network connectivity
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          results.network.supabaseHealth = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          }
        } catch (error) {
          results.network.error = String(error)
          results.errors.push(`Network error: ${error}`)
        }
      }
      
      // 4. Check browser info
      results.browser = {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: typeof localStorage !== 'undefined',
        location: {
          origin: window.location.origin,
          port: window.location.port || '80',
          protocol: window.location.protocol
        }
      }
      
    } catch (error) {
      results.errors.push(`Diagnostic error: ${error}`)
    }
    
    setDiagnostics(results)
    setLoading(false)
  }
  
  const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌'
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Debug Diagnostics</h1>
        
        {loading ? (
          <div>Running diagnostics...</div>
        ) : (
          <div className="space-y-6">
            {/* Environment Check */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Environment Variables</h2>
              <div className="space-y-2 font-mono text-sm">
                <div>{getStatusIcon(diagnostics.environment.NEXT_PUBLIC_SUPABASE_URL !== 'NOT SET')} NEXT_PUBLIC_SUPABASE_URL: {diagnostics.environment.NEXT_PUBLIC_SUPABASE_URL}</div>
                <div>{getStatusIcon(diagnostics.environment.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'NOT SET')} NEXT_PUBLIC_SUPABASE_ANON_KEY: {diagnostics.environment.NEXT_PUBLIC_SUPABASE_ANON_KEY}</div>
                <div>{getStatusIcon(diagnostics.environment.NEXT_PUBLIC_SITE_URL !== 'NOT SET')} NEXT_PUBLIC_SITE_URL: {diagnostics.environment.NEXT_PUBLIC_SITE_URL}</div>
                <div>NODE_ENV: {diagnostics.environment.NODE_ENV}</div>
              </div>
            </div>
            
            {/* Supabase Client Check */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Supabase Client</h2>
              <div className="space-y-2">
                <div>{getStatusIcon(diagnostics.supabase.clientCreated)} Client Creation: {diagnostics.supabase.clientCreated ? 'Success' : diagnostics.supabase.error}</div>
                {diagnostics.supabase.authTest && (
                  <>
                    <div>{getStatusIcon(diagnostics.supabase.authTest.success)} Auth Test: {diagnostics.supabase.authTest.success ? 'Working' : diagnostics.supabase.authTest.error}</div>
                    <div>Session: {diagnostics.supabase.authTest.hasSession ? 'Active' : 'None'}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* Network Check */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Network Connectivity</h2>
              <div className="space-y-2">
                {diagnostics.network.supabaseHealth ? (
                  <div>{getStatusIcon(diagnostics.network.supabaseHealth.ok)} Supabase Health: {diagnostics.network.supabaseHealth.status} {diagnostics.network.supabaseHealth.statusText}</div>
                ) : (
                  <div>❌ Network Error: {diagnostics.network.error || 'No Supabase URL to test'}</div>
                )}
              </div>
            </div>
            
            {/* Browser Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Browser Information</h2>
              <div className="space-y-2 text-sm">
                <div>{getStatusIcon(diagnostics.browser?.cookiesEnabled)} Cookies: {diagnostics.browser?.cookiesEnabled ? 'Enabled' : 'Disabled'}</div>
                <div>{getStatusIcon(diagnostics.browser?.localStorage)} LocalStorage: {diagnostics.browser?.localStorage ? 'Available' : 'Not available'}</div>
                <div>Origin: {diagnostics.browser?.location?.origin}</div>
                <div>Port: {diagnostics.browser?.location?.port}</div>
                <div>Protocol: {diagnostics.browser?.location?.protocol}</div>
              </div>
            </div>
            
            {/* Errors */}
            {diagnostics.errors.length > 0 && (
              <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
                <h2 className="text-lg font-semibold mb-4 text-red-900">Errors Found</h2>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  {diagnostics.errors.map((error: string, i: number) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommendations */}
            <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200">
              <h2 className="text-lg font-semibold mb-4 text-blue-900">Next Steps</h2>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                {!diagnostics.environment.NEXT_PUBLIC_SUPABASE_URL || diagnostics.environment.NEXT_PUBLIC_SUPABASE_URL === 'NOT SET' ? (
                  <li>Add Supabase credentials to your .env.local file</li>
                ) : null}
                {diagnostics.supabase.authTest && !diagnostics.supabase.authTest.success ? (
                  <li>Check Supabase project settings and ensure authentication is enabled</li>
                ) : null}
                <li>Ensure the callback URL <code className="bg-white px-2 py-1 rounded">{window.location.origin}/auth/callback</code> is added to Supabase</li>
                <li>Enable Google provider in Supabase Dashboard</li>
                <li>Add Google OAuth credentials to Supabase</li>
              </ol>
            </div>
            
            {/* Raw Data */}
            <details className="bg-gray-900 text-gray-100 p-6 rounded-lg">
              <summary className="cursor-pointer font-semibold">Raw Diagnostic Data</summary>
              <pre className="mt-4 text-xs overflow-auto">
{JSON.stringify(diagnostics, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}