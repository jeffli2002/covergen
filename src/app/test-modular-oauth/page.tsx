'use client'

import { OAuthProvider, OAuthButton, OAuthStatus, useOAuth } from '@/modules/auth/oauth'
import { useEffect, useState } from 'react'

function OAuthTest() {
  const { user, loading, error, session, onAuthChange } = useOAuth()
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }
  
  useEffect(() => {
    addLog('OAuth Test Component Mounted')
    addLog(`Initial State - User: ${user?.email || 'null'}, Loading: ${loading}`)
    
    const unsubscribe = onAuthChange((authUser) => {
      addLog(`Auth Change Event - User: ${authUser?.email || 'null'}`)
    })
    
    return () => {
      addLog('OAuth Test Component Unmounting')
      unsubscribe()
    }
  }, [])
  
  useEffect(() => {
    addLog(`State Updated - User: ${user?.email || 'null'}, Loading: ${loading}, Error: ${error?.message || 'none'}`)
  }, [user, loading, error])
  
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Modular OAuth Test</h1>
      
      {/* Status Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">OAuth Status</h2>
        <OAuthStatus showDetails className="mb-4" />
        <div className="space-y-2 text-sm">
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>User:</strong> {user?.email || 'Not signed in'}</div>
          <div><strong>Provider:</strong> {user?.provider || 'N/A'}</div>
          <div><strong>Session:</strong> {session ? 'Active' : 'None'}</div>
          {error && <div className="text-red-600"><strong>Error:</strong> {error.message}</div>}
        </div>
      </div>
      
      {/* Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="space-x-4">
          <OAuthButton 
            provider="google"
            onSuccess={() => addLog('OAuth button success callback')}
            onError={(err) => addLog(`OAuth button error: ${err.message}`)}
          />
        </div>
      </div>
      
      {/* Debug Logs */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={log.includes('Error') ? 'text-red-600' : ''}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TestModularOAuthPage() {
  return (
    <OAuthProvider config={{
      providers: ['google'],
      onSuccess: (user) => console.log('Provider config - User signed in:', user),
      onError: (error) => console.error('Provider config - OAuth error:', error)
    }}>
      <OAuthTest />
    </OAuthProvider>
  )
}