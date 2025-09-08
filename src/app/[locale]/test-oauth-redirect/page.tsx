'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function TestOAuthRedirect() {
  const [testResults, setTestResults] = useState<any[]>([])
  
  const testRedirectUrl = async (redirectTo: string, description: string) => {
    console.log(`[Test] Testing OAuth with redirectTo: ${redirectTo}`)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true // Just get the URL, don't redirect
      }
    })
    
    const result = {
      description,
      redirectTo,
      success: !!data?.url,
      error: error?.message,
      generatedUrl: data?.url,
      timestamp: new Date().toISOString()
    }
    
    setTestResults(prev => [...prev, result])
    return result
  }
  
  const runAllTests = async () => {
    setTestResults([])
    
    const origin = window.location.origin
    const tests = [
      { url: origin, desc: 'Just origin (no path)' },
      { url: `${origin}/`, desc: 'Origin with trailing slash' },
      { url: `${origin}/en`, desc: 'Origin with /en' },
      { url: `${origin}/auth/callback`, desc: 'Origin with /auth/callback' },
      { url: window.location.href, desc: 'Current full URL' }
    ]
    
    for (const test of tests) {
      await testRedirectUrl(test.url, test.desc)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  const actualRedirect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    
    if (error) {
      alert(`OAuth Error: ${error.message}`)
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Redirect URL Testing</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          <strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
        </p>
        <p className="text-sm">
          <strong>Current Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}
        </p>
      </div>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={runAllTests}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Different Redirect URLs
        </button>
        
        <button
          onClick={actualRedirect}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Actually Sign In with Google
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div key={index} className={`p-3 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold text-sm">{result.description}</p>
              <p className="text-xs font-mono">{result.redirectTo}</p>
              {result.error && <p className="text-xs text-red-600 mt-1">Error: {result.error}</p>}
              {result.generatedUrl && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">View generated URL</summary>
                  <p className="text-xs break-all mt-1 bg-white p-2 rounded">
                    {result.generatedUrl}
                  </p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-100 rounded">
        <h2 className="font-bold mb-2">Common Issues:</h2>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Site URL must match exactly (no trailing slash)</li>
          <li>Google OAuth redirect URIs must include Supabase callback</li>
          <li>Check if locale (/en) is causing issues</li>
          <li>Ensure Google OAuth is enabled in Supabase</li>
        </ul>
      </div>
    </div>
  )
}