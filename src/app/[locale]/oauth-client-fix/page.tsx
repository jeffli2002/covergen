'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthClientFixPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Fix] ${message}`)
  }
  
  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const supabaseCookies = cookies.filter(c => c.includes('sb-') || c.includes('supabase'))
    
    addLog(`=== Current Cookies (${supabaseCookies.length} Supabase cookies) ===`)
    supabaseCookies.forEach(cookie => {
      const [name, value] = cookie.split('=')
      addLog(`${name}: ${value?.substring(0, 50)}...`)
    })
    
    // Check specifically for state and code-verifier cookies
    const hasCodeVerifier = cookies.some(c => c.includes('code-verifier'))
    const hasState = cookies.some(c => c.includes('-state'))
    
    addLog(`Has code-verifier cookie: ${hasCodeVerifier}`)
    addLog(`Has state cookie: ${hasState}`)
    
    return { hasCodeVerifier, hasState }
  }
  
  const signInWithGoogleFixed = async () => {
    setIsProcessing(true)
    setLogs([])
    
    try {
      addLog('=== Starting Fixed OAuth Flow ===')
      addLog('Creating fresh Supabase client...')
      
      // Create a fresh client to ensure clean state
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Keep false as we handle callback server-side
            flowType: 'pkce',
            debug: true
          },
          cookies: {
            get(name: string) {
              const cookies = document.cookie.split(';')
              for (const cookie of cookies) {
                const [cookieName, ...valueParts] = cookie.trim().split('=')
                if (cookieName === name) {
                  const value = valueParts.join('=')
                  addLog(`Cookie GET: ${name} = ${value.substring(0, 30)}...`)
                  return decodeURIComponent(value)
                }
              }
              return undefined
            },
            set(name: string, value: string, options?: any) {
              addLog(`Cookie SET: ${name} (length: ${value?.length || 0})`)
              
              const cookieParts = [`${name}=${encodeURIComponent(value)}`]
              
              if (options?.maxAge) {
                cookieParts.push(`Max-Age=${options.maxAge}`)
              }
              
              cookieParts.push(`Path=${options?.path || '/'}`)
              
              // Critical: Use parent domain for production
              if (window.location.hostname.includes('covergen.pro')) {
                cookieParts.push('Domain=.covergen.pro')
                addLog('  → Using domain: .covergen.pro')
              }
              
              // Critical: Use SameSite=None for cross-site OAuth
              cookieParts.push('SameSite=None')
              
              if (window.location.protocol === 'https:') {
                cookieParts.push('Secure')
              }
              
              const cookieString = cookieParts.join('; ')
              document.cookie = cookieString
              addLog(`  → Full cookie: ${cookieString.substring(0, 100)}...`)
            },
            remove(name: string, options?: any) {
              addLog(`Cookie REMOVE: ${name}`)
              this.set(name, '', { ...options, maxAge: 0 })
            }
          }
        }
      )
      
      addLog('Client created. Checking initial cookies...')
      checkCookies()
      
      // Prepare redirect URL
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      addLog(`Redirect URL: ${redirectUrl}`)
      
      addLog('Calling signInWithOAuth...')
      
      // Call signInWithOAuth - this should set state cookie
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
      
      if (error) {
        addLog(`ERROR: ${error.message}`)
        setIsProcessing(false)
        return
      }
      
      addLog('OAuth call successful!')
      
      // Check cookies after OAuth call
      addLog('Checking cookies after OAuth...')
      const cookieState = checkCookies()
      
      if (!cookieState.hasState) {
        addLog('⚠️ WARNING: State cookie was NOT set!')
        addLog('This will cause "invalid flow state" error on callback')
      } else {
        addLog('✅ State cookie was set successfully')
      }
      
      if (!cookieState.hasCodeVerifier) {
        addLog('⚠️ WARNING: Code verifier cookie was NOT set!')
      } else {
        addLog('✅ Code verifier cookie was set successfully')
      }
      
      if (data?.url) {
        addLog(`OAuth URL: ${data.url.substring(0, 150)}...`)
        
        // Parse OAuth URL to check state parameter
        try {
          const oauthUrl = new URL(data.url)
          const stateParam = oauthUrl.searchParams.get('state')
          
          if (stateParam) {
            addLog(`✅ State parameter in URL: ${stateParam}`)
            
            // Verify state cookie matches URL parameter
            const stateCookie = document.cookie
              .split(';')
              .find(c => c.trim().includes('-state'))
              ?.split('=')[1]
            
            if (stateCookie === stateParam) {
              addLog('✅ State cookie matches URL parameter!')
            } else {
              addLog('⚠️ State cookie does NOT match URL parameter')
              addLog(`Cookie: ${stateCookie}`)
              addLog(`URL: ${stateParam}`)
            }
          } else {
            addLog('❌ NO state parameter in OAuth URL!')
          }
        } catch (e) {
          addLog(`Failed to parse OAuth URL: ${e}`)
        }
        
        addLog('Redirecting to Google in 3 seconds...')
        setTimeout(() => {
          window.location.href = data.url
        }, 3000)
      }
      
    } catch (err) {
      addLog(`EXCEPTION: ${err}`)
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Client-Side Fix</h1>
      
      <Card className="p-6 mb-6 bg-green-50">
        <h2 className="text-lg font-semibold mb-4">✅ Implementing Supabase's Preferred Fix</h2>
        <div className="space-y-2 text-sm">
          <p>This implementation:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Runs <code>signInWithOAuth</code> entirely client-side</li>
            <li>Uses proper cookie configuration (Domain=.covergen.pro, SameSite=None)</li>
            <li>Logs all cookie operations for debugging</li>
            <li>Verifies state cookie is set before redirect</li>
            <li>Checks if state parameter matches cookie</li>
          </ul>
        </div>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test OAuth Flow</h2>
        <div className="space-y-4">
          <Button 
            onClick={signInWithGoogleFixed} 
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? 'Processing...' : 'Sign in with Google (Fixed)'}
          </Button>
          
          <div className="text-sm text-gray-600">
            <p>This will:</p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Create a fresh Supabase client</li>
              <li>Call signInWithOAuth client-side</li>
              <li>Log all cookie operations</li>
              <li>Verify state cookie is set</li>
              <li>Redirect to Google after 3 seconds</li>
            </ol>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Cookies</h2>
        <Button onClick={() => checkCookies()} variant="outline" size="sm" className="mb-4">
          Check Current Cookies
        </Button>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.join('\n') || 'Click "Sign in with Google (Fixed)" to see logs'}
          </pre>
        </div>
      </Card>
    </div>
  )
}