'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AuthSessionDebugPage() {
  const [session, setSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(error.message)
      } else {
        setSession(session)
      }
      
      // Get all cookies
      const allCookies = document.cookie.split('; ').filter(c => c)
      setCookies(allCookies)
      
      // Log for debugging
      console.log('[Session Debug] Session:', session)
      console.log('[Session Debug] Cookies:', allCookies)
      console.log('[Session Debug] Auth cookies:', allCookies.filter(c => c.includes('sb-') || c.includes('supabase')))
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
    
    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Session Debug] Auth state change:', event, session)
      setSession(session)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    await checkSession()
  }

  const handleRefreshSession = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      setError(error.message)
    } else {
      setSession(data.session)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Auth Session Debug</h1>
      
      <div className="grid gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={checkSession} disabled={loading}>
                Refresh Session Info
              </Button>
              <Button onClick={handleRefreshSession} variant="outline" disabled={!session}>
                Force Refresh Token
              </Button>
              <Button onClick={handleSignOut} variant="destructive" disabled={!session}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>Current Supabase session state</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : session ? (
              <div className="space-y-2 text-sm">
                <div><strong>Status:</strong> <span className="text-green-600">Authenticated</span></div>
                <div><strong>User Email:</strong> {session.user?.email}</div>
                <div><strong>User ID:</strong> {session.user?.id}</div>
                <div><strong>Access Token:</strong> {session.access_token?.substring(0, 30)}...</div>
                <div><strong>Refresh Token:</strong> {session.refresh_token?.substring(0, 30)}...</div>
                <div><strong>Expires At:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</div>
                <div><strong>Time Until Expiry:</strong> {Math.round((session.expires_at! * 1000 - Date.now()) / 1000 / 60)} minutes</div>
              </div>
            ) : (
              <p className="text-gray-500">No active session</p>
            )}
          </CardContent>
        </Card>

        {/* Cookie Info */}
        <Card>
          <CardHeader>
            <CardTitle>Cookie Information</CardTitle>
            <CardDescription>All cookies in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">Auth-related Cookies:</h3>
              <div className="text-sm font-mono bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
                {cookies
                  .filter(c => c.includes('sb-') || c.includes('supabase') || c.includes('auth'))
                  .map((cookie, i) => (
                    <div key={i} className="mb-2 break-all">
                      {cookie.substring(0, 100)}{cookie.length > 100 && '...'}
                    </div>
                  ))}
                {cookies.filter(c => c.includes('sb-') || c.includes('supabase') || c.includes('auth')).length === 0 && (
                  <p className="text-gray-500">No auth-related cookies found</p>
                )}
              </div>
              
              <h3 className="font-semibold mt-4">All Cookies ({cookies.length}):</h3>
              <details>
                <summary className="cursor-pointer text-blue-600">Click to expand</summary>
                <div className="text-sm font-mono bg-gray-100 p-4 rounded max-h-64 overflow-y-auto mt-2">
                  {cookies.map((cookie, i) => (
                    <div key={i} className="mb-2 break-all">
                      {cookie.substring(0, 100)}{cookie.length > 100 && '...'}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {typeof window !== 'undefined' ? (
              <>
                <div><strong>Origin:</strong> {window.location.origin}</div>
                <div><strong>Hostname:</strong> {window.location.hostname}</div>
                <div><strong>Protocol:</strong> {window.location.protocol}</div>
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                <div><strong>Secure Context:</strong> {window.isSecureContext ? 'Yes' : 'No'}</div>
              </>
            ) : (
              <p className="text-gray-500">Environment info only available in browser</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}