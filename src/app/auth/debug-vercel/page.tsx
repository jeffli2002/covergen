'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export default function DebugVercelAuthPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  const checkAuth = async () => {
    try {
      const supabase = createClient()
      
      // Get session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check cookies
      const cookies = document.cookie.split('; ')
      const authCookies = cookies.filter(c => 
        c.includes('sb-') || c.includes('supabase') || c.includes('auth')
      )
      
      // Check localStorage
      const localStorageKeys = Object.keys(localStorage).filter(k => 
        k.includes('sb-') || k.includes('supabase') || k.includes('auth')
      )
      
      const localStorageData: Record<string, any> = {}
      localStorageKeys.forEach(key => {
        try {
          localStorageData[key] = JSON.parse(localStorage.getItem(key) || 'null')
        } catch {
          localStorageData[key] = localStorage.getItem(key)
        }
      })
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        environment: {
          hostname: window.location.hostname,
          href: window.location.href,
          isVercelPreview: window.location.hostname.includes('vercel.app'),
          protocol: window.location.protocol,
          searchParams: Object.fromEntries(new URLSearchParams(window.location.search))
        },
        session: {
          exists: !!session,
          error: error?.message,
          user: session?.user?.email,
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider,
          expiresAt: session?.expires_at,
          expiresIn: session?.expires_in
        },
        user: {
          exists: !!user,
          error: userError?.message,
          email: user?.email,
          id: user?.id
        },
        cookies: {
          total: cookies.length,
          authCount: authCookies.length,
          authCookies: authCookies.map(c => {
            const [name, ...valueParts] = c.split('=')
            return {
              name,
              value: valueParts.join('=').substring(0, 50) + '...',
              length: valueParts.join('=').length
            }
          }),
          raw: document.cookie
        },
        localStorage: {
          authKeys: localStorageKeys,
          data: localStorageData
        }
      })
    } catch (err: any) {
      setDebugInfo({ error: err.message })
    } finally {
      setLoading(false)
    }
  }
  
  const testGoogleOAuth = async () => {
    const supabase = createClient()
    const currentPath = window.location.pathname
    const redirectUrl = `${window.location.origin}/auth/callback-vercel?next=${encodeURIComponent(currentPath)}`
    
    console.log('[Debug Vercel] Initiating OAuth with redirect:', redirectUrl)
    
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
      console.error('[Debug Vercel] OAuth error:', error)
      alert(`OAuth error: ${error.message}`)
    }
  }
  
  const signOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[Debug Vercel] Sign out error:', error)
      alert(`Sign out error: ${error.message}`)
    } else {
      window.location.reload()
    }
  }
  
  const testCookies = async () => {
    // Test setting cookies
    await fetch('/auth/test-vercel?test=cookies')
    
    // Wait a bit and read
    setTimeout(async () => {
      const response = await fetch('/auth/test-vercel?test=read')
      const data = await response.json()
      console.log('[Debug Vercel] Cookie test result:', data)
      alert(`Cookie test:\nTotal cookies: ${data.cookies.length}\nHas test cookie: ${data.hasTestCookie}\nHas SB cookies: ${data.hasSbCookies}`)
    }, 500)
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Vercel Auth Debug</h1>
      
      {/* Status */}
      <div className={`mb-6 p-4 rounded-lg ${debugInfo.session?.exists ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-xl font-bold mb-2">
          {debugInfo.session?.exists ? '✅ Authenticated' : '❌ Not Authenticated'}
        </h2>
        {debugInfo.session?.exists && (
          <div>
            <p>User: {debugInfo.session.user}</p>
            <p>Provider: {debugInfo.session.provider}</p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="mb-8 space-x-4">
        {!debugInfo.session?.exists ? (
          <Button onClick={testGoogleOAuth} size="lg">
            Test Google OAuth
          </Button>
        ) : (
          <Button onClick={signOut} variant="destructive">
            Sign Out
          </Button>
        )}
        <Button onClick={() => checkAuth()} variant="outline">
          Refresh
        </Button>
        <Button onClick={testCookies} variant="outline">
          Test Cookies
        </Button>
      </div>
      
      {/* Debug Output */}
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Environment</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Session</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Cookies</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(debugInfo.cookies, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">LocalStorage</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}