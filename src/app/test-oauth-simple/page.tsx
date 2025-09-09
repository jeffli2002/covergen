'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function TestOAuthSimplePage() {
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  
  // Check session on mount
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  })
  
  const handleSignIn = async () => {
    setLoading(true)
    try {
      // Simple OAuth without any extra params
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/test-oauth-simple`
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
        alert(`Error: ${error.message}`)
      }
    } catch (err: any) {
      console.error('Exception:', err)
      alert(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
      alert(`Sign out error: ${error.message}`)
    }
  }
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Simple OAuth Test</h1>
      
      {session ? (
        <div className="space-y-4">
          <p className="text-green-600">✓ Signed in as: {session.user.email}</p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Not signed in</p>
          <Button onClick={handleSignIn} disabled={loading}>
            {loading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Debug Info:</h2>
        <pre className="text-xs overflow-auto">
{JSON.stringify({
  hasSession: !!session,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=/test-oauth-simple`
}, null, 2)}
        </pre>
      </div>
    </div>
  )
}