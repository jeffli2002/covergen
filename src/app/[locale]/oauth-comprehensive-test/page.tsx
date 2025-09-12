'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthComprehensiveTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [currentUrl, setCurrentUrl] = useState('')
  
  useEffect(() => {
    setCurrentUrl(window.location.href)
    
    // Check if we have OAuth params in URL
    const params = new URLSearchParams(window.location.search)
    if (params.get('code') || params.get('error')) {
      addLog('=== OAuth Callback Detected ===')
      addLog(`URL: ${window.location.href}`)
      addLog(`Code: ${params.get('code') ? 'Present' : 'Missing'}`)
      addLog(`Error: ${params.get('error') || 'None'}`)
      addLog(`State: ${params.get('state') || 'Missing'}`)
    }
  }, [])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }
  
  const testDefaultClient = async () => {
    setLogs([])
    addLog('Testing with default Supabase client configuration...')
    
    try {
      const { supabase } = await import('@/lib/supabase')
      
      // Check cookies before
      const beforeCookies = document.cookie.split(';').filter(c => c.includes('supabase'))
      addLog(`Supabase cookies before: ${beforeCookies.length}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/en/oauth-comprehensive-test`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        addLog(`Error: ${error.message}`)
        return
      }
      
      if (data?.url) {
        addLog(`OAuth URL: ${data.url.substring(0, 150)}...`)
        const url = new URL(data.url)
        addLog(`Has state param: ${url.searchParams.has('state')}`)
        addLog(`State value: ${url.searchParams.get('state') || 'NONE'}`)
      }
      
      // Check cookies after
      const afterCookies = document.cookie.split(';').filter(c => c.includes('supabase'))
      addLog(`Supabase cookies after: ${afterCookies.length}`)
      
    } catch (err) {
      addLog(`Exception: ${err}`)
    }
  }
  
  const testWithDetectSessionInUrl = async () => {
    setLogs([])
    addLog('Testing with detectSessionInUrl: true...')
    
    try {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true, // ENABLED
            flowType: 'pkce',
            debug: true
          }
        }
      )
      
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/en/oauth-comprehensive-test`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        addLog(`Error: ${error.message}`)
        return
      }
      
      if (data?.url) {
        addLog(`OAuth URL: ${data.url.substring(0, 150)}...`)
        const url = new URL(data.url)
        addLog(`Has state param: ${url.searchParams.has('state')}`)
        addLog(`State value: ${url.searchParams.get('state') || 'NONE'}`)
      }
      
    } catch (err) {
      addLog(`Exception: ${err}`)
    }
  }
  
  const testImplicitFlow = async () => {
    setLogs([])
    addLog('Testing with implicit flow...')
    
    try {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'implicit', // Try implicit flow
            debug: true
          }
        }
      )
      
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/en/oauth-comprehensive-test`,
          skipBrowserRedirect: true
        }
      })
      
      if (error) {
        addLog(`Error: ${error.message}`)
        return
      }
      
      if (data?.url) {
        addLog(`OAuth URL: ${data.url.substring(0, 150)}...`)
        const url = new URL(data.url)
        addLog(`Response type: ${url.searchParams.get('response_type')}`)
        addLog(`Has state param: ${url.searchParams.has('state')}`)
      }
      
    } catch (err) {
      addLog(`Exception: ${err}`)
    }
  }
  
  const checkSupabaseVersion = async () => {
    setLogs([])
    addLog('Checking Supabase configuration...')
    
    try {
      // Check package version
      const packageJson = await fetch('/api/package-info').then(r => r.json()).catch(() => null)
      if (packageJson?.dependencies?.['@supabase/supabase-js']) {
        addLog(`Supabase JS version: ${packageJson.dependencies['@supabase/supabase-js']}`)
      }
      if (packageJson?.dependencies?.['@supabase/ssr']) {
        addLog(`Supabase SSR version: ${packageJson.dependencies['@supabase/ssr']}`)
      }
      
      // Check Supabase project settings
      addLog(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
      
      // Check current cookies
      const cookies = document.cookie.split(';')
      const supabaseCookies = cookies.filter(c => c.includes('supabase') || c.includes('sb-'))
      addLog(`Current Supabase cookies: ${supabaseCookies.length}`)
      supabaseCookies.forEach(cookie => {
        const [name] = cookie.trim().split('=')
        addLog(`  - ${name}`)
      })
      
    } catch (err) {
      addLog(`Check error: ${err}`)
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Comprehensive Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Status</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Current URL:</strong> <code className="break-all">{currentUrl}</code></p>
        </div>
      </Card>
      
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">OAuth Configuration Tests</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={checkSupabaseVersion}>
              Check Supabase Configuration
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Checks current Supabase version and settings
            </p>
          </div>
          
          <div>
            <Button onClick={testDefaultClient} variant="outline">
              Test Default Client (detectSessionInUrl: false)
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Uses the current production configuration
            </p>
          </div>
          
          <div>
            <Button onClick={testWithDetectSessionInUrl} variant="outline">
              Test with detectSessionInUrl: true
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Tests if enabling URL detection fixes the issue
            </p>
          </div>
          
          <div>
            <Button onClick={testImplicitFlow} variant="outline">
              Test Implicit Flow
            </Button>
            <p className="text-sm text-gray-600 mt-1">
              Tests OAuth with implicit flow instead of PKCE
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 mb-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-4">💡 Key Findings</h2>
        <div className="space-y-2 text-sm">
          <p>• Supabase PKCE flow should include a state parameter automatically</p>
          <p>• The "invalid flow state" error suggests the state cookie is missing or mismatched</p>
          <p>• Cookie domain/path configuration is critical for OAuth flows</p>
          <p>• The callback route must properly handle the OAuth response</p>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
        <div className="bg-gray-100 p-4 rounded h-96 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.join('\n') || 'Click a test button to see logs'}
          </pre>
        </div>
      </Card>
    </div>
  )
}