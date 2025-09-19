'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { OAuthSignInButton } from '@/components/oauth-signin-button'
import { Button } from '@/components/ui/button'

export default function TestClientOAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event: any, session: any) => {
      console.log('Auth state changed:', _event, session?.user?.email)
      setSession(session)
    }) || { data: { subscription: null } }

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    if (!supabase) return
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      
      console.log('Current session:', session?.user?.email || 'None')
      setSession(session)
    } catch (err) {
      console.error('Session check error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) return
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    } else {
      setSession(null)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Client-Side OAuth Test</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        {session ? (
          <div>
            <p className="text-green-600 font-medium">✅ Authenticated</p>
            <p className="mt-2"><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Provider:</strong> {session.user.app_metadata?.provider}</p>
            <p><strong>User ID:</strong> {session.user.id}</p>
          </div>
        ) : (
          <p className="text-red-600 font-medium">❌ Not authenticated</p>
        )}
      </div>

      <div className="space-y-4">
        {!session ? (
          <OAuthSignInButton 
            provider="google" 
            redirectTo="/test-client-oauth"
            className="w-full"
          >
            Sign in with Google
          </OAuthSignInButton>
        ) : (
          <Button onClick={handleSignOut} variant="outline" className="w-full">
            Sign Out
          </Button>
        )}
        
        <Button onClick={checkSession} variant="outline" className="w-full">
          Refresh Session
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How this works:</h3>
        <ul className="text-sm space-y-1">
          <li>• Uses client-side Supabase client with proper PKCE handling</li>
          <li>• OAuth flow happens entirely in the browser</li>
          <li>• Code verifier is stored in sessionStorage (browser-side)</li>
          <li>• Cookies are set with proper SameSite=None configuration</li>
        </ul>
      </div>
    </div>
  )
}