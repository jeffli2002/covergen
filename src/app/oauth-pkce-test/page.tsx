'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function OAuthPKCETest() {
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState('Ready')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const testPKCEOAuth = async () => {
    try {
      setStatus('Initiating PKCE OAuth flow...')
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'pkce', // Force PKCE flow
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      )
      
      const redirectUrl = `${window.location.origin}/auth/callback-production`
      
      console.log('[PKCE Test] Using redirect URL:', redirectUrl)
      console.log('[PKCE Test] Client config:', { flowType: 'pkce' })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'email profile',
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        console.error('[PKCE Test] OAuth error:', error)
        setStatus(`Error: ${error.message}`)
      } else {
        console.log('[PKCE Test] OAuth initiated:', data)
        setStatus('Redirecting to Google...')
      }
      
    } catch (err) {
      console.error('[PKCE Test] Unexpected error:', err)
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
  
  const testImplicitOAuth = async () => {
    try {
      setStatus('Initiating Implicit OAuth flow...')
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: 'implicit', // Force implicit flow
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      )
      
      const redirectUrl = `${window.location.origin}/auth/hash-handler`
      
      console.log('[Implicit Test] Using redirect URL:', redirectUrl)
      console.log('[Implicit Test] Client config:', { flowType: 'implicit' })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        console.error('[Implicit Test] OAuth error:', error)
        setStatus(`Error: ${error.message}`)
      } else {
        console.log('[Implicit Test] OAuth initiated:', data)
        setStatus('Redirecting to Google...')
      }
      
    } catch (err) {
      console.error('[Implicit Test] Unexpected error:', err)
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }
  
  if (!mounted) {
    return <div className="p-8">Loading...</div>
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth PKCE vs Implicit Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <p className="font-semibold mb-2">Current Issue:</p>
        <p className="text-sm">Your OAuth is using implicit flow (tokens in URL hash #) instead of PKCE flow (code in URL params ?).</p>
        <p className="text-sm mt-2">This test will try both flows explicitly.</p>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
      </div>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testPKCEOAuth}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Test PKCE Flow (Recommended)
          </button>
          <p className="text-xs text-gray-600 mt-1">Should redirect to: /auth/callback-production?code=...</p>
        </div>
        
        <div>
          <button
            onClick={testImplicitOAuth}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
          >
            Test Implicit Flow (Current)
          </button>
          <p className="text-xs text-gray-600 mt-1">Will redirect to: /auth/hash-handler#access_token=...</p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Flow Differences:</h3>
        <div className="text-sm space-y-2">
          <div>
            <strong>PKCE Flow:</strong>
            <ul className="ml-4 list-disc">
              <li>Returns authorization code in URL params (?code=...)</li>
              <li>Server can exchange code for tokens</li>
              <li>More secure, recommended approach</li>
              <li>Works with server-side callbacks</li>
            </ul>
          </div>
          <div>
            <strong>Implicit Flow:</strong>
            <ul className="ml-4 list-disc">
              <li>Returns tokens in URL hash (#access_token=...)</li>
              <li>Only client-side code can read hash</li>
              <li>Less secure, being phased out</li>
              <li>Requires client-side callback handler</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Check browser console (F12) for detailed logs.</p>
        <p>Current Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      </div>
    </div>
  )
}