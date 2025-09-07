'use client'

import { useEffect, useState } from 'react'
import { createVercelOptimizedClient } from '@/lib/supabase/vercel-client'
import { Button } from '@/components/ui/button'

export default function VercelAuthTestPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    checkSession()
  }, [])
  
  const checkSession = async () => {
    try {
      const supabase = createVercelOptimizedClient()
      
      // Get current session
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      setSession(currentSession)
      setDebugInfo({
        timestamp: new Date().toISOString(),
        hasSession: !!currentSession,
        sessionError: error?.message,
        user: currentSession?.user?.email,
        userId: currentSession?.user?.id,
        expiresAt: currentSession?.expires_at,
        cookies: {
          all: document.cookie,
          authCookies: document.cookie.split('; ').filter(c => 
            c.includes('sb-') || c.includes('supabase') || c.includes('auth')
          ),
          count: document.cookie.split('; ').length
        },
        localStorage: Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('auth')),
        url: {
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          pathname: window.location.pathname,
          search: window.location.search
        },
        isVercelPreview: window.location.hostname.includes('vercel.app')
      })
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, newSession: any) => {
        console.log('[Vercel Auth Test] Auth state changed:', event, newSession?.user?.email)
        if (newSession) {
          setSession(newSession)
        }
      })
      
      return () => {
        subscription.unsubscribe()
      }
    } catch (err: any) {
      console.error('[Vercel Auth Test] Error:', err)
      setDebugInfo((prev: any) => ({ ...prev, error: err.message }))
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignIn = async () => {
    try {
      const supabase = createVercelOptimizedClient()
      
      // Get current path for redirect
      const currentPath = window.location.pathname
      const redirectUrl = `${window.location.origin}/auth/callback-vercel?next=${encodeURIComponent(currentPath)}`
      
      console.log('[Vercel Auth Test] Signing in with redirect:', redirectUrl)
      
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
      
      if (error) throw error
    } catch (err: any) {
      console.error('[Vercel Auth Test] Sign in error:', err)
      alert(`Sign in error: ${err.message}`)
    }
  }
  
  const handleSignOut = async () => {
    try {
      const supabase = createVercelOptimizedClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setSession(null)
      window.location.reload()
    } catch (err: any) {
      console.error('[Vercel Auth Test] Sign out error:', err)
      alert(`Sign out error: ${err.message}`)
    }
  }
  
  const refreshSession = async () => {
    setLoading(true)
    await checkSession()
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vercel Auth Test</h1>
        
        {/* Session Status */}
        <div className={`mb-8 p-6 rounded-lg ${session ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-xl font-bold mb-2">
            {session ? '✅ Authenticated' : '❌ Not Authenticated'}
          </h2>
          {session && (
            <div className="text-sm">
              <p>User: {session.user.email}</p>
              <p>ID: {session.user.id}</p>
              <p>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="mb-8 space-x-4">
          {!session ? (
            <Button onClick={handleSignIn} size="lg">
              Sign in with Google
            </Button>
          ) : (
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          )}
          <Button onClick={refreshSession} variant="outline">
            Refresh
          </Button>
        </div>
        
        {/* Debug Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Environment</h3>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                hostname: debugInfo.url?.hostname,
                protocol: debugInfo.url?.protocol,
                isVercelPreview: debugInfo.isVercelPreview,
                pathname: debugInfo.url?.pathname,
                search: debugInfo.url?.search
              }, null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Cookies ({debugInfo.cookies?.count || 0})</h3>
            <div className="mb-2 text-sm">
              Auth cookies: {debugInfo.cookies?.authCookies?.length || 0}
            </div>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
              {JSON.stringify(debugInfo.cookies?.authCookies || [], null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">LocalStorage Auth Keys</h3>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(debugInfo.localStorage || [], null, 2)}
            </pre>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4">Full Debug Info</h3>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}