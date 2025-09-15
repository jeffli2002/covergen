'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function OAuthComprehensiveDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [testResults, setTestResults] = useState<{[key: string]: 'pass' | 'fail' | 'pending'}>({})
  
  const addLog = (message: string, level: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    console.log(logMessage)
    setLogs(prev => [...prev, logMessage])
  }

  const updateResult = (test: string, result: 'pass' | 'fail') => {
    setTestResults(prev => ({ ...prev, [test]: result }))
  }

  useEffect(() => {
    addLog('OAuth Comprehensive Debug loaded')
    runAllTests()
  }, [])

  const runAllTests = async () => {
    addLog('Starting comprehensive OAuth diagnostic...')
    
    // Test 1: Environment Variables
    await testEnvironmentVariables()
    
    // Test 2: Supabase Client Creation
    await testSupabaseClientCreation()
    
    // Test 3: Basic Browser Environment
    await testBrowserEnvironment()
    
    // Test 4: Network Connectivity
    await testNetworkConnectivity()
    
    // Test 5: OAuth URL Generation
    await testOAuthURLGeneration()
    
    addLog('All tests completed')
  }

  const testEnvironmentVariables = async () => {
    addLog('Testing environment variables...')
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      
      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${url ? 'SET' : 'MISSING'}`)
      addLog(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${key ? 'SET' : 'MISSING'}`)
      addLog(`NEXT_PUBLIC_SITE_URL: ${siteUrl || 'NOT SET'}`)
      
      if (url && key) {
        addLog('Environment variables test PASSED', 'success')
        updateResult('env', 'pass')
      } else {
        addLog('Environment variables test FAILED - missing required vars', 'error')
        updateResult('env', 'fail')
      }
    } catch (error: any) {
      addLog(`Environment variables test FAILED: ${error.message}`, 'error')
      updateResult('env', 'fail')
    }
  }

  const testSupabaseClientCreation = async () => {
    addLog('Testing Supabase client creation...')
    try {
      addLog('Attempting to import supabase-client...')
      const { supabase } = await import('@/lib/supabase-client')
      
      if (supabase) {
        addLog('Supabase client imported successfully', 'success')
        addLog(`Client type: ${typeof supabase}`)
        addLog(`Client has auth: ${!!supabase.auth}`)
        addLog(`Auth has signInWithOAuth: ${typeof supabase.auth.signInWithOAuth}`)
        updateResult('client', 'pass')
      } else {
        addLog('Supabase client is null', 'error')
        updateResult('client', 'fail')
      }
    } catch (error: any) {
      addLog(`Supabase client creation FAILED: ${error.message}`, 'error')
      addLog(`Error stack: ${error.stack}`, 'error')
      updateResult('client', 'fail')
    }
  }

  const testBrowserEnvironment = async () => {
    addLog('Testing browser environment...')
    try {
      addLog(`Window object: ${typeof window}`)
      addLog(`Location: ${window.location.href}`)
      addLog(`User agent: ${navigator.userAgent}`)
      addLog(`Local storage available: ${typeof Storage !== 'undefined'}`)
      addLog(`Console available: ${typeof console}`)
      
      updateResult('browser', 'pass')
      addLog('Browser environment test PASSED', 'success')
    } catch (error: any) {
      addLog(`Browser environment test FAILED: ${error.message}`, 'error')
      updateResult('browser', 'fail')
    }
  }

  const testNetworkConnectivity = async () => {
    addLog('Testing network connectivity...')
    try {
      const response = await fetch('/api/auth/env-check')
      if (response.ok) {
        const data = await response.json()
        addLog(`API connectivity: SUCCESS`)
        addLog(`Server env check: ${JSON.stringify(data, null, 2)}`)
        updateResult('network', 'pass')
      } else {
        addLog(`API connectivity: FAILED - ${response.status}`, 'error')
        updateResult('network', 'fail')
      }
    } catch (error: any) {
      addLog(`Network connectivity test FAILED: ${error.message}`, 'error')
      updateResult('network', 'fail')
    }
  }

  const testOAuthURLGeneration = async () => {
    addLog('Testing OAuth URL generation...')
    try {
      const { supabase } = await import('@/lib/supabase-client')
      
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      addLog('Attempting to generate OAuth URL...')
      const redirectTo = `${window.location.origin}/auth/callback?next=/oauth-comprehensive-debug`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true // Just get the URL
        }
      })
      
      if (error) {
        addLog(`OAuth URL generation FAILED: ${error.message}`, 'error')
        addLog(`Error details: ${JSON.stringify(error)}`, 'error')
        updateResult('oauth', 'fail')
      } else if (data?.url) {
        addLog(`OAuth URL generated successfully: ${data.url}`, 'success')
        updateResult('oauth', 'pass')
      } else {
        addLog('OAuth URL generation returned no URL', 'error')
        updateResult('oauth', 'fail')
      }
    } catch (error: any) {
      addLog(`OAuth URL generation test FAILED: ${error.message}`, 'error')
      addLog(`Error stack: ${error.stack}`, 'error')
      updateResult('oauth', 'fail')
    }
  }

  const testActualOAuth = async () => {
    addLog('Testing actual OAuth flow...')
    try {
      const { supabase } = await import('@/lib/supabase-client')
      
      if (!supabase) {
        throw new Error('Supabase client not available')
      }
      
      const redirectTo = `${window.location.origin}/auth/callback?next=/oauth-comprehensive-debug`
      addLog(`Starting OAuth with redirect: ${redirectTo}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false // Actually redirect
        }
      })
      
      if (error) {
        addLog(`OAuth flow FAILED: ${error.message}`, 'error')
      } else {
        addLog('OAuth flow started successfully - should redirect now', 'success')
      }
    } catch (error: any) {
      addLog(`OAuth flow test FAILED: ${error.message}`, 'error')
      addLog(`Error stack: ${error.stack}`, 'error')
    }
  }

  const getStatusColor = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass': return 'text-green-600'
      case 'fail': return 'text-red-600'
      case 'pending': return 'text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>OAuth Comprehensive Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Object.entries({
                env: 'Environment',
                client: 'Supabase Client',
                browser: 'Browser',
                network: 'Network',
                oauth: 'OAuth Generation'
              }).map(([key, label]) => (
                <div key={key} className={`p-3 border rounded ${getStatusColor(testResults[key] || 'pending')}`}>
                  <div className="font-semibold">{label}</div>
                  <div className="text-sm">
                    {testResults[key] === 'pass' ? '✅ PASS' : 
                     testResults[key] === 'fail' ? '❌ FAIL' : 
                     '⏳ PENDING'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 mb-6">
              <Button onClick={runAllTests} variant="outline">
                Re-run All Tests
              </Button>
              <Button onClick={testActualOAuth} className="bg-green-600 hover:bg-green-700 text-white">
                Test Actual OAuth Flow
              </Button>
              <Button onClick={() => {setLogs([]); setTestResults({})}} variant="ghost">
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Tests will run automatically on load.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}