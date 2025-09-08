'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabaseClient-simple'
import { userSessionService } from '@/services/unified/UserSessionService'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AuthStateTestPage() {
  const [supabaseClientState, setSupabaseState] = useState<any>(null)
  const [unifiedServiceState, setUnifiedServiceState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authMismatch, setAuthMismatch] = useState(false)
  
  const { user: storeUser, isAuthenticated: storeIsAuth, signInWithGoogle } = useAppStore()
  
  const checkAllAuthStates = async () => {
    setLoading(true)
    
    try {
      // 1. Check Supabase directly
      const supabaseClientClient = supabaseClient
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      const supabaseClientAuth = {
        hasSession: !!session,
        userEmail: session?.user?.email || null,
        userId: session?.user?.id || null,
        error: error?.message || null
      }
      setSupabaseState(supabaseClientAuth)
      
      // 2. Check UserSessionService
      const serviceUser = userSessionService.getCurrentUser()
      const serviceAuth = {
        hasUser: !!serviceUser,
        userEmail: serviceUser?.email || null,
        userId: serviceUser?.id || null
      }
      setUnifiedServiceState(serviceAuth)
      
      // 3. Check for mismatches
      const mismatch = (supabaseClientAuth.hasSession !== serviceAuth.hasUser) || 
                      (supabaseClientAuth.hasSession !== storeIsAuth)
      setAuthMismatch(mismatch)
      
    } catch (err: any) {
      console.error('[Auth State Test] Error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    checkAllAuthStates()
    
    // Listen for auth changes
    const supabaseClientClient = supabaseClient
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(() => {
      checkAllAuthStates()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [storeUser, storeIsAuth])
  
  const handleGoogleSignIn = async () => {
    console.log('[Auth State Test] Starting Google sign-in...')
    const result = await signInWithGoogle()
    console.log('[Auth State Test] Sign-in result:', result)
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading auth states...</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Auth State Comparison</h1>
      
      {authMismatch && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Auth State Mismatch Detected!</AlertTitle>
          <AlertDescription>
            The authentication states across different services are not in sync.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6">
        {/* Supabase Direct State */}
        <Card className={supabaseClientState?.hasSession ? 'border-green-500' : 'border-gray-300'}>
          <CardHeader>
            <CardTitle>Supabase Direct State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Has Session:</strong> {supabaseClientState?.hasSession ? 'Yes ✅' : 'No ❌'}</div>
              <div><strong>Email:</strong> {supabaseClientState?.userEmail || 'None'}</div>
              <div><strong>User ID:</strong> {supabaseClientState?.userId || 'None'}</div>
              <div><strong>Error:</strong> {supabaseClientState?.error || 'None'}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* UserSessionService State */}
        <Card className={unifiedServiceState?.hasUser ? 'border-green-500' : 'border-gray-300'}>
          <CardHeader>
            <CardTitle>UserSessionService State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Has User:</strong> {unifiedServiceState?.hasUser ? 'Yes ✅' : 'No ❌'}</div>
              <div><strong>Email:</strong> {unifiedServiceState?.userEmail || 'None'}</div>
              <div><strong>User ID:</strong> {unifiedServiceState?.userId || 'None'}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Store State */}
        <Card className={storeIsAuth ? 'border-green-500' : 'border-gray-300'}>
          <CardHeader>
            <CardTitle>App Store State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>Is Authenticated:</strong> {storeIsAuth ? 'Yes ✅' : 'No ❌'}</div>
              <div><strong>Email:</strong> {storeUser?.email || 'None'}</div>
              <div><strong>User ID:</strong> {storeUser?.id || 'None'}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Current URL Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typeof window !== 'undefined' && (
                <>
                  <div><strong>Origin:</strong> {window.location.origin}</div>
                  <div><strong>Hostname:</strong> {window.location.hostname}</div>
                  <div><strong>Is Vercel Preview:</strong> {window.location.hostname.includes('vercel.app') ? 'Yes' : 'No'}</div>
                  <div><strong>Pathname:</strong> {window.location.pathname}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={checkAllAuthStates}>Refresh States</Button>
              <Button onClick={handleGoogleSignIn} variant="default">
                Sign In with Google
              </Button>
              <Button 
                onClick={async () => {
                  const supabaseClientClient = supabaseClient
                  await supabaseClient.auth.signOut()
                  window.location.reload()
                }} 
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}