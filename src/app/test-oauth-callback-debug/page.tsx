'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-simple'

export default function TestOAuthCallbackDebug() {
  const [logs, setLogs] = useState<string[]>([])
  
  useEffect(() => {
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString()
      setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    }
    
    const checkSupabaseSetup = async () => {
      addLog('Starting OAuth callback debug...')
      
      // Check environment variables
      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`)
      addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...`)
      
      // Check current URL
      addLog(`Current URL: ${window.location.href}`)
      const params = new URLSearchParams(window.location.search)
      addLog(`URL params: code=${params.get('code')?.substring(0, 10)}..., next=${params.get('next')}`)
      
      // Check localStorage
      const keys = Object.keys(localStorage)
      const supabaseKeys = keys.filter(k => k.includes('supabase') || k.startsWith('sb-'))
      addLog(`Found ${supabaseKeys.length} Supabase-related keys in localStorage`)
      
      // Look for code verifier
      let foundCodeVerifier = false
      supabaseKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key)
          if (value && (value.includes('code_verifier') || value.includes('codeVerifier'))) {
            foundCodeVerifier = true
            addLog(`Found code verifier in key: ${key}`)
          }
        } catch (e) {
          addLog(`Error reading key ${key}: ${e}`)
        }
      })
      
      if (!foundCodeVerifier) {
        addLog('WARNING: No code verifier found in localStorage!')
      }
      
      // Check Supabase client
      try {
        const { data: { session } } = await supabase.auth.getSession()
        addLog(`Current session: ${session ? 'exists' : 'none'}`)
        if (session) {
          addLog(`Session user: ${session.user?.email}`)
        }
      } catch (e: any) {
        addLog(`Error checking session: ${e.message}`)
      }
      
      // Try to simulate the exchange
      const code = params.get('code')
      if (code) {
        addLog('Attempting code exchange...')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            addLog(`Exchange error: ${error.message}`)
            addLog(`Error details: ${JSON.stringify(error)}`)
          } else {
            addLog('Exchange successful!')
            addLog(`Session created: ${data.session ? 'yes' : 'no'}`)
            addLog(`User: ${data.session?.user?.email || 'unknown'}`)
          }
        } catch (e: any) {
          addLog(`Exchange exception: ${e.message}`)
          addLog(`Stack: ${e.stack}`)
        }
      } else {
        addLog('No code parameter found in URL')
      }
    }
    
    checkSupabaseSetup()
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">OAuth Callback Debug</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Logs:</h2>
          <div className="space-y-2 font-mono text-sm">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-2 rounded ${
                  log.includes('ERROR') || log.includes('error') || log.includes('WARNING') 
                    ? 'bg-red-50 text-red-800' 
                    : log.includes('successful') || log.includes('exists')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-gray-50'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}