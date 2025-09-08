'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabaseClient-simple'
import { Button } from '@/components/ui/button'

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function gatherDebugInfo() {
      const supabaseClient = supabase
      
      // Gather all debug information
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: {
          hostname: window.location.hostname,
          isVercelPreview: window.location.hostname.includes('vercel.app'),
          protocol: window.location.protocol,
          pathname: window.location.pathname,
          search: window.location.search,
          nodeEnv: process.env.NODE_ENV
        },
        cookies: {
          all: document.cookie,
          authCookies: document.cookie.split('; ').filter(c => 
            c.includes('sb-') || 
            c.includes('supabaseClient') || 
            c.includes('auth-')
          ),
          count: document.cookie.split('; ').length
        },
        localStorage: {
          keys: Object.keys(localStorage),
          authKeys: Object.keys(localStorage).filter(k => 
            k.includes('supabaseClient') || 
            k.includes('auth') || 
            k.includes('covergen')
          )
        }
      }

      // Check Supabase session
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        info.session = {
          exists: !!session,
          error: error?.message,
          user: session?.user?.email,
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider,
          expiresAt: session?.expires_at
        }
      } catch (e) {
        info.session = { error: String(e) }
      }

      // Check Supabase auth state
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser()
        info.user = {
          exists: !!user,
          error: error?.message,
          email: user?.email,
          id: user?.id,
          provider: user?.app_metadata?.provider
        }
      } catch (e) {
        info.user = { error: String(e) }
      }

      // Test cookie access
      info.cookieTest = {
        canRead: document.cookie.length > 0,
        canWrite: false
      }
      
      try {
        document.cookie = 'test-cookie=test-value; path=/; max-age=10'
        info.cookieTest.canWrite = document.cookie.includes('test-cookie')
        // Clean up test cookie
        document.cookie = 'test-cookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      } catch (e) {
        info.cookieTest.writeError = String(e)
      }

      setDebugInfo(info)
      setLoading(false)
    }

    gatherDebugInfo()
  }, [])

  const refreshDebugInfo = () => {
    setLoading(true)
    window.location.reload()
  }

  const signOut = async () => {
    const supabaseClient = supabase
    await supabaseClient.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Information</h1>
        
        {/* Actions */}
        <div className="mb-8 space-x-4">
          <Button onClick={refreshDebugInfo}>Refresh</Button>
          <Button onClick={signOut} variant="destructive">Sign Out</Button>
          <Button 
            onClick={() => window.location.href = '/en?auth=signin'}
            variant="outline"
          >
            Sign In
          </Button>
        </div>

        {/* Environment Info */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Environment</h2>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </div>

        {/* Session Info */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Session Status</h2>
          <div className={`mb-4 p-4 rounded ${debugInfo.session?.exists ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-bold">
              {debugInfo.session?.exists ? '✅ Session Active' : '❌ No Session'}
            </p>
            {debugInfo.session?.user && (
              <p className="text-sm mt-2">User: {debugInfo.session.user}</p>
            )}
          </div>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo.session, null, 2)}
          </pre>
        </div>

        {/* User Info */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Status</h2>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo.user, null, 2)}
          </pre>
        </div>

        {/* Cookie Info */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Cookies</h2>
          <div className="mb-4">
            <p>Total cookies: {debugInfo.cookies?.count || 0}</p>
            <p>Auth cookies: {debugInfo.cookies?.authCookies?.length || 0}</p>
            <p>Can read cookies: {debugInfo.cookieTest?.canRead ? '✅' : '❌'}</p>
            <p>Can write cookies: {debugInfo.cookieTest?.canWrite ? '✅' : '❌'}</p>
          </div>
          <h3 className="font-bold mb-2">Auth Cookies:</h3>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo.cookies?.authCookies, null, 2)}
          </pre>
        </div>

        {/* LocalStorage Info */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">LocalStorage</h2>
          <p className="mb-2">Total keys: {debugInfo.localStorage?.keys?.length || 0}</p>
          <h3 className="font-bold mb-2">Auth Keys:</h3>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo.localStorage?.authKeys, null, 2)}
          </pre>
        </div>

        {/* Raw Debug Output */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Full Debug Info</h2>
          <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}