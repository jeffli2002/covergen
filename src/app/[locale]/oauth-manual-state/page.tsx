'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthManualStatePage() {
  const [stateValue, setStateValue] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }
  
  const generateRandomState = () => {
    // Generate a random state similar to what Supabase might use
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '')
  }
  
  const setOAuthStateCookie = () => {
    const state = generateRandomState()
    setStateValue(state)
    
    // Try different cookie names that Supabase might use
    const cookieNames = [
      'sb-exungkcoaihcemcmhqdr-auth-token-state',
      'sb-exungkcoaihcemcmhqdr-auth-flow-state',
      'sb-exungkcoaihcemcmhqdr-auth-pkce-state'
    ]
    
    addLog(`Generated state: ${state}`)
    
    cookieNames.forEach(name => {
      // Try with domain
      const cookie1 = `${name}=${state}; Domain=.covergen.pro; Path=/; SameSite=None; Secure; Max-Age=3600`
      document.cookie = cookie1
      addLog(`Set cookie with domain: ${name}`)
      
      // Try without domain
      const cookie2 = `${name}-local=${state}; Path=/; SameSite=None; Secure; Max-Age=3600`
      document.cookie = cookie2
      addLog(`Set cookie without domain: ${name}-local`)
    })
    
    // Also set a test cookie to verify cookie setting works
    document.cookie = `oauth-state-test=${state}; Path=/; SameSite=Lax; Max-Age=3600`
    addLog('Set test cookie: oauth-state-test')
  }
  
  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim())
    addLog('=== Current Cookies ===')
    cookies.forEach(cookie => {
      if (cookie.includes('state') || cookie.includes('flow') || cookie.includes('pkce') || cookie.includes('test')) {
        addLog(cookie)
      }
    })
    addLog(`Total cookies: ${cookies.length}`)
  }
  
  const simulateCallback = async () => {
    if (!stateValue) {
      addLog('ERROR: No state value set. Set OAuth state cookie first.')
      return
    }
    
    // Simulate OAuth callback with state parameter
    const callbackUrl = `/api/auth-debug/echo?code=TEST_CODE&state=${stateValue}`
    addLog(`Calling: ${callbackUrl}`)
    
    try {
      const response = await fetch(callbackUrl)
      const data = await response.json()
      addLog('=== Callback Response ===')
      addLog(JSON.stringify(data, null, 2))
      
      // Check if state matches
      if (data.analysis?.stateMatches !== undefined) {
        addLog(`State match result: ${data.analysis.stateMatches ? '✅ MATCHES' : '❌ NO MATCH'}`)
      }
    } catch (err) {
      addLog(`Callback error: ${err}`)
    }
  }
  
  const clearStateCookies = () => {
    const cookieNames = [
      'sb-exungkcoaihcemcmhqdr-auth-token-state',
      'sb-exungkcoaihcemcmhqdr-auth-flow-state', 
      'sb-exungkcoaihcemcmhqdr-auth-pkce-state',
      'sb-exungkcoaihcemcmhqdr-auth-token-state-local',
      'sb-exungkcoaihcemcmhqdr-auth-flow-state-local',
      'sb-exungkcoaihcemcmhqdr-auth-pkce-state-local',
      'oauth-state-test'
    ]
    
    cookieNames.forEach(name => {
      // Clear with domain
      document.cookie = `${name}=; Domain=.covergen.pro; Path=/; Max-Age=0`
      // Clear without domain
      document.cookie = `${name}=; Path=/; Max-Age=0`
    })
    
    setStateValue('')
    addLog('Cleared all state cookies')
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Manual State Testing</h1>
      
      <Card className="p-6 mb-6 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">⚠️ Testing OAuth State Cookie</h2>
        <p className="text-sm mb-4">
          This page allows manual testing of OAuth state cookie behavior to debug the "invalid flow state" error.
        </p>
        {stateValue && (
          <div className="bg-white p-3 rounded border">
            <p className="text-sm font-mono">Current State: {stateValue}</p>
          </div>
        )}
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>
        <div className="space-y-3">
          <div>
            <Button onClick={setOAuthStateCookie}>
              1. Set OAuth State Cookie
            </Button>
            <p className="text-sm text-gray-600 mt-1">Generates and sets state cookies with different configurations</p>
          </div>
          
          <div>
            <Button onClick={checkCookies} variant="outline">
              2. Check Current Cookies
            </Button>
            <p className="text-sm text-gray-600 mt-1">Lists all state-related cookies</p>
          </div>
          
          <div>
            <Button onClick={simulateCallback} variant="outline">
              3. Simulate OAuth Callback
            </Button>
            <p className="text-sm text-gray-600 mt-1">Tests if state parameter matches cookie</p>
          </div>
          
          <div>
            <Button onClick={clearStateCookies} variant="destructive">
              Clear State Cookies
            </Button>
            <p className="text-sm text-gray-600 mt-1">Removes all test cookies</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.join('\n') || 'No logs yet. Click buttons above to start testing.'}
          </pre>
        </div>
      </Card>
    </div>
  )
}