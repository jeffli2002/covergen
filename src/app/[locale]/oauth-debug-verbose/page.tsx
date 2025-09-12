'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthDebugVerbosePage() {
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<any>({})
  const [sessionData, setSessionData] = useState<any>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  useEffect(() => {
    checkInitialState()
  }, [])

  const checkInitialState = () => {
    addLog('Page loaded')
    
    // Check URL
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    
    if (code) {
      addLog(`OAuth code detected: ${code.substring(0, 8)}...`)
    }
    if (error) {
      addLog(`OAuth error detected: ${error}`)
    }
    
    // Check cookies
    checkCookies()
  }

  const checkCookies = () => {
    const allCookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies: any = {}
    
    allCookies.forEach(cookie => {
      const [name, ...valueParts] = cookie.split('=')
      if (name.startsWith('sb-')) {
        const value = valueParts.join('=')
        supabaseCookies[name] = {
          length: value.length,
          preview: value.substring(0, 50) + '...'
        }
      }
    })
    
    setCookies(supabaseCookies)
    addLog(`Found ${Object.keys(supabaseCookies).length} Supabase cookies`)
    Object.keys(supabaseCookies).forEach(name => {
      addLog(`  - ${name} (${supabaseCookies[name].length} chars)`)
    })
  }

  const checkSessionManual = async () => {
    addLog('Starting manual session check...')
    
    try {
      // Import supabase fresh
      addLog('Importing Supabase client...')
      const { supabase } = await import('@/lib/supabase')
      addLog('Supabase client imported')
      
      // Check if auth is available
      if (!supabase.auth) {
        addLog('ERROR: supabase.auth is not available')
        return
      }
      addLog('supabase.auth is available')
      
      // Try to get session with timeout
      addLog('Calling getSession()...')
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout after 5s')), 5000)
      )
      
      const sessionPromise = supabase.auth.getSession()
      
      const result = await Promise.race([sessionPromise, timeoutPromise])
        .then((res: any) => {
          addLog('getSession() completed')
          return res
        })
        .catch((err) => {
          addLog(`getSession() error: ${err.message}`)
          throw err
        })
      
      if (result.error) {
        addLog(`Session error: ${result.error.message}`)
        setSessionData({ error: result.error.message })
      } else if (result.data?.session) {
        addLog(`Session found: ${result.data.session.user.email}`)
        setSessionData({
          user: result.data.session.user.email,
          provider: result.data.session.user.app_metadata?.provider,
          hasAccessToken: !!result.data.session.access_token,
          hasRefreshToken: !!result.data.session.refresh_token
        })
      } else {
        addLog('No session found')
        setSessionData({ noSession: true })
      }
      
    } catch (err) {
      addLog(`Exception during session check: ${err}`)
      setSessionData({ exception: String(err) })
    }
  }

  const testDirectSupabaseImport = async () => {
    addLog('Testing direct Supabase import...')
    
    try {
      // Test if we can even import
      const supabaseModule = await import('@/lib/supabase')
      addLog(`Import successful. Keys: ${Object.keys(supabaseModule).join(', ')}`)
      
      if (supabaseModule.supabase) {
        addLog('supabase export found')
        addLog(`Type: ${typeof supabaseModule.supabase}`)
        addLog(`Has auth property: ${!!supabaseModule.supabase.auth}`)
      } else {
        addLog('ERROR: No supabase export found')
      }
    } catch (err) {
      addLog(`Import error: ${err}`)
    }
  }

  const reconstructAuthToken = () => {
    addLog('Attempting to reconstruct auth token from chunks...')
    
    const chunks: string[] = []
    let index = 0
    
    // Look for token chunks
    while (true) {
      const chunkName = `sb-exungkcoaihcemcmhqdr-auth-token.${index}`
      const chunk = document.cookie
        .split(';')
        .find(c => c.trim().startsWith(`${chunkName}=`))
      
      if (!chunk) {
        break
      }
      
      const value = chunk.split('=')[1]
      chunks.push(value)
      addLog(`Found chunk ${index}: ${value.length} chars`)
      index++
    }
    
    if (chunks.length > 0) {
      const fullToken = chunks.join('')
      addLog(`Reconstructed token: ${fullToken.length} total chars`)
      
      try {
        const decoded = JSON.parse(decodeURIComponent(fullToken))
        addLog('Token decoded successfully')
        addLog(`Token type: ${typeof decoded}`)
        addLog(`Has access_token: ${!!decoded.access_token}`)
        addLog(`Has refresh_token: ${!!decoded.refresh_token}`)
        addLog(`Has user: ${!!decoded.user}`)
      } catch (err) {
        addLog(`Failed to decode token: ${err}`)
      }
    } else {
      addLog('No token chunks found')
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Debug (Verbose)</h1>
      
      {/* Current State */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <div className="space-y-2">
          <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          <p><strong>Cookies Found:</strong> {Object.keys(cookies).length}</p>
          {sessionData && (
            <div className="mt-2 p-3 bg-gray-100 rounded">
              <strong>Session Data:</strong>
              <pre className="text-sm">{JSON.stringify(sessionData, null, 2)}</pre>
            </div>
          )}
        </div>
      </Card>

      {/* Cookies */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supabase Cookies</h2>
        {Object.keys(cookies).length > 0 ? (
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(cookies).map(([name, info]: [string, any]) => (
              <div key={name} className="p-2 bg-gray-100 rounded">
                <p className="font-bold">{name}</p>
                <p className="text-xs">Length: {info.length} chars</p>
                <p className="text-xs text-gray-600">Preview: {info.preview}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No Supabase cookies found</p>
        )}
      </Card>

      {/* Actions */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={checkCookies}>
            Refresh Cookies
          </Button>
          <Button onClick={checkSessionManual} variant="outline">
            Check Session (Manual)
          </Button>
          <Button onClick={testDirectSupabaseImport} variant="outline">
            Test Supabase Import
          </Button>
          <Button onClick={reconstructAuthToken} variant="outline">
            Reconstruct Auth Token
          </Button>
        </div>
      </Card>

      {/* Debug Logs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={log.includes('ERROR') ? 'text-red-400' : ''}>{log}</div>
          ))}
        </div>
      </Card>
    </div>
  )
}