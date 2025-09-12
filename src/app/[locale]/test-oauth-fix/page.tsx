'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OAuthStateHandler } from '@/components/OAuthStateHandler'
import type { Session } from '@supabase/supabase-js'

export default function TestOAuthFixPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[OAuth Fix Test] ${message}`)
  }
  
  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addLog(`Session check error: ${error.message}`)
      } else if (session) {
        addLog(`Session found: ${session.user.email}`)
        setUser(session.user)
      } else {
        addLog('No session found')
      }
      setLoading(false)
    }
    
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      addLog(`Auth state change: ${event}`)
      if (session) {
        addLog(`User signed in: ${session.user.email}`)
        setUser(session.user)
      } else {
        addLog('User signed out')
        setUser(null)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const handleGoogleSignIn = async () => {
    try {
      addLog('Starting Google sign in...')
      
      // Check cookies before
      const cookiesBefore = document.cookie
      addLog(`Cookies before OAuth: ${cookiesBefore.split(';').length} total`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/en/test-oauth-fix`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        addLog(`OAuth error: ${error.message}`)
        return
      }
      
      // Check cookies after
      const cookiesAfter = document.cookie
      const supabaseCookies = cookiesAfter.split(';').filter(c => c.includes('sb-'))
      addLog(`Cookies after OAuth: ${supabaseCookies.length} Supabase cookies`)
      
      // Log OAuth URL details
      if (data?.url) {
        const url = new URL(data.url)
        const hasState = url.searchParams.has('state')
        addLog(`OAuth URL has state: ${hasState ? '✅ YES' : '❌ NO'}`)
        
        if (hasState) {
          const stateValue = url.searchParams.get('state')
          addLog(`State value: ${stateValue}`)
          
          // Check for state cookie
          const hasStateCookie = document.cookie.includes('-state')
          addLog(`State cookie exists: ${hasStateCookie ? '✅ YES' : '❌ NO'}`)
        }
        
        addLog('OAuth initiated successfully!')
      }
    } catch (err) {
      addLog(`Exception: ${err}`)
    }
  }
  
  const handleSignOut = async () => {
    addLog('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (error) {
      addLog(`Sign out error: ${error.message}`)
    } else {
      addLog('Signed out successfully')
    }
  }
  
  return (
    <>
      <OAuthStateHandler />
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Test OAuth Fix</h1>
        
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-2 text-sm">
              <p><strong>Signed in as:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider}</p>
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </Card>
        
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {!user ? (
              <Button onClick={handleGoogleSignIn} className="w-full">
                Test Google Sign In
              </Button>
            ) : (
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            )}
          </div>
        </Card>
        
        <Card className="p-6 mb-6 bg-blue-50">
          <h2 className="text-lg font-semibold mb-4">✅ OAuth Fix Applied</h2>
          <div className="space-y-2 text-sm">
            <p>This page includes the following fixes:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>detectSessionInUrl: true</code> in Supabase client</li>
              <li>OAuthStateHandler component to process callbacks</li>
              <li>Proper cookie configuration for OAuth</li>
              <li>Client-side OAuth initiation</li>
            </ul>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {logs.join('\n') || 'No logs yet'}
            </pre>
          </div>
        </Card>
      </div>
    </>
  )
}