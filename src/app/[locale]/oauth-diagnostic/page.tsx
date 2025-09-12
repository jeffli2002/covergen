'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthDiagnosticPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')
      
      if (code || error) {
        setTestResults(prev => ({
          ...prev,
          urlParams: {
            hasCode: !!code,
            codeLength: code?.length || 0,
            error: error,
            allParams: Object.fromEntries(urlParams)
          }
        }))
      }
    }
  }, [])

  const runOAuthTest = async () => {
    setIsLoading(true)
    try {
      // Test the OAuth configuration
      const response = await fetch('/api/test-callback')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const testDirectOAuth = () => {
    // This will test OAuth with the expected redirect
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
    
    // Log what we're about to do
    console.log('[OAuth Test] Initiating with redirect:', redirectUrl)
    
    // Construct the Supabase OAuth URL manually
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`
    
    // Store test info
    setTestResults(prev => ({
      ...prev,
      manualTest: {
        redirectUrl,
        oauthUrl,
        timestamp: new Date().toISOString()
      }
    }))
    
    // Redirect to OAuth
    window.location.href = oauthUrl
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Diagnostic</h1>

      {/* Quick Status */}
      <Card className="p-6 mb-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-4">Current Page Status</h2>
        <div className="space-y-2 text-sm">
          <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          <p><strong>Has OAuth Code:</strong> {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('code') ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Has Error:</strong> {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') ? '❌ Yes' : '✅ No'}</p>
        </div>
      </Card>

      {/* Test Actions */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">OAuth Tests</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={runOAuthTest} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test OAuth Configuration'}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will check the OAuth redirect URL configuration
            </p>
          </div>
          
          <div>
            <Button onClick={testDirectOAuth} variant="outline">
              Test Direct OAuth Flow
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will manually redirect to Google OAuth with the correct callback URL
            </p>
          </div>
        </div>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
          
          {testResults.diagnosis?.mismatch && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-semibold">⚠️ Redirect URL Mismatch Detected!</p>
              <p className="text-sm mt-2">
                Expected: <code>{testResults.diagnosis.expectedRedirect}</code>
              </p>
              <p className="text-sm">
                Actual: <code>{testResults.diagnosis.actualRedirect}</code>
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Critical Issue Found */}
      <Card className="p-6 mt-6 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">🔍 Potential Issue Found</h2>
        <div className="space-y-2 text-sm">
          <p>The Supabase client has <code>detectSessionInUrl: false</code> which prevents automatic OAuth handling.</p>
          <p>This means the client won't process OAuth codes even if they're in the URL.</p>
          <p className="font-semibold mt-4">To fix this issue:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>The OAuth callback must go through <code>/auth/callback</code> route</li>
            <li>The callback route must properly exchange the code for a session</li>
            <li>Cookies must be set correctly for the domain</li>
          </ol>
        </div>
      </Card>
    </div>
  )
}