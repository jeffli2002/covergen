'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OAuthSimplePage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    checkSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      setSession(session)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const signIn = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`
        }
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }
  
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl">Loading...</h2>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple OAuth Test</h1>
        
        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Signed in</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>ID:</strong> {session.user.id.substring(0, 8)}...</p>
            </div>
          ) : (
            <p className="text-gray-600">Not signed in</p>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          {!session ? (
            <button
              onClick={signIn}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={signOut}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
        </div>
        
        {/* Info */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Callback URL:</h3>
          <code className="bg-white px-3 py-1 rounded text-sm">
            {window.location.origin}/auth/callback
          </code>
          <p className="mt-2 text-sm text-blue-800">
            Make sure this URL is added to your Supabase project's redirect URLs.
          </p>
        </div>
      </div>
    </div>
  )
}