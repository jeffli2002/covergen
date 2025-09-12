'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthSimpleTestPage() {
  const [status, setStatus] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
    console.log(`[OAuth Simple] ${message}`)
  }
  
  const testOAuth = async () => {
    setStatus('Testing...')
    setLogs([])
    
    try {
      // Step 1: Check cookies before
      addLog('Step 1: Checking cookies before OAuth...')
      const beforeCookies = document.cookie
      addLog(`Cookies before: ${beforeCookies.split(';').length} total`)
      
      // Step 2: Call signInWithOAuth
      addLog('Step 2: Calling signInWithOAuth...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/en/oauth-simple-test`
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        setStatus('Error')
        return
      }
      
      // Step 3: Check cookies after
      addLog('Step 3: Checking cookies after OAuth...')
      const afterCookies = document.cookie
      const supabaseCookies = afterCookies.split(';').filter(c => c.includes('sb-'))
      addLog(`Cookies after: ${supabaseCookies.length} Supabase cookies`)
      
      // List all Supabase cookies
      supabaseCookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        addLog(`  - ${name}`)
      })
      
      // Step 4: Check OAuth URL
      if (data?.url) {
        addLog('Step 4: Checking OAuth URL...')
        const url = new URL(data.url)
        const hasState = url.searchParams.has('state')
        addLog(`OAuth URL has state parameter: ${hasState ? '✅ YES' : '❌ NO'}`)
        
        if (hasState) {
          const stateValue = url.searchParams.get('state')
          addLog(`State value: ${stateValue}`)
          
          // Check if state cookie exists
          const hasStateCookie = document.cookie.includes('-state')
          addLog(`State cookie exists: ${hasStateCookie ? '✅ YES' : '❌ NO'}`)
        }
        
        setStatus('Success - Redirecting...')
        addLog('OAuth initiated successfully! Redirecting to Google...')
        
        // Redirect to OAuth provider
        window.location.href = data.url
      }
    } catch (err) {
      addLog(`Exception: ${err}`)
      setStatus('Error')
    }
  }
  
  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      addLog(`Session check error: ${error.message}`)
    } else if (session) {
      addLog(`Session found: ${session.user.email}`)
    } else {
      addLog('No session found')
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">OAuth Simple Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Simple OAuth Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is the simplest possible OAuth test using the default Supabase client.
        </p>
        <div className="space-y-4">
          <Button onClick={testOAuth} className="w-full">
            Test OAuth with Google
          </Button>
          <Button onClick={checkSession} variant="outline" className="w-full">
            Check Current Session
          </Button>
        </div>
        {status && (
          <p className={`mt-4 text-sm font-semibold ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            Status: {status}
          </p>
        )}
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.join('\n') || 'Click "Test OAuth with Google" to see logs'}
          </pre>
        </div>
      </Card>
    </div>
  )
}