'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SimpleOAuthTest() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  const testBasicFunctionality = async () => {
    addLog('=== Testing Basic Functionality ===')
    
    try {
      // Test 1: Check if we can access window object
      addLog(`Window available: ${typeof window !== 'undefined'}`)
      addLog(`Current URL: ${window.location.href}`)
      
      // Test 2: Check environment variables
      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`)
      addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`)
      
      // Test 3: Import supabase client
      addLog('Importing Supabase client...')
      const { supabase } = await import('@/lib/supabase-client')
      addLog(`Supabase client imported: ${!!supabase}`)
      
      if (!supabase) {
        addLog('ERROR: Supabase client is null!')
        return
      }
      
      addLog(`Supabase client type: ${typeof supabase}`)
      addLog(`Has auth property: ${!!supabase.auth}`)
      addLog(`signInWithOAuth type: ${typeof supabase.auth.signInWithOAuth}`)
      
      // Test 4: Try to call signInWithOAuth with skipBrowserRedirect
      addLog('Testing OAuth URL generation...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/simple-oauth-test`,
          skipBrowserRedirect: true
        }
      })
      
      addLog(`OAuth test result - error: ${!!error}`)
      addLog(`OAuth test result - data: ${!!data}`)
      addLog(`OAuth test result - url: ${data?.url ? 'generated' : 'missing'}`)
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        addLog(`Error details: ${JSON.stringify(error)}`)
      }
      
      if (data?.url) {
        addLog(`SUCCESS: OAuth URL generated: ${data.url.substring(0, 100)}...`)
      }
      
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
      addLog(`Stack: ${error.stack}`)
    }
  }

  const testActualOAuth = async () => {
    addLog('=== Testing Actual OAuth Redirect ===')
    
    try {
      const { supabase } = await import('@/lib/supabase-client')
      
      if (!supabase) {
        addLog('ERROR: Supabase client not available')
        return
      }
      
      addLog('Initiating OAuth redirect...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/simple-oauth-test`,
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        addLog(`OAuth ERROR: ${error.message}`)
      } else {
        addLog('OAuth initiated - should redirect now')
      }
      
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  const testAuthService = async () => {
    addLog('=== Testing Auth Service ===')
    
    try {
      addLog('Importing authService...')
      const authService = (await import('@/services/authService')).default
      
      addLog('Calling authService.signInWithGoogle()...')
      const result = await authService.signInWithGoogle()
      
      addLog(`AuthService result: ${JSON.stringify(result)}`)
      
    } catch (error: any) {
      addLog(`AuthService ERROR: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Simple OAuth Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testBasicFunctionality} variant="outline">
                Test Basic Functionality
              </Button>
              <Button onClick={testActualOAuth} className="bg-blue-600 hover:bg-blue-700 text-white">
                Test Actual OAuth
              </Button>
              <Button onClick={testAuthService} className="bg-green-600 hover:bg-green-700 text-white">
                Test Auth Service
              </Button>
              <Button onClick={() => setLogs([])} variant="ghost">
                Clear Logs
              </Button>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Logs:</h3>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet. Click a test button to start.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}