'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { OAuthProvider, OAuthButton, OAuthStatus, useOAuth } from '@/modules/auth/oauth'

function OAuthTestContent() {
  const { user, loading, error } = useOAuth()
  const [directSession, setDirectSession] = useState<any>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
  
  useEffect(() => {
    checkDirectSession()
  }, [])
  
  const checkDirectSession = async () => {
    try {
      addLog('Checking direct Supabase session...')
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Direct session error: ${error.message}`)
      } else if (session) {
        addLog(`Direct session found: ${session.user.email}`)
        setDirectSession(session)
      } else {
        addLog('No direct session found')
      }
    } catch (error) {
      addLog(`Error: ${error}`)
    }
  }
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">OAuth Test Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Modular OAuth Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Modular OAuth Module</h2>
          <div className="space-y-4">
            <OAuthStatus showDetails className="p-4 bg-gray-50 rounded" />
            <OAuthButton provider="google" className="w-full" />
            <div className="text-sm space-y-1">
              <p><strong>Status:</strong> {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}</p>
              <p><strong>Module Error:</strong> {error?.message || 'None'}</p>
            </div>
          </div>
        </div>
        
        {/* Direct Supabase Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Direct Supabase Access</h2>
          <div className="space-y-4">
            {directSession ? (
              <div className="p-4 bg-green-50 rounded">
                <p className="font-medium">Session Active</p>
                <p className="text-sm">{directSession.user.email}</p>
                <p className="text-sm text-gray-600">Provider: {directSession.user.app_metadata?.provider}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded">
                <p>No direct session</p>
              </div>
            )}
            <button
              onClick={async () => {
                addLog('Starting direct OAuth sign-in...')
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}` }
                })
                if (error) {
                  addLog(`OAuth error: ${error.message}`)
                } else {
                  addLog('OAuth initiated successfully')
                }
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign in (Direct Supabase)
            </button>
            <button
              onClick={checkDirectSession}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Refresh Session Check
            </button>
          </div>
        </div>
      </div>
      
      {/* Environment Info */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Environment Info</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}
          </div>
          <div>
            <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
          </div>
          <div>
            <strong>Site URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}
          </div>
          <div>
            <strong>Callback:</strong> {window.location.origin}/auth/callback
          </div>
        </div>
      </div>
      
      {/* Debug Logs */}
      <div className="mt-8 bg-gray-900 text-gray-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Debug Logs</h3>
        <div className="font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="py-1">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function OAuthTestDashboardPage() {
  return (
    <OAuthProvider config={{
      providers: ['google'],
      onSuccess: (user) => console.log('[OAuth Dashboard] Sign in success:', user.email),
      onError: (error) => console.error('[OAuth Dashboard] OAuth error:', error)
    }}>
      <OAuthTestContent />
    </OAuthProvider>
  )
}