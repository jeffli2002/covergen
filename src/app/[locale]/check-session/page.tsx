'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CheckSessionPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    checkSession()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('Auth event:', event)
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Session check error:', error)
    } else {
      console.log('Current session:', session)
      setSession(session)
    }
    setLoading(false)
  }
  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
  }
  
  if (loading) return <div className="p-8">Loading...</div>
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Session Check</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          {session ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-600">✅ You are signed in!</h2>
              
              <div className="space-y-2">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>ID:</strong> {session.user.id}</p>
                <p><strong>Provider:</strong> {session.user.app_metadata?.provider || 'Unknown'}</p>
                <p><strong>Created:</strong> {new Date(session.user.created_at).toLocaleString()}</p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={signOut}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-600">Not signed in</h2>
              <p>Go to <a href="/en/oauth-simple" className="text-blue-600 hover:underline">/en/oauth-simple</a> to sign in</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">OAuth Flow Explanation:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Click "Sign in with Google" redirects to Google OAuth</li>
            <li>If you're already logged into Google, it auto-approves</li>
            <li>Google redirects back with a code to /auth/callback</li>
            <li>The callback exchanges the code for a session</li>
            <li>You're redirected to the original page (or /en)</li>
          </ol>
          <p className="mt-2 text-sm">
            <strong>Tip:</strong> Use an incognito window to see the full Google login screen.
          </p>
        </div>
      </div>
    </div>
  )
}