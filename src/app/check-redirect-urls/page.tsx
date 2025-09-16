'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckRedirectURLs() {
  const [results, setResults] = useState<any>({})
  
  const checkCurrentSetup = () => {
    const currentOrigin = window.location.origin
    const possibleRedirectURLs = [
      `${currentOrigin}/auth/callback`,
      `${currentOrigin}/auth/callback-production`,
      `${currentOrigin}/auth/callback/`,
      `${currentOrigin}/auth/callback-production/`,
      'http://localhost:3000/auth/callback',
      'http://localhost:3000/auth/callback-production',
      'http://localhost:3001/auth/callback',
      'http://localhost:3001/auth/callback-production',
      'https://covergen.pro/auth/callback',
      'https://covergen.pro/auth/callback-production'
    ]
    
    setResults({
      currentOrigin,
      redirectUrlInCode: `${currentOrigin}/auth/callback-production`,
      possibleRedirectURLs,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      important: [
        'The redirect URL in your code MUST match EXACTLY what is configured in Supabase Dashboard',
        'Go to: Supabase Dashboard → Authentication → URL Configuration → Redirect URLs',
        'Make sure one of these URLs is added there:',
        `- ${currentOrigin}/auth/callback-production`,
        '- https://covergen.pro/auth/callback-production'
      ]
    })
  }
  
  const testOAuthWithDebug = async () => {
    try {
      // Get the OAuth URL to inspect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production`,
          queryParams: {
            response_type: 'code'
          } as any,
          skipBrowserRedirect: true
        }
      })
      
      if (data?.url) {
        const url = new URL(data.url)
        const redirectUri = url.searchParams.get('redirect_uri')
        
        setResults({
          oauthUrl: data.url,
          redirectUriInOAuth: redirectUri ? decodeURIComponent(redirectUri) : 'NOT FOUND',
          allParams: Object.fromEntries(url.searchParams),
          checkThis: [
            'The redirect_uri parameter in the OAuth URL must match EXACTLY what is in Supabase Dashboard',
            'If they don\'t match, OAuth will fail'
          ]
        })
      }
    } catch (err) {
      setResults({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Check Redirect URLs Configuration</h1>
      
      <div className="mb-6 p-4 bg-red-50 rounded">
        <h2 className="font-semibold mb-2">⚠️ Critical Configuration:</h2>
        <p className="text-sm mb-2">
          The redirect URL must match EXACTLY between:
        </p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Your code (authService.ts)</li>
          <li>Supabase Dashboard → Authentication → URL Configuration → Redirect URLs</li>
        </ol>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={checkCurrentSetup}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
        >
          Check Current Setup
        </button>
        
        <button
          onClick={testOAuthWithDebug}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 w-full"
        >
          Test OAuth URL Generation
        </button>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="mt-6">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">To Fix "without sign in state" Error:</h3>
        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>
            Go to <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-600 underline">Supabase Dashboard</a>
          </li>
          <li>Navigate to: Authentication → URL Configuration</li>
          <li>Add these Redirect URLs:
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><code className="bg-gray-200 px-1">https://covergen.pro/auth/callback-production</code></li>
              <li><code className="bg-gray-200 px-1">http://localhost:3000/auth/callback-production</code> (for local dev)</li>
              <li><code className="bg-gray-200 px-1">http://localhost:3001/auth/callback-production</code> (if using port 3001)</li>
            </ul>
          </li>
          <li>Save the configuration</li>
        </ol>
      </div>
    </div>
  )
}