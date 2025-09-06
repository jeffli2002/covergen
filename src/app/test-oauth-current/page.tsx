'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, AlertCircle, LogOut, RefreshCw } from 'lucide-react'

export default function TestOAuthCurrentPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [logs, setLogs] = useState<string[]>([])
  const [sessionExpiring, setSessionExpiring] = useState(false)
  const router = useRouter()

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp} - ${message}`])
  }

  useEffect(() => {
    // Initialize auth service and check current state
    const initAuth = async () => {
      addLog('Initializing auth service...')
      
      try {
        await authService.initialize()
        addLog('Auth service initialized')
        
        const currentUser = authService.getCurrentUser()
        const currentSession = authService.getCurrentSession()
        
        setUser(currentUser)
        setSession(currentSession)
        
        if (currentUser) {
          addLog(`User found: ${currentUser.email}`)
        } else {
          addLog('No user session found')
        }
        
        // Check if session is expiring soon
        if (currentSession) {
          const expiring = authService.isSessionExpiringSoon(10)
          setSessionExpiring(expiring)
          if (expiring) {
            addLog('Session expiring within 10 minutes')
          }
        }
      } catch (error: any) {
        addLog(`Initialization error: ${error.message}`)
      }
    }

    initAuth()

    // Set up auth change handler
    authService.setAuthChangeHandler((newUser) => {
      addLog(`Auth state changed: ${newUser ? newUser.email : 'signed out'}`)
      setUser(newUser)
      setSession(authService.getCurrentSession())
    })
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    addLog('Starting Google OAuth sign in...')
    
    try {
      const result = await authService.signInWithGoogle()
      
      if (result.success) {
        addLog('OAuth initiated successfully, redirecting to Google...')
      } else {
        throw new Error(result.error || 'Failed to initiate sign in')
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error occurred'
      setError(errorMsg)
      addLog(`Sign in error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    addLog('Signing out...')
    
    try {
      const result = await authService.signOut()
      
      if (result.success) {
        addLog('Signed out successfully')
        setUser(null)
        setSession(null)
      } else {
        throw new Error(result.error || 'Failed to sign out')
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Sign out failed'
      setError(errorMsg)
      addLog(`Sign out error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSession = async () => {
    setLoading(true)
    addLog('Refreshing session...')
    
    try {
      const result = await authService.refreshSession()
      
      if (result.session) {
        addLog('Session refreshed successfully')
        setSession(result.session)
        setSessionExpiring(authService.isSessionExpiringSoon(10))
      } else {
        const errorMessage = result.error instanceof Error 
          ? result.error.message 
          : (result.error as any)?.message || 'Failed to refresh session'
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Refresh failed'
      setError(errorMsg)
      addLog(`Refresh error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">OAuth Implementation Test</h1>
      
      <div className="grid gap-6">
        {/* User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current User Status</CardTitle>
            <CardDescription>
              Testing the current OAuth implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Signed In</span>
                </div>
                <div className="ml-7 space-y-1 text-sm text-gray-600">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-400" />
                <span>Not signed in</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Info */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Current authentication session details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Access Token:</strong> {session.access_token?.substring(0, 20)}...</p>
                <p><strong>Expires At:</strong> {formatDate(session.expires_at)}</p>
                <p><strong>Token Type:</strong> {session.token_type}</p>
                {sessionExpiring && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Session Expiring Soon</AlertTitle>
                    <AlertDescription>
                      Your session will expire within 10 minutes. Click refresh to extend it.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth Actions</CardTitle>
            <CardDescription>Test OAuth functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              {!user ? (
                <Button 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <img src="/google-logo.svg" alt="Google" className="w-4 h-4" />
                  )}
                  Sign in with Google
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSignOut}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Sign Out
                  </Button>
                  <Button 
                    onClick={handleRefreshSession}
                    disabled={loading}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh Session
                  </Button>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Event Log */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
            <CardDescription>OAuth flow events and debug information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
              {logs.length > 0 ? (
                <div className="space-y-1 text-sm font-mono">
                  {logs.map((log, i) => (
                    <div key={i} className="text-gray-700">{log}</div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No events logged yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Architecture Notes */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Current Implementation</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>This tests the current OAuth implementation which:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Uses Supabase OAuth directly in authService</li>
              <li>Manages sessions internally</li>
              <li>Handles profile sync in onSignIn</li>
              <li>Is tightly coupled with other services</li>
            </ul>
            <p className="mt-2">
              The modular version would separate these concerns into independent modules.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}