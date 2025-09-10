'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import authService from '@/services/authService'

export default function TestOAuthFix() {
  const [logs, setLogs] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        addLog('Starting auth check...')
        
        // Check for multiple client instances warning
        const consoleWarnOriginal = console.warn
        console.warn = (...args) => {
          if (args[0]?.includes('Multiple GoTrueClient')) {
            addLog('WARNING: Multiple GoTrueClient instances detected!')
          }
          consoleWarnOriginal(...args)
        }

        // Initialize auth service
        addLog('Initializing auth service...')
        await authService.initialize()
        
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          addLog(`User found: ${currentUser.email}`)
          setUser(currentUser)
        } else {
          addLog('No user found')
        }

        // Check Supabase session directly
        addLog('Checking Supabase session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          addLog(`Supabase session error: ${error.message}`)
        } else if (session) {
          addLog(`Supabase session found: ${session.user.email}`)
        } else {
          addLog('No Supabase session')
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          addLog(`Auth state change: ${event}, user: ${session?.user?.email || 'none'}`)
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
        })

        return () => {
          subscription.unsubscribe()
          console.warn = consoleWarnOriginal
        }
      } catch (error) {
        addLog(`Error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google sign-in...')
      const result = await authService.signInWithGoogle()
      
      if (result && 'success' in result) {
        if (result.success) {
          addLog('Google sign-in initiated successfully')
        } else {
          addLog(`Google sign-in failed: ${(result as any).error || 'Unknown error'}`)
        }
      } else {
        addLog('Google sign-in returned unexpected result')
      }
    } catch (error) {
      addLog(`Google sign-in error: ${error}`)
    }
  }

  const handleSignOut = async () => {
    try {
      addLog('Starting sign out...')
      const result = await authService.signOut()
      
      if (result.success) {
        addLog('Sign out successful')
        setUser(null)
      } else {
        addLog(`Sign out failed: ${result.error}`)
      }
    } catch (error) {
      addLog(`Sign out error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Fix Test Page</h1>
        
        {/* User Status */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
            <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {!user && (
              <button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                Sign in with Google
              </button>
            )}
            {user && (
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={log.includes('WARNING') ? 'text-red-600' : ''}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}