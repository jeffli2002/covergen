'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signInWithGoogleAction } from '@/app/actions/auth'

export default function ChromeOAuthDebugPage() {
  const [cookies, setCookies] = useState<Record<string, string>>({})
  const [userAgent, setUserAgent] = useState('')
  const [isChrome, setIsChrome] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check browser info
    const ua = navigator.userAgent
    setUserAgent(ua)
    setIsChrome(/Chrome/.test(ua) && !/Edge/.test(ua))

    // Get all cookies
    const cookieObj: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name) {
        cookieObj[name] = value || ''
      }
    })
    setCookies(cookieObj)

    // Check session
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      if (!supabase) {
        setError('Supabase client not initialized')
        setLoading(false)
        return
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        setError(error.message)
      } else {
        setSession(session)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testGoogleOAuth = async () => {
    try {
      const currentPath = window.location.pathname
      await signInWithGoogleAction(currentPath)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const refreshSession = async () => {
    setLoading(true)
    await checkSession()
  }

  const clearAuthCookies = () => {
    // Clear all Supabase cookies
    Object.keys(cookies).forEach(name => {
      if (name.startsWith('sb-')) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=None; Secure`
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
      }
    })
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Chrome OAuth Debug Page</h1>

      {/* Browser Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-2">
            <strong>User Agent:</strong> <code className="text-sm">{userAgent}</code>
          </p>
          <p>
            <strong>Is Chrome:</strong> {isChrome ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </div>

      {/* Session Status */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Session Status</h2>
        {loading ? (
          <p>Loading session...</p>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="bg-gray-100 p-4 rounded">
            {session ? (
              <>
                <p className="mb-2 text-green-600">✅ Authenticated</p>
                <p><strong>User:</strong> {session.user?.email}</p>
                <p><strong>Provider:</strong> {session.user?.app_metadata?.provider}</p>
                <p><strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
              </>
            ) : (
              <p className="text-red-600">❌ Not authenticated</p>
            )}
          </div>
        )}
      </div>

      {/* Cookies */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">OAuth Cookies</h2>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          {Object.entries(cookies)
            .filter(([name]) => name.startsWith('sb-'))
            .map(([name, value]) => (
              <div key={name} className="mb-2">
                <p className="font-mono text-sm">
                  <strong>{name}:</strong> {value ? `${value.substring(0, 50)}...` : '(empty)'}
                </p>
              </div>
            ))}
          {Object.keys(cookies).filter(name => name.startsWith('sb-')).length === 0 && (
            <p>No Supabase cookies found</p>
          )}
        </div>
      </div>

      {/* Cookie Test */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Cookie Settings Test</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p className="mb-4">Testing SameSite=None cookie support...</p>
          <button
            onClick={() => {
              try {
                // Test setting a SameSite=None cookie
                document.cookie = 'test-samesite-none=test; SameSite=None; Secure; Path=/'
                const testCookie = document.cookie.includes('test-samesite-none=test')
                alert(testCookie 
                  ? '✅ SameSite=None cookies are supported!' 
                  : '❌ SameSite=None cookies are NOT supported or blocked!')
                // Clean up
                document.cookie = 'test-samesite-none=; Max-Age=0; Path=/; SameSite=None; Secure'
              } catch (err) {
                alert('Error testing cookies: ' + err)
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test SameSite=None Support
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="flex gap-4">
          <Button onClick={testGoogleOAuth} disabled={!!session}>
            Test Google OAuth
          </Button>
          
          <Button onClick={refreshSession} variant="outline">
            Refresh Session
          </Button>
          
          <Button onClick={clearAuthCookies} variant="destructive">
            Clear Auth Cookies
          </Button>
        </div>

        {session && (
          <Button 
            onClick={async () => {
              await supabase?.auth.signOut()
              window.location.reload()
            }}
            variant="outline"
          >
            Sign Out
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Chrome OAuth Fix Applied:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>All OAuth cookies now use <code>SameSite=None; Secure</code></li>
          <li>Enhanced cookie configuration in middleware and callback routes</li>
          <li>Consistent cookie handling across server and client</li>
          <li>HttpOnly flag added for security (server-side only)</li>
        </ul>
      </div>
    </div>
  )
}