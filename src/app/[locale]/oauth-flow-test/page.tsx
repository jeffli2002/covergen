'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function OAuthFlowTestPage() {
  const { user, signInWithGoogle } = useAuth()
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Test] ${message}`)
  }

  useEffect(() => {
    addLog(`Page loaded. User state: ${user ? user.email : 'null'}`)
  }, [user])

  const testOAuth = async () => {
    setIsLoading(true)
    addLog('Starting OAuth test...')
    
    try {
      const result = await signInWithGoogle()
      addLog(`OAuth result: ${JSON.stringify(result)}`)
    } catch (error) {
      addLog(`OAuth error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkCurrentState = async () => {
    addLog('Checking current auth state...')
    
    // Import and check the singleton client directly
    try {
      const { createSupabaseClient } = await import('@/lib/supabase-client')
      const supabase = createSupabaseClient()
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      addLog(`Current session: ${sessionData?.session ? 'Active' : 'None'}`)
      addLog(`Session user: ${sessionData?.session?.user?.email || 'null'}`)
      addLog(`Session error: ${sessionError?.message || 'none'}`)
      
      const { data: userData, error: userError } = await supabase.auth.getUser()
      addLog(`Current user: ${userData?.user?.email || 'null'}`)
      addLog(`User error: ${userError?.message || 'none'}`)
      
      // Check cookies
      const cookies = document.cookie
      const authCookies = cookies.split(';').filter(c => c.trim().startsWith('sb-'))
      addLog(`Auth cookies found: ${authCookies.length}`)
      authCookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        addLog(`- Cookie: ${name}`)
      })
      
    } catch (error) {
      addLog(`State check error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Flow Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <p className="mb-4">
            User: {user ? (
              <span className="text-green-600 font-medium">{user.email}</span>
            ) : (
              <span className="text-red-600">Not authenticated</span>
            )}
          </p>
          
          <div className="space-x-4">
            <button
              onClick={testOAuth}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing OAuth...' : 'Test OAuth Flow'}
            </button>
            
            <button
              onClick={checkCurrentState}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Check Current State
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No logs yet...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
          
          <button
            onClick={() => setLogs([])}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  )
}