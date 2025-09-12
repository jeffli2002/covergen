'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function OAuthCallbackDebugPage() {
  const [callbackLogs, setCallbackLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/auth-debug/callback-logs')
      const data = await response.json()
      setCallbackLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  const testOAuthFlow = async () => {
    setIsLoading(true)
    
    // Clear logs first
    setCallbackLogs([])
    
    // Add initial log
    await fetch('/api/auth-debug-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'oauth_start',
        origin: window.location.origin,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {})
    
    // Start OAuth flow
    const currentPath = window.location.pathname
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
    
    const { error } = await supabase.auth.signInWithOAuth({
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
      console.error('OAuth error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Callback Debug</h1>
      
      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <Button onClick={testOAuthFlow} disabled={isLoading}>
              {isLoading ? 'Redirecting...' : 'Test OAuth Flow'}
            </Button>
            <Button variant="outline" onClick={fetchLogs}>
              Refresh Logs
            </Button>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-refresh (every 2s)
            </label>
          </div>
          <div className="text-sm text-gray-600">
            {callbackLogs.length} logs
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 mb-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-2">How to Debug OAuth in Production</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Test OAuth Flow" to start the authentication process</li>
          <li>Complete the Google sign-in</li>
          <li>When redirected back, check the logs below to see what happened</li>
          <li>Look for errors in code exchange or cookie setting</li>
        </ol>
      </Card>

      {/* Current URL Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Page Info</h2>
        <div className="space-y-2 font-mono text-sm">
          <p>URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          <p>Has Code: {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('code') ? 'Yes' : 'No'}</p>
          <p>Has Error: {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') ? 'Yes' : 'No'}</p>
          {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') && (
            <p className="text-red-600">
              Error: {new URLSearchParams(window.location.search).get('error')} - {new URLSearchParams(window.location.search).get('error_description')}
            </p>
          )}
        </div>
      </Card>

      {/* Callback Logs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Callback Route Logs</h2>
        {callbackLogs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Try testing the OAuth flow.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {callbackLogs.map((log, index) => (
              <div key={index} className={`p-3 rounded text-sm font-mono ${
                log.error ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
              }`}>
                <div className="text-xs text-gray-600 mb-1">{log.timestamp}</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(log, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}