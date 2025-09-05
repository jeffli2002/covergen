'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthSignOutTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }
  
  const checkCurrentState = async () => {
    addLog('Checking current state...')
    
    try {
      // Check session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else {
        addLog(`Session present: ${!!session}`)
        if (session) {
          addLog(`User: ${session.user.email}`)
          addLog(`Access token: ${session.access_token ? 'present' : 'missing'}`)
          addLog(`Expires at: ${new Date(session.expires_at! * 1000).toISOString()}`)
        }
      }
      
      // Check localStorage
      const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase') || key === 'coverimage_session'
      )
      addLog(`Found ${storageKeys.length} auth-related localStorage keys:`)
      storageKeys.forEach(key => {
        const value = localStorage.getItem(key)
        addLog(`  ${key}: ${value ? value.substring(0, 50) + '...' : 'empty'}`)
      })
      
      // Check user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        addLog(`User check error: ${userError.message}`)
      } else {
        addLog(`User present: ${!!user}`)
        if (user) {
          addLog(`User ID: ${user.id}`)
        }
      }
    } catch (error: any) {
      addLog(`Check state error: ${error.message}`)
    }
  }
  
  const performSignOut = async () => {
    addLog('Starting sign out process...')
    
    try {
      // First, get current state
      const { data: { session: beforeSession } } = await supabase.auth.getSession()
      addLog(`Session before signout: ${!!beforeSession}`)
      
      // Perform sign out
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
        return
      }
      
      addLog('Sign out call successful')
      
      // Check immediately after
      const { data: { session: afterSession } } = await supabase.auth.getSession()
      addLog(`Session after signout: ${!!afterSession}`)
      
      // Clear storage manually
      addLog('Clearing localStorage...')
      const keys = Object.keys(localStorage)
      let clearedCount = 0
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase') || key === 'coverimage_session') {
          localStorage.removeItem(key)
          clearedCount++
        }
      })
      addLog(`Cleared ${clearedCount} auth-related keys`)
      
      // Final check
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { data: { session: finalSession } } = await supabase.auth.getSession()
      addLog(`Session after 1 second: ${!!finalSession}`)
      
    } catch (error: any) {
      addLog(`Sign out error: ${error.message}`)
    }
  }
  
  const clearLogs = () => {
    setLogs([])
  }
  
  const refreshPage = () => {
    window.location.reload()
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Sign Out Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={checkCurrentState}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Check Current State
            </button>
            <button
              onClick={performSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Perform Sign Out
            </button>
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
            <button
              onClick={refreshPage}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Check Current State" to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}