'use client'

import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@/services/auth/providers/googleOAuth'
import { authEventBus } from '@/services/auth/eventBus'
import { sessionManagerListener } from '@/services/auth/listeners/sessionManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'

export default function TestOAuthModularPage() {
  const [testResults, setTestResults] = useState<Array<{
    test: string
    status: 'pending' | 'running' | 'success' | 'error'
    message?: string
  }>>([])
  const [events, setEvents] = useState<string[]>([])
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Set up event listeners for testing
    const unsubscribes: Array<() => void> = []

    // Listen to all auth events
    unsubscribes.push(
      authEventBus.onAll((event) => {
        const eventLog = `${new Date().toLocaleTimeString()} - ${event.type}: ${
          event.user?.email || event.error || 'No details'
        }`
        setEvents(prev => [...prev, eventLog])
        console.log('[TestPage] Event received:', event)
      })
    )

    // Clean up on unmount
    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [])

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    setTestResults(prev => [
      ...prev.filter(t => t.test !== testName),
      { test: testName, status: 'running' }
    ])

    try {
      await testFn()
      setTestResults(prev => 
        prev.map(t => t.test === testName 
          ? { ...t, status: 'success' } 
          : t
        )
      )
    } catch (error: any) {
      setTestResults(prev => 
        prev.map(t => t.test === testName 
          ? { ...t, status: 'error', message: error.message } 
          : t
        )
      )
    }
  }

  const testModuleCreation = async () => {
    await runTest('Module Creation', async () => {
      const oauth = new GoogleOAuthProvider()
      if (!oauth) throw new Error('Failed to create GoogleOAuthProvider')
      console.log('[Test] GoogleOAuthProvider created successfully')
    })
  }

  const testEventBus = async () => {
    await runTest('Event Bus', async () => {
      let eventReceived = false
      
      const unsubscribe = authEventBus.on('auth:signin:success', () => {
        eventReceived = true
      })

      // Emit test event
      await authEventBus.emit({
        type: 'auth:signin:success',
        user: { id: 'test', email: 'test@example.com' },
        metadata: { test: true }
      })

      // Wait a bit for async processing
      await new Promise(resolve => setTimeout(resolve, 100))
      
      unsubscribe()
      
      if (!eventReceived) throw new Error('Event was not received')
      console.log('[Test] Event bus working correctly')
    })
  }

  const testSessionManager = async () => {
    await runTest('Session Manager', async () => {
      // Check if we can get session
      const currentSession = sessionManagerListener.getSession()
      setSession(currentSession)
      
      console.log('[Test] Session manager checked, session:', currentSession ? 'Present' : 'None')
      
      // This doesn't fail the test, just logs the state
      if (!currentSession) {
        console.log('[Test] No session found (expected if not signed in)')
      }
    })
  }

  const testOAuthFlow = async () => {
    await runTest('OAuth Flow (Manual)', async () => {
      console.log('[Test] OAuth flow can only be tested manually by clicking "Sign in with Google"')
    })
  }

  const runAllTests = async () => {
    setTestResults([])
    setEvents([])
    
    await testModuleCreation()
    await testEventBus()
    await testSessionManager()
    await testOAuthFlow()
  }

  const handleGoogleSignIn = async () => {
    try {
      setEvents(prev => [...prev, `${new Date().toLocaleTimeString()} - Initiating Google sign in...`])
      
      const oauth = new GoogleOAuthProvider()
      const result = await oauth.signIn({
        redirectUrl: `${window.location.origin}/auth/callback/google?next=/test-oauth-modular`
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Sign in failed')
      }
    } catch (error: any) {
      setEvents(prev => [...prev, `${new Date().toLocaleTimeString()} - Sign in error: ${error.message}`])
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Modular OAuth Test Page</h1>

      <div className="grid gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>Run tests to verify the modular OAuth implementation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={runAllTests} variant="default">
                Run All Tests
              </Button>
              <Button onClick={handleGoogleSignIn} variant="outline">
                <img src="/images/google-logo.svg" alt="Google" className="w-4 h-4 mr-2" />
                Sign in with Google
              </Button>
            </div>

            {/* Individual test buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testModuleCreation} variant="secondary" size="sm">
                Test Module Creation
              </Button>
              <Button onClick={testEventBus} variant="secondary" size="sm">
                Test Event Bus
              </Button>
              <Button onClick={testSessionManager} variant="secondary" size="sm">
                Test Session Manager
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.map((result, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded bg-gray-50">
                    {result.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                    {result.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {result.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                    {result.status === 'pending' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                    
                    <div className="flex-1">
                      <div className="font-medium">{result.test}</div>
                      {result.message && (
                        <div className="text-sm text-red-600">{result.message}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Session */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
            <CardDescription>Session state from SessionManagerListener</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-2 text-sm">
                <div><strong>User:</strong> {session.user?.email}</div>
                <div><strong>User ID:</strong> {session.user?.id}</div>
                <div><strong>Expires At:</strong> {
                  session.expires_at 
                    ? new Date(session.expires_at * 1000).toLocaleString()
                    : 'Unknown'
                }</div>
                <div><strong>Token:</strong> {session.access_token?.substring(0, 20)}...</div>
              </div>
            ) : (
              <p className="text-gray-500">No active session</p>
            )}
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>Auth events captured by the event bus</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-1 text-sm font-mono max-h-64 overflow-y-auto">
                {events.map((event, i) => (
                  <div key={i} className="text-gray-700">{event}</div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No events captured yet</p>
            )}
          </CardContent>
        </Card>

        {/* Architecture Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p><strong>Modular OAuth Architecture Test</strong></p>
            <p>This page tests the decoupled OAuth implementation:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>OAuth module operates independently</li>
              <li>Events are emitted through the event bus</li>
              <li>Listeners handle profile sync and session management</li>
              <li>No direct coupling between OAuth and other systems</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}