'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function OAuthStateDebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
  
  const checkCookiesBefore = () => {
    const allCookies = document.cookie.split(';').map(c => c.trim())
    const stateCookies = allCookies.filter(c => 
      c.includes('state') || 
      c.includes('flow') || 
      c.includes('pkce') || 
      c.includes('code-verifier')
    )
    return {
      all: allCookies,
      state: stateCookies
    }
  }
  
  const testOAuthWithStateTracking = async () => {
    setLogs([]) // Clear previous logs
    
    try {
      // 1. Check cookies before OAuth
      addLog('=== Starting OAuth flow ===')
      const beforeCookies = checkCookiesBefore()
      addLog(`Cookies before OAuth: ${beforeCookies.all.length} total`)
      addLog(`State-related cookies: ${beforeCookies.state.join(', ') || 'NONE'}`)
      
      // 2. Hook into document.cookie setter to catch new cookies
      const originalSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.set
      let capturedCookies: string[] = []
      
      if (originalSetter) {
        Object.defineProperty(document, 'cookie', {
          set: function(value) {
            capturedCookies.push(value)
            addLog(`COOKIE SET: ${value.substring(0, 100)}...`)
            return originalSetter.call(this, value)
          },
          get: Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.get
        })
      }
      
      // 3. Initiate OAuth
      addLog('Calling signInWithOAuth...')
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      // 4. Log results
      if (error) {
        addLog(`ERROR: ${error.message}`)
      } else {
        addLog(`OAuth initiated successfully`)
        addLog(`URL: ${data?.url?.substring(0, 100)}...`)
      }
      
      // 5. Check cookies after OAuth call
      const afterCookies = checkCookiesBefore()
      addLog(`Cookies after OAuth: ${afterCookies.all.length} total`)
      addLog(`State-related cookies: ${afterCookies.state.join(', ') || 'NONE'}`)
      
      // 6. Log captured cookies
      addLog(`=== Captured cookie operations: ${capturedCookies.length} ===`)
      capturedCookies.forEach((cookie, i) => {
        addLog(`Cookie ${i + 1}: ${cookie.substring(0, 150)}...`)
      })
      
      // 7. Extract state from OAuth URL
      if (data?.url) {
        try {
          const oauthUrl = new URL(data.url)
          const state = oauthUrl.searchParams.get('state')
          addLog(`OAuth URL state parameter: ${state || 'NOT FOUND'}`)
          
          // Check if state matches any cookie
          const stateInCookies = afterCookies.all.some(c => state && c.includes(state))
          addLog(`State found in cookies: ${stateInCookies ? 'YES' : 'NO'}`)
        } catch (e) {
          addLog(`Failed to parse OAuth URL: ${e}`)
        }
      }
      
      // Restore original cookie setter
      if (originalSetter) {
        Object.defineProperty(document, 'cookie', {
          set: originalSetter,
          get: Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')?.get
        })
      }
      
    } catch (err) {
      addLog(`EXCEPTION: ${err}`)
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth State Cookie Debug</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">OAuth State Tracking Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          This test tracks cookie operations during OAuth initialization to identify where state cookies are set.
        </p>
        <Button onClick={testOAuthWithStateTracking}>
          Test OAuth with State Tracking
        </Button>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">Click the button above to start the test</p>
          ) : (
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          )}
        </div>
      </Card>
    </div>
  )
}