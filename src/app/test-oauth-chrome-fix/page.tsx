'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestOAuthChromeFix() {
  const [status, setStatus] = useState('Ready to test')
  const [cookies, setCookies] = useState<string[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  
  useEffect(() => {
    // Check current cookies and session
    checkCurrentState()
  }, [])

  const checkCurrentState = async () => {
    // List all cookies
    const allCookies = document.cookie.split(';').map(c => c.trim())
    setCookies(allCookies)
    
    // Check session
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    setSessionInfo({
      hasSession: !!session,
      user: session?.user?.email,
      error: error?.message
    })
  }

  const handleGoogleLogin = async () => {
    try {
      setStatus('Starting Google OAuth...')
      
      const supabase = createClient()
      
      // Log browser info
      console.log('Browser:', navigator.userAgent)
      console.log('Chrome?', /Chrome/.test(navigator.userAgent))
      
      const redirectUrl = `${window.location.origin}/auth/callback?next=/test-oauth-chrome-fix`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setStatus(`Error: ${error.message}`)
        console.error('OAuth error:', error)
      } else {
        setStatus('Redirecting to Google...')
        console.log('OAuth initiated:', data)
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message}`)
      console.error('Unexpected error:', err)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chrome OAuth Fix Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Browser Info:</h2>
        <p className="text-sm font-mono">{navigator.userAgent}</p>
        <p className="mt-2">
          Browser: {/Chrome/.test(navigator.userAgent) ? '✅ Chrome' : /Edg/.test(navigator.userAgent) ? '✅ Edge' : '❓ Other'}
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        <pre className="text-sm">{JSON.stringify(sessionInfo, null, 2)}</pre>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 rounded">
        <h2 className="font-semibold mb-2">Current Cookies ({cookies.length}):</h2>
        <div className="text-xs font-mono max-h-40 overflow-auto">
          {cookies.map((cookie, i) => (
            <div key={i} className={cookie.includes('sb-') ? 'text-blue-600 font-semibold' : ''}>
              {cookie}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 p-4 bg-green-50 rounded">
        <h2 className="font-semibold mb-2">Status: {status}</h2>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGoogleLogin}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Google Login
        </button>
        
        <button
          onClick={checkCurrentState}
          className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh Status
        </button>
        
        {sessionInfo?.hasSession && (
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Chrome Cookie Fix Applied:</h3>
        <ul className="text-sm space-y-1">
          <li>✅ Client-side: SameSite=None for OAuth cookies</li>
          <li>✅ Server-side: SameSite=None in callback route</li>
          <li>✅ Secure flag always set for OAuth cookies</li>
          <li>✅ PKCE flow configured</li>
        </ul>
      </div>
    </div>
  )
}