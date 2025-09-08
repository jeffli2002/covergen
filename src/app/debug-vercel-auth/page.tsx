'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function DebugVercelAuth() {
  const [debugInfo, setDebugInfo] = useState<any>({
    loading: true,
    environment: {},
    cookies: {},
    localStorage: {},
    session: null,
    error: null,
    refreshAttempts: []
  })

  useEffect(() => {
    async function gatherDebugInfo() {
      try {
        // Environment info
        const environment = {
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          pathname: window.location.pathname,
          isVercelPreview: window.location.hostname.includes('vercel.app'),
          userAgent: navigator.userAgent
        }

        // Cookie info
        const cookies: any = {}
        document.cookie.split('; ').forEach(cookie => {
          const [name, value] = cookie.split('=')
          if (name.includes('sb-') || name.includes('auth') || name.includes('supabase')) {
            cookies[name] = value ? value.substring(0, 50) + '...' : 'empty'
          }
        })

        // LocalStorage info
        const localStorage: any = {}
        const keys = Object.keys(window.localStorage)
        keys.forEach(key => {
          if (key.includes('sb-') || key.includes('supabase') || key === 'coverimage_session') {
            const value = window.localStorage.getItem(key)
            localStorage[key] = value ? value.substring(0, 50) + '...' : 'empty'
          }
        })

        // Supabase session
        const supabaseClient = supabase
        let session = null
        let error = null
        const refreshAttempts: any[] = []

        // Try to get session multiple times
        for (let attempt = 1; attempt <= 5; attempt++) {
          const attemptInfo: any = {
            attempt,
            timestamp: new Date().toISOString()
          }

          try {
            const { data, error: sessionError } = await supabaseClient.auth.getSession()
            attemptInfo.hasSession = !!data.session
            attemptInfo.error = sessionError?.message
            
            if (data.session) {
              session = {
                userId: data.session.user.id,
                email: data.session.user.email,
                provider: data.session.user.app_metadata?.provider,
                hasAccessToken: !!data.session.access_token,
                hasRefreshToken: !!data.session.refresh_token,
                expiresAt: data.session.expires_at,
                expiresIn: data.session.expires_in
              }
              break
            } else if (sessionError) {
              error = sessionError
            }
          } catch (err: any) {
            attemptInfo.error = err.message
          }

          refreshAttempts.push(attemptInfo)
          
          if (attempt < 5 && !session) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }

        // Try to refresh session if no session found
        if (!session) {
          try {
            const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession()
            refreshAttempts.push({
              attempt: 'refresh',
              timestamp: new Date().toISOString(),
              hasSession: !!refreshData.session,
              error: refreshError?.message
            })
            
            if (refreshData.session) {
              session = {
                userId: refreshData.session.user.id,
                email: refreshData.session.user.email,
                provider: refreshData.session.user.app_metadata?.provider,
                hasAccessToken: !!refreshData.session.access_token,
                hasRefreshToken: !!refreshData.session.refresh_token,
                expiresAt: refreshData.session.expires_at,
                expiresIn: refreshData.session.expires_in,
                refreshed: true
              }
            }
          } catch (err: any) {
            refreshAttempts.push({
              attempt: 'refresh',
              timestamp: new Date().toISOString(),
              error: err.message
            })
          }
        }

        setDebugInfo({
          loading: false,
          environment,
          cookies,
          localStorage,
          session,
          error,
          refreshAttempts,
          timestamp: new Date().toISOString()
        })
      } catch (error: any) {
        setDebugInfo((prev: any) => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
    }

    gatherDebugInfo()
    
    // Refresh debug info every 5 seconds
    const interval = setInterval(gatherDebugInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  if (debugInfo.loading) {
    return <div className="p-8">Loading debug information...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Vercel Auth Debug</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.environment, null, 2)}</pre>
        </section>

        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Auth Cookies</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.cookies, null, 2)}</pre>
        </section>

        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">LocalStorage</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.localStorage, null, 2)}</pre>
        </section>

        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Session Status</h2>
          {debugInfo.session ? (
            <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.session, null, 2)}</pre>
          ) : (
            <p className="text-red-600">No active session found</p>
          )}
        </section>

        <section className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Refresh Attempts</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.refreshAttempts, null, 2)}</pre>
        </section>

        {debugInfo.error && (
          <section className="bg-red-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
            <p className="text-red-600">{debugInfo.error}</p>
          </section>
        )}

        <section className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button
              onClick={async () => {
                const supabaseClient = supabase
                try {
                  await supabaseClient.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=/debug-vercel-auth`,
                      queryParams: {
                        access_type: 'offline',
                        prompt: 'consent'
                      }
                    }
                  })
                } catch (error: any) {
                  alert(`OAuth error: ${error.message}`)
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Google OAuth
            </button>
            <button
              onClick={async () => {
                const supabaseClient = supabase
                await supabaseClient.auth.signOut()
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </section>

        <section className="text-gray-500 text-sm">
          <p>Last updated: {debugInfo.timestamp}</p>
          <p>Page auto-refreshes every 5 seconds</p>
        </section>
      </div>
    </div>
  )
}