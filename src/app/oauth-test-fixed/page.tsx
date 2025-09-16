'use client'

import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase-simple'

export default function OAuthTestFixed() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const checkSession = async () => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      setError(error.message)
    } else if (data?.session) {
      setUser(data.session.user)
    } else {
      setUser(null)
    }
  }
  
  const signIn = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-production?next=/oauth-test-fixed`
        }
      })
      
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }
  
  const signOut = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Test (Fixed Client-Side Callback)</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="font-semibold mb-2">What this test does:</h2>
        <ul className="text-sm space-y-1">
          <li>✓ Uses client-side callback page to parse URL fragments</li>
          <li>✓ Handles both implicit flow (hash) and PKCE flow (code)</li>
          <li>✓ Establishes session properly after OAuth redirect</li>
          <li>✓ Redirects back to this test page after auth</li>
        </ul>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 font-semibold">Error:</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      
      {user ? (
        <div className="mb-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
            <p className="text-green-800 font-semibold mb-2">Signed In Successfully!</p>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider || 'Unknown'}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          </div>
          
          <button
            onClick={signOut}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={signIn}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Sign In with Google'}
          </button>
          
          <button
            onClick={checkSession}
            className="ml-4 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Check Session
          </button>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Key Changes Made:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Replaced server-side <code>/auth/callback/route.ts</code> with client-side <code>/auth/callback/page.tsx</code></li>
          <li>Client page properly parses URL hash fragments for auth tokens</li>
          <li>Handles both implicit flow (tokens in hash) and PKCE flow (code exchange)</li>
          <li>Shows loading state and error messages during auth</li>
          <li>Redirects to intended page after successful auth</li>
        </ol>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Callback URL being used: <code className="bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback</code></p>
      </div>
    </div>
  )
}