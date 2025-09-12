'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthFixAttemptPage() {
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }
  
  const testWithCustomClient = async () => {
    setLogs([])
    
    try {
      addLog('Creating custom Supabase client with explicit PKCE configuration...')
      
      // Create a fresh client with explicit configuration
      const customClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
            flowType: 'pkce',
            debug: true // Enable debug mode
          },
          cookies: {
            get(name: string) {
              const cookies = document.cookie.split(';')
              for (const cookie of cookies) {
                const [cookieName, ...valueParts] = cookie.trim().split('=')
                if (cookieName === name) {
                  return valueParts.join('=')
                }
              }
              return undefined
            },
            set(name: string, value: string, options?: any) {
              addLog(`Setting cookie: ${name} (length: ${value?.length || 0})`)
              const cookieParts = [`${name}=${encodeURIComponent(value)}`]
              
              if (options?.maxAge) {
                cookieParts.push(`Max-Age=${options.maxAge}`)
              }
              
              cookieParts.push(`Path=${options?.path || '/'}`)
              
              // Always use parent domain for production
              if (window.location.hostname.includes('covergen.pro')) {
                cookieParts.push('Domain=.covergen.pro')
              }
              
              // Use None for OAuth flows
              cookieParts.push('SameSite=None')
              
              if (window.location.protocol === 'https:') {
                cookieParts.push('Secure')
              }
              
              document.cookie = cookieParts.join('; ')
            },
            remove(name: string, options?: any) {
              addLog(`Removing cookie: ${name}`)
              const cookieParts = [`${name}=`]
              cookieParts.push('Max-Age=0')
              cookieParts.push(`Path=${options?.path || '/'}`)
              
              if (window.location.hostname.includes('covergen.pro')) {
                cookieParts.push('Domain=.covergen.pro')
              }
              
              document.cookie = cookieParts.join('; ')
            }
          }
        }
      )
      
      addLog('Initiating OAuth with custom client...')
      
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      addLog(`Redirect URL: ${redirectUrl}`)
      
      const { data, error } = await customClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          skipBrowserRedirect: true // Get the URL without redirecting
        }
      })
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        return
      }
      
      if (data?.url) {
        addLog(`OAuth URL generated: ${data.url.substring(0, 150)}...`)
        
        // Parse the URL to check for state parameter
        try {
          const oauthUrl = new URL(data.url)
          const params = Object.fromEntries(oauthUrl.searchParams.entries())
          addLog(`OAuth URL parameters:`)
          Object.entries(params).forEach(([key, value]) => {
            if (key === 'state') {
              addLog(`  ${key}: ${value}`)
            } else {
              addLog(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`)
            }
          })
          
          // Check cookies after OAuth initiation
          const cookies = document.cookie.split(';').map(c => c.trim())
          const stateCookies = cookies.filter(c => 
            c.includes('state') || 
            c.includes('flow') || 
            c.includes('pkce') || 
            c.includes('code-verifier')
          )
          addLog(`State-related cookies after OAuth: ${stateCookies.length}`)
          stateCookies.forEach(cookie => {
            const [name] = cookie.split('=')
            addLog(`  ${name}`)
          })
          
        } catch (e) {
          addLog(`Failed to parse OAuth URL: ${e}`)
        }
      }
      
    } catch (err) {
      addLog(`EXCEPTION: ${err}`)
    }
  }
  
  const testDirectSupabaseCall = async () => {
    setLogs([])
    
    try {
      addLog('Testing direct Supabase API call...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json'
        }
      })
      
      addLog(`Response status: ${response.status}`)
      addLog(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)
      
      if (response.headers.get('location')) {
        const location = response.headers.get('location')!
        addLog(`Redirect location: ${location.substring(0, 150)}...`)
        
        // Parse redirect URL
        try {
          const url = new URL(location)
          const state = url.searchParams.get('state')
          addLog(`State in redirect: ${state || 'NOT FOUND'}`)
        } catch (e) {
          addLog(`Failed to parse redirect URL`)
        }
      }
      
    } catch (err) {
      addLog(`API call error: ${err}`)
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Fix Attempt</h1>
      
      <Card className="p-6 mb-6 bg-yellow-50">
        <h2 className="text-lg font-semibold mb-4">⚠️ Testing OAuth State Issue</h2>
        <p className="text-sm mb-4">
          Based on debugging, Supabase is not including a state parameter in the OAuth URL.
          This page tests potential fixes.
        </p>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Tests</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={testWithCustomClient}>
              Test with Custom Client Configuration
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Creates a fresh client with explicit PKCE settings and debug mode
            </p>
          </div>
          
          <div>
            <Button onClick={testDirectSupabaseCall} variant="outline">
              Test Direct Supabase API Call
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Makes a direct API call to Supabase auth endpoint
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.join('\n') || 'Click a button above to start testing'}
          </pre>
        </div>
      </Card>
    </div>
  )
}