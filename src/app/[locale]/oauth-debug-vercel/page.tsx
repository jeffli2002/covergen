'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

export default function OAuthDebugVercelPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [sessionData, setSessionData] = useState<any>(null)
  const [serverSession, setServerSession] = useState<any>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Debug] ${message}`)
  }

  const checkServerSession = async () => {
    addLog('Checking server-side session...')
    try {
      const response = await fetch('/api/check-session')
      const data = await response.json()
      setServerSession(data)
      addLog(`Server session: ${data.session ? 'Found' : 'Not found'}`)
      if (data.session) {
        addLog(`Server user: ${data.session.user.email}`)
      }
      addLog(`Server cookies: ${JSON.stringify(data.cookies)}`)
    } catch (error) {
      addLog(`Server check error: ${error}`)
    }
  }

  const checkClientSession = async () => {
    addLog('Checking client-side session...')
    try {
      const supabase = createSupabaseBrowser()
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Client error: ${error.message}`)
      } else if (session) {
        setSessionData(session)
        addLog(`Client session found: ${session.user.email}`)
        addLog(`Provider: ${session.user.app_metadata?.provider}`)
      } else {
        addLog('No client session found')
      }
      
      addLog(`Browser cookies: ${document.cookie || 'None'}`)
    } catch (error) {
      addLog(`Client check error: ${error}`)
    }
  }

  const startOAuthFlow = async () => {
    addLog('Starting OAuth flow...')
    const supabase = createSupabaseBrowser()
    const currentUrl = window.location.href
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentUrl)}`
    
    addLog(`Redirect URL: ${redirectUrl}`)
    
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
      addLog(`OAuth error: ${error.message}`)
    } else {
      addLog('OAuth flow initiated')
    }
  }

  const clearAll = async () => {
    addLog('Clearing all auth data...')
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Debug - Vercel</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Actions */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={checkServerSession}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Check Server Session
              </button>
              <button
                onClick={checkClientSession}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Check Client Session
              </button>
              <button
                onClick={startOAuthFlow}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Start OAuth Flow
              </button>
              <button
                onClick={clearAll}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Clear All & Reload
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Session Info</h2>
            <div className="space-y-4">
              {/* Client Session */}
              <div>
                <h3 className="font-medium text-gray-700">Client Session</h3>
                {sessionData ? (
                  <div className="mt-2 p-3 bg-green-50 rounded text-sm">
                    <p><strong>User:</strong> {sessionData.user.email}</p>
                    <p><strong>ID:</strong> {sessionData.user.id}</p>
                    <p><strong>Provider:</strong> {sessionData.user.app_metadata?.provider}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No client session</p>
                )}
              </div>

              {/* Server Session */}
              <div>
                <h3 className="font-medium text-gray-700">Server Session</h3>
                {serverSession?.session ? (
                  <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                    <p><strong>User:</strong> {serverSession.session.user.email}</p>
                    <p><strong>ID:</strong> {serverSession.session.user.id}</p>
                    <p><strong>Provider:</strong> {serverSession.session.user.provider}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No server session</p>
                )}
              </div>

              {/* Cookies */}
              {serverSession?.cookies && (
                <div>
                  <h3 className="font-medium text-gray-700">Cookies</h3>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    <p><strong>Total:</strong> {serverSession.cookies.count}</p>
                    <p><strong>Supabase:</strong> {serverSession.cookies.supabaseCookies.join(', ') || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet. Click actions above to start debugging.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="py-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Debug Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>Click "Check Server Session" to see if cookies are being read server-side</li>
            <li>Click "Check Client Session" to see if Supabase client detects session</li>
            <li>Click "Start OAuth Flow" to test the complete OAuth process</li>
            <li>After OAuth redirect, check both sessions again</li>
            <li>If sessions don't match or are missing, check the logs for details</li>
          </ol>
        </div>
      </div>
    </div>
  )
}