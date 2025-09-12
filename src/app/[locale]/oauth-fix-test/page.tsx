'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function OAuthFixTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const checkCookies = () => {
    const allCookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies = allCookies.filter(c => c.startsWith('sb-'))
    setCookies(supabaseCookies)
    addLog(`Found ${supabaseCookies.length} Supabase cookies`)
    supabaseCookies.forEach(c => {
      addLog(`  - ${c.split('=')[0]}`)
    })
  }

  const testOAuthWithFixedClient = async () => {
    addLog('Creating fixed Supabase client...')
    
    // Create a new client with detectSessionInUrl enabled
    const fixedClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true, // ENABLE this for OAuth
          flowType: 'pkce',
          debug: true // Enable debug logs
        },
        global: {
          headers: {
            'X-Debug': 'oauth-fix-test'
          }
        }
      }
    )
    
    addLog('Fixed client created with detectSessionInUrl: true')
    
    // Check current session
    try {
      const { data: { session }, error } = await fixedClient.auth.getSession()
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else if (session) {
        addLog(`Existing session found: ${session.user.email}`)
      } else {
        addLog('No existing session')
      }
    } catch (err) {
      addLog(`Session check exception: ${err}`)
    }
    
    // Start OAuth
    addLog('Starting OAuth with fixed client...')
    const currentPath = window.location.pathname
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
    
    addLog(`Redirect URL: ${redirectUrl}`)
    
    const { data, error } = await fixedClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      addLog(`OAuth error: ${error.message}`)
    } else {
      addLog('OAuth initiated successfully')
      addLog(`OAuth URL: ${data?.url}`)
    }
  }

  const testDirectOAuthUrl = () => {
    addLog('Testing direct OAuth URL construction...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const currentPath = window.location.pathname
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`
    
    // Construct OAuth URL manually
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?` + new URLSearchParams({
      provider: 'google',
      redirect_to: redirectUrl,
      access_type: 'offline',
      prompt: 'consent',
      response_type: 'code',
      code_challenge_method: 'S256'
    }).toString()
    
    addLog(`Manual OAuth URL: ${oauthUrl}`)
    addLog('Redirecting in 3 seconds...')
    
    setTimeout(() => {
      window.location.href = oauthUrl
    }, 3000)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Fix Test</h1>
      
      {/* Current State */}
      <Card className="p-6 mb-6 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">⚠️ Key Issue Found</h2>
        <p className="mb-2">The Supabase client has <code>detectSessionInUrl: false</code> which may be preventing proper OAuth handling.</p>
        <p>This page tests OAuth with a fixed configuration.</p>
      </Card>

      {/* Cookies */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Cookies</h2>
        <Button onClick={checkCookies} className="mb-4">Check Cookies</Button>
        {cookies.length > 0 ? (
          <div className="font-mono text-sm space-y-1">
            {cookies.map((cookie, i) => (
              <p key={i} className="text-green-600">{cookie.split('=')[0]}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No Supabase cookies found</p>
        )}
      </Card>

      {/* Actions */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">OAuth Tests</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={testOAuthWithFixedClient}>
              Test OAuth with Fixed Client
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Uses a Supabase client with detectSessionInUrl: true
            </p>
          </div>
          
          <div>
            <Button onClick={testDirectOAuthUrl} variant="outline">
              Test Direct OAuth URL (Manual)
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Constructs OAuth URL manually and redirects
            </p>
          </div>
        </div>
      </Card>

      {/* Logs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={log.includes('error') || log.includes('Error') ? 'text-red-400' : ''}>
                {log}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}