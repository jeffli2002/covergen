'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestOAuthPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    addLog('Page loaded')
    if (loading) {
      addLog('Auth context is loading')
    } else if (user) {
      addLog(`User authenticated: ${user.email}`)
    } else {
      addLog('No authenticated user')
    }
  }, [user, loading])


  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google OAuth...')
      setError(null)
      await signInWithGoogle()
      addLog('OAuth initiated via AuthContext')
    } catch (err) {
      addLog(`OAuth error: ${err}`)
      setError(String(err))
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">OAuth Test Page - Enhanced Debug</h1>
        
        <div className="mb-6">
          <h2 className="font-semibold mb-2">Authentication Status:</h2>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p>Loading auth state...</p>
            </div>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✓ Signed in successfully</p>
              <div className="bg-gray-100 p-4 rounded">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Not signed in</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {user ? (
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          ) : (
            <Button onClick={handleGoogleSignIn} className="w-full">
              Sign in with Google
            </Button>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Debug Logs:</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-400">No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Environment Info:</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
        </div>
      </Card>
    </div>
  )
}