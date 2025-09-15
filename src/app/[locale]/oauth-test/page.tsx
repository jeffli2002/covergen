'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react'

export default function OAuthTestPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [testLoading, setTestLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  // Log component mount
  console.log('[OAuthTest] Component mounted', {
    user: user?.email,
    loading,
    hasSignInFunction: typeof signInWithGoogle === 'function'
  })
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[OAuthTest] ${message}`)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
  
  const handleOAuthTest = async () => {
    setTestLoading(true)
    setLogs([])
    
    try {
      addLog('Starting OAuth test...')
      addLog(`Current URL: ${window.location.href}`)
      addLog(`Origin: ${window.location.origin}`)
      addLog(`Hostname: ${window.location.hostname}`)
      
      // Check if already signed in
      if (user) {
        addLog(`Already signed in as: ${user.email}`)
        addLog('Signing out first...')
        await signOut()
        addLog('Signed out successfully')
      }
      
      addLog('Initiating Google OAuth...')
      const result = await signInWithGoogle()
      
      if (result.success) {
        addLog('OAuth initiated successfully!')
        addLog('Redirecting to Google...')
      } else {
        addLog(`OAuth failed: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`Error: ${error.message}`)
      console.error('OAuth test error:', error)
    } finally {
      setTestLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>OAuth Test Page</CardTitle>
            <CardDescription>
              Test Google OAuth integration and debug any issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Auth Status:</strong> {loading ? 'Loading...' : user ? 'Signed In' : 'Not Signed In'}</p>
                  {user && <p><strong>User:</strong> {user.email}</p>}
                  <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Test Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleOAuthTest}
                disabled={testLoading || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Google Sign In'
                )}
              </Button>
              
              <Button
                onClick={() => {
                  console.log('[OAuthTest] Direct test clicked')
                  window.location.href = `https://exungkcoaihcemcmhqdr.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('https://covergen.pro/auth/callback?next=/en/oauth-test')}`
                }}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Direct OAuth Test
              </Button>
              
              {user && (
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                >
                  Sign Out
                </Button>
              )}
            </div>
            
            {/* Test Logs */}
            {logs.length > 0 && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Test Logs:</h4>
                <pre className="text-xs font-mono space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className={
                      log.includes('Error') || log.includes('failed') ? 'text-red-400' :
                      log.includes('success') ? 'text-green-400' :
                      'text-gray-300'
                    }>
                      {log}
                    </div>
                  ))}
                </pre>
              </div>
            )}
            
            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>To debug OAuth issues:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open browser DevTools (F12)</li>
                <li>Go to Console tab</li>
                <li>Click "Test Google Sign In"</li>
                <li>Check console for detailed error messages</li>
                <li>Check Network tab for failed requests</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}