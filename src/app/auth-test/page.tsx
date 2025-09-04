'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthTest() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[AuthTest] ${message}`)
  }

  useEffect(() => {
    // Check if we have URL params from a failed auth attempt
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('error')) {
      addLog(`URL Error: ${urlParams.get('error')} - ${urlParams.get('message') || 'No message'}`)
    }
    
    // Check current session
    checkSession()
  }, [])

  const checkSession = async () => {
    if (!supabase) {
      addLog('ERROR: Supabase client is null!')
      return
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else if (session) {
        addLog(`Logged in as: ${session.user.email}`)
      } else {
        addLog('No active session')
      }
    } catch (err: any) {
      addLog(`Unexpected session error: ${err.message}`)
    }
  }

  const testGoogleAuth = async () => {
    addLog('Starting Google OAuth...')
    
    if (!supabase) {
      addLog('ERROR: Supabase client is null!')
      return
    }
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth-test`
      addLog(`Redirect URL: ${redirectTo}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        addLog(`OAuth Error: ${error.message}`)
      } else {
        addLog('OAuth initiated successfully')
        addLog(`Provider: ${data?.provider}`)
        addLog(`URL: ${data?.url}`)
      }
    } catch (err: any) {
      addLog(`Unexpected error: ${err.message}`)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out successfully')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm">
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
          </p>
          <p className="text-sm">
            <strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={testGoogleAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Google OAuth
          </button>
          
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Check Session
          </button>
          
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Logs:</h2>
          <div className="space-y-1 text-sm font-mono">
            {logs.map((log, i) => (
              <div key={i} className={log.includes('ERROR') ? 'text-red-600' : 'text-gray-700'}>
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded text-sm">
          <h3 className="font-bold mb-2">Troubleshooting:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser DevTools (F12) and check Console for errors</li>
            <li>Click "Test Google OAuth" and watch for popup blocker warnings</li>
            <li>Check if a new tab/window opens for Google sign-in</li>
            <li>After signing in with Google, you should be redirected back here</li>
          </ol>
        </div>
      </div>
    </div>
  )
}