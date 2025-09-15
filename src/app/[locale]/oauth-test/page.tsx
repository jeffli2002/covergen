'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react'

export default function OAuthTestPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [testLoading, setTestLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<string>('')
  
  // Log component mount
  console.log('[OAuthTest] Component mounted', {
    user: user?.email,
    loading,
    hasSignInFunction: typeof signInWithGoogle === 'function'
  })
  
  useEffect(() => {
    checkSessionState()
    
    // Check if we just came back from OAuth
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('code') || window.location.hash.includes('access_token')) {
      addLog('OAuth callback detected in URL, checking for session...')
      setTimeout(() => {
        checkSessionState()
      }, 1000)
    }
  }, [])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    console.log(`[OAuthTest] ${message}`)
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
  
  const checkSessionState = () => {
    // Check auth state from context
    addLog(`Auth context user: ${user ? user.email : 'No user'}`)
    addLog(`Auth loading: ${loading}`)
    
    // Check cookies
    setCookies(document.cookie)
    const authCookies = document.cookie.split(';').filter(c => c.trim().startsWith('sb-'))
    addLog(`Found ${authCookies.length} auth cookies`)
    
    // Log cookie names
    authCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      addLog(`Cookie: ${name}`)
    })
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
                  <p><strong>Cookies Found:</strong> {cookies.split(';').filter(c => c.trim().startsWith('sb-')).length} auth cookies</p>
                  <p><strong>Auth Cookies:</strong> {cookies.split(';').filter(c => c.trim().startsWith('sb-')).length} found</p>
                </div>
              </AlertDescription>
            </Alert>
            
            {/* Test Button */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleOAuthTest}
                disabled={testLoading || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  addLog('Refreshing page to check for session...')
                  window.location.reload()
                }}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                🔄 Refresh Page
              </Button>
              
              <Button
                onClick={() => {
                  addLog('Checking localStorage for auth data...')
                  const keys = Object.keys(localStorage)
                  const authKeys = keys.filter(key => key.startsWith('sb-') || key.includes('supabase'))
                  authKeys.forEach(key => {
                    addLog(`localStorage: ${key}`)
                  })
                  if (authKeys.length === 0) {
                    addLog('No auth data in localStorage')
                  }
                  checkSessionState()
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🔍 Check Storage
              </Button>
              
              <Button
                onClick={async () => {
                  addLog('Clearing all auth data...')
                  // Clear cookies
                  document.cookie.split(";").forEach(c => {
                    const eqPos = c.indexOf("=")
                    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
                    if (name.startsWith('sb-') || name === 'oauth-callback-success') {
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
                    }
                  })
                  // Clear localStorage
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-') || key.includes('supabase')) {
                      localStorage.removeItem(key)
                    }
                  })
                  // Sign out using context
                  await signOut()
                  addLog('All auth data cleared')
                  checkSessionState()
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Clear All & Retry
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
            
            {/* Debug Info */}
            <div className="bg-gray-100 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Debug Information:</h4>
              <div className="text-xs font-mono space-y-1">
                <div>Callback URL: {window.location.origin}/auth/callback</div>
                <div>Current Path: {window.location.pathname}</div>
                <div>Auth Cookies: {cookies.split(';').filter(c => c.trim().startsWith('sb-')).map(c => c.split('=')[0].trim()).join(', ') || 'None'}</div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>To debug OAuth issues:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open browser DevTools (F12)</li>
                <li>Go to Console tab</li>
                <li>Click "Test Google Sign In"</li>
                <li>After returning from Google, click "Refresh Session"</li>
                <li>Check console and logs for detailed error messages</li>
                <li>Check Network tab for failed requests</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}