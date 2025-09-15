'use client'

import { useState } from 'react'

export default function OAuthDebug() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  const runQuickTest = async () => {
    addLog('Starting quick OAuth diagnostic...')
    
    // Test environment variables
    addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`)
    addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`)
    
    // Test client creation
    try {
      const { supabase } = await import('@/lib/supabase-client')
      addLog(`Supabase client: ${supabase ? 'INITIALIZED' : 'NULL'}`)
      
      if (supabase) {
        addLog(`Auth available: ${!!supabase.auth}`)
        addLog(`signInWithOAuth: ${typeof supabase.auth.signInWithOAuth}`)
        
        // Test OAuth URL generation
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: true
          }
        })
        
        if (error) {
          addLog(`OAuth ERROR: ${error.message}`)
        } else if (data?.url) {
          addLog(`OAuth URL: SUCCESS`)
        } else {
          addLog(`OAuth URL: NO URL RETURNED`)
        }
      }
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>OAuth Quick Debug</h1>
      <button onClick={runQuickTest} style={{ padding: '10px', marginBottom: '20px' }}>
        Run Quick Test
      </button>
      <button onClick={() => setLogs([])} style={{ padding: '10px', marginLeft: '10px', marginBottom: '20px' }}>
        Clear
      </button>
      
      <div style={{ 
        backgroundColor: '#000', 
        color: '#0f0', 
        padding: '10px', 
        height: '400px', 
        overflowY: 'auto',
        fontSize: '12px'
      }}>
        {logs.length === 0 ? 'Click "Run Quick Test" to start...' : logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  )
}