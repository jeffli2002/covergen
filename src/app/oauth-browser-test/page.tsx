'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase-simple'

export default function OAuthBrowserTest() {
  const [browserInfo, setBrowserInfo] = useState<any>({})
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    runBrowserTest()
  }, [])
  
  const runBrowserTest = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Get browser info
      const info: any = {
        userAgent: navigator.userAgent,
        isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isEdge: /Edg/.test(navigator.userAgent),
        isFirefox: /Firefox/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        cookieEnabled: navigator.cookieEnabled,
        localStorage: {
          available: !!window.localStorage,
          keys: Object.keys(window.localStorage || {}),
          supabaseKeys: Object.keys(window.localStorage || {}).filter(k => k.includes('supabase'))
        },
        cookies: {
          all: document.cookie.split(';').map(c => c.trim().split('=')[0]),
          supabase: document.cookie.split(';')
            .filter(c => c.includes('sb-'))
            .map(c => c.trim().split('=')[0])
        }
      }
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setError(sessionError.message)
      } else {
        setSession(session)
      }
      
      // Check URL for OAuth response
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const searchParams = new URLSearchParams(window.location.search)
      
      info.urlInfo = {
        hasHash: window.location.hash.length > 0,
        hasCode: searchParams.has('code'),
        hasError: searchParams.has('error') || hashParams.has('error'),
        errorMessage: searchParams.get('error_description') || hashParams.get('error_description'),
        callbackDetected: window.location.pathname.includes('auth/callback')
      }
      
      setBrowserInfo(info)
      setLoading(false)
      
    } catch (err) {
      console.error('[Browser Test] Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }
  
  const signIn = async () => {
    try {
      const supabase = createSupabaseClient()
      
      // Use client-side callback page
      const redirectUrl = `${window.location.origin}/auth/callback?next=/oauth-browser-test`
      
      console.log('[Browser Test] Initiating OAuth with redirect:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'consent',
            access_type: 'offline'
          }
        }
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }
  
  const signOut = async () => {
    const supabase = createSupabaseClient()
    
    // Clear all auth data
    await supabase.auth.signOut()
    
    // Also clear localStorage manually
    Object.keys(window.localStorage).forEach(key => {
      if (key.includes('supabase')) {
        window.localStorage.removeItem(key)
      }
    })
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      if (c.includes('sb-')) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    })
    
    setSession(null)
    runBrowserTest()
  }
  
  const clearAllData = () => {
    // Clear everything
    window.localStorage.clear()
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.reload()
  }
  
  if (loading) {
    return <div className="p-8">Running browser test...</div>
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Browser Compatibility Test</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">Browser Detection:</h2>
        <p className="text-sm">
          {browserInfo.isChrome && '🌐 Chrome Browser'}
          {browserInfo.isEdge && '🌐 Edge Browser'}
          {browserInfo.isFirefox && '🦊 Firefox Browser'}
          {browserInfo.isSafari && '🧭 Safari Browser'}
        </p>
        <p className="text-xs text-gray-600 mt-1">{browserInfo.userAgent}</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">Error:</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      
      {session ? (
        <div className="mb-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
            <p className="text-green-800 font-semibold">Session Active</p>
            <p className="text-sm mt-1">User: {session.user.email}</p>
            <p className="text-xs text-gray-600">Provider: {session.user.app_metadata?.provider}</p>
          </div>
          <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Sign Out
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-gray-600 mb-4">No active session</p>
          <button onClick={signIn} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Sign In with Google
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">Cookie Status</h3>
          <div className="text-sm">
            <p>Enabled: {browserInfo.cookieEnabled ? '✅' : '❌'}</p>
            <p>Total cookies: {browserInfo.cookies?.all?.length || 0}</p>
            <p>Supabase cookies: {browserInfo.cookies?.supabase?.length || 0}</p>
            {browserInfo.cookies?.supabase?.map((name: string, i: number) => (
              <p key={i} className="text-xs text-gray-600">- {name}</p>
            ))}
          </div>
        </div>
        
        <div className="border rounded p-4">
          <h3 className="font-semibold mb-2">LocalStorage Status</h3>
          <div className="text-sm">
            <p>Available: {browserInfo.localStorage?.available ? '✅' : '❌'}</p>
            <p>Total keys: {browserInfo.localStorage?.keys?.length || 0}</p>
            <p>Supabase keys: {browserInfo.localStorage?.supabaseKeys?.length || 0}</p>
            {browserInfo.localStorage?.supabaseKeys?.map((key: string, i: number) => (
              <p key={i} className="text-xs text-gray-600 truncate">- {key}</p>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 border rounded p-4">
        <h3 className="font-semibold mb-2">URL Analysis</h3>
        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
          {JSON.stringify(browserInfo.urlInfo, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={clearAllData} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
        >
          Clear All Browser Data
        </button>
        <button 
          onClick={runBrowserTest} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Re-run Test
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">OAuth Browser Issues:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Chrome</strong>: Strict cookie policies, may block third-party cookies</li>
          <li>• <strong>Edge</strong>: Similar to Chrome but may have cached sessions</li>
          <li>• <strong>Session persistence</strong>: Ensure cookies have correct SameSite/Secure attributes</li>
          <li>• <strong>Clear data</strong>: Try clearing all data if OAuth fails</li>
        </ul>
      </div>
    </div>
  )
}