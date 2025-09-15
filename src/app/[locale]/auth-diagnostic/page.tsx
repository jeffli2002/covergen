'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AuthDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Run diagnostics immediately
    console.log('[AuthDiagnostic] Page loaded')
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    console.log('[AuthDiagnostic] Running diagnostics...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabase: {},
      browser: {},
      network: {}
    }

    // Check environment variables
    results.environment = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
    }

    // Check if we can access Supabase URL
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
        results.supabase = {
          url: url.href,
          hostname: url.hostname,
          projectRef: url.hostname.split('.')[0]
        }
      } catch (e) {
        results.supabase = { error: 'Invalid Supabase URL format' }
      }
    } else {
      results.supabase = { error: 'No Supabase URL configured' }
    }

    // Browser info
    results.browser = {
      userAgent: navigator.userAgent,
      location: {
        href: window.location.href,
        origin: window.location.origin,
        hostname: window.location.hostname,
        pathname: window.location.pathname
      },
      cookies: document.cookie ? 'Present' : 'None'
    }

    // Try to fetch from API
    try {
      const response = await fetch('/api/auth/debug-oauth')
      if (response.ok) {
        results.network.apiCheck = 'SUCCESS'
        results.network.apiData = await response.json()
      } else {
        results.network.apiCheck = `FAILED: ${response.status}`
      }
    } catch (e: any) {
      results.network.apiCheck = `ERROR: ${e.message}`
    }

    console.log('[AuthDiagnostic] Results:', results)
    setDiagnostics(results)
    setLoading(false)
  }

  const testDirectAuth = () => {
    console.log('[AuthDiagnostic] Testing direct auth...')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      alert('Supabase URL is not configured!')
      return
    }

    const redirectUrl = `${window.location.origin}/auth/callback?next=${window.location.pathname}`
    const authUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
    
    console.log('[AuthDiagnostic] Auth URL:', authUrl)
    window.location.href = authUrl
  }

  const StatusIcon = ({ value }: { value: any }) => {
    if (value === 'SET' || value === 'SUCCESS') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (value === 'MISSING' || value?.toString().includes('ERROR')) return <XCircle className="w-4 h-4 text-red-500" />
    return <AlertCircle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Auth System Diagnostic</CardTitle>
            <CardDescription>
              Checking your authentication configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Running diagnostics...</p>
              </div>
            ) : (
              <>
                {/* Environment Check */}
                <div>
                  <h3 className="font-semibold mb-3">Environment Variables</h3>
                  <div className="space-y-2">
                    {Object.entries(diagnostics.environment || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{key}</span>
                        <div className="flex items-center gap-2">
                          <StatusIcon value={value} />
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supabase Check */}
                <div>
                  <h3 className="font-semibold mb-3">Supabase Configuration</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(diagnostics.supabase, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Browser Info */}
                <div>
                  <h3 className="font-semibold mb-3">Browser Information</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(diagnostics.browser, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Network Check */}
                <div>
                  <h3 className="font-semibold mb-3">Network Check</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(diagnostics.network, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button onClick={runDiagnostics} variant="outline">
                    Re-run Diagnostics
                  </Button>
                  <Button 
                    onClick={testDirectAuth}
                    disabled={!process.env.NEXT_PUBLIC_SUPABASE_URL}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Test Direct Auth
                  </Button>
                  <Button
                    onClick={async () => {
                      console.log('[AuthDiagnostic] Testing Supabase client creation...')
                      try {
                        const { createBrowserClient } = await import('@supabase/ssr')
                        const supabase = createBrowserClient(
                          process.env.NEXT_PUBLIC_SUPABASE_URL!,
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                        )
                        console.log('[AuthDiagnostic] Supabase client created successfully')
                        
                        const { data, error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=/en/auth-diagnostic`
                          }
                        })
                        
                        console.log('[AuthDiagnostic] OAuth result:', { data, error })
                      } catch (e: any) {
                        console.error('[AuthDiagnostic] Error:', e)
                        alert(`Error: ${e.message}`)
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Test Inline OAuth
                  </Button>
                </div>

                {/* Warning if environment not configured */}
                {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Critical:</strong> Supabase environment variables are not configured. 
                      Authentication will not work without these settings.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}