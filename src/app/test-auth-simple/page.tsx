'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthSimplePage() {
  const [status, setStatus] = useState<any>({})

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Get current URL info
    const urlInfo = {
      href: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      hasCode: !!new URLSearchParams(window.location.search).get('code'),
      hasError: !!new URLSearchParams(window.location.search).get('error')
    }

    // Check session
    let sessionInfo = {}
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      sessionInfo = {
        hasSession: !!session,
        user: session?.user?.email,
        error: error?.message
      }
    } catch (e) {
      sessionInfo = { error: String(e) }
    }

    // Check cookies
    const cookies = document.cookie.split(';').map(c => c.trim())
    const authCookies = cookies.filter(c => c.startsWith('sb-'))

    setStatus({
      url: urlInfo,
      session: sessionInfo,
      cookies: {
        total: cookies.length,
        auth: authCookies.length,
        names: authCookies.map(c => c.split('=')[0])
      }
    })
  }

  const testOAuth = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/test-auth-simple`
      }
    })
    if (error) alert(error.message)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Simple Auth Test</h1>
      <pre>{JSON.stringify(status, null, 2)}</pre>
      <button 
        onClick={testOAuth}
        style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}
      >
        Test OAuth
      </button>
      <button 
        onClick={checkAuth}
        style={{ marginLeft: '10px', padding: '10px 20px', fontSize: '16px' }}
      >
        Refresh
      </button>
    </div>
  )
}