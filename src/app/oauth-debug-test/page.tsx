'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthDebugTest() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    console.log(`[OAuth Debug ${timestamp}] ${message}`)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const testSupabaseDirectly = async () => {
    try {
      addLog('Starting direct Supabase OAuth test...')
      
      // Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      addLog(`Supabase URL: ${supabaseUrl ? 'SET' : 'MISSING'}`)
      addLog(`Supabase Key: ${supabaseKey ? 'SET' : 'MISSING'}`)
      
      if (!supabaseUrl || !supabaseKey) {
        addLog('ERROR: Missing Supabase environment variables')
        return
      }
      
      // Import and create client
      addLog('Importing @supabase/ssr...')
      const { createBrowserClient } = await import('@supabase/ssr')
      
      addLog('Creating Supabase client...')
      const supabase = createBrowserClient(supabaseUrl, supabaseKey)
      
      // Prepare redirect URL
      const redirectTo = `${window.location.origin}/auth/callback?next=/oauth-debug-test`
      addLog(`Redirect URL: ${redirectTo}`)
      
      // Attempt OAuth
      addLog('Calling signInWithOAuth...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true // Get URL first
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        addLog(`Error details: ${JSON.stringify(error)}`)
        return
      }
      
      if (data?.url) {
        addLog(`OAuth URL generated: ${data.url}`)
        addLog('Redirecting in 2 seconds...')
        
        setTimeout(() => {
          window.location.href = data.url
        }, 2000)
      } else {
        addLog('ERROR: No OAuth URL returned')
        addLog(`Data: ${JSON.stringify(data)}`)
      }
      
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
      addLog(`Stack: ${error.stack}`)
    }
  }

  const testAuthService = async () => {
    try {
      addLog('Starting AuthService test...')
      
      // Import auth service
      addLog('Importing authService...')
      const authService = (await import('@/services/authService')).default
      
      addLog('Checking if authService is initialized...')
      await authService.initialize()
      
      addLog('Calling signInWithGoogle...')
      const result = await authService.signInWithGoogle()
      
      addLog(`Result: ${JSON.stringify(result)}`)
      
      if (!result.success) {
        addLog(`ERROR: ${result.error}`)
      }
      
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
      addLog(`Stack: ${error.stack}`)
    }
  }

  const testManualRedirect = () => {
    try {
      addLog('Testing manual redirect...')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        addLog('ERROR: No Supabase URL')
        return
      }
      
      const redirectTo = encodeURIComponent(`${window.location.origin}/auth/callback?next=/oauth-debug-test`)
      const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
      
      addLog(`Auth URL: ${authUrl}`)
      addLog('Redirecting in 2 seconds...')
      
      setTimeout(() => {
        window.location.href = authUrl
      }, 2000)
      
    } catch (error: any) {
      addLog(`EXCEPTION: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>OAuth Debug Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={testSupabaseDirectly} variant="outline">
                Test Supabase Directly
              </Button>
              <Button onClick={testAuthService} variant="outline">
                Test Auth Service
              </Button>
              <Button onClick={testManualRedirect} variant="outline">
                Test Manual Redirect
              </Button>
              <Button onClick={() => setLogs([])} variant="ghost">
                Clear Logs
              </Button>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Debug Logs:</h3>
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