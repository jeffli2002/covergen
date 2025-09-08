'use client'

import { supabase } from '@/lib/supabase-simple'

export default function OAuthSimpleTest() {
  const handleGoogleSignIn = async () => {
    try {
      console.log('[OAuth Simple Test] Starting Google sign in...')
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      console.log('[OAuth Simple Test] Redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      })
      
      if (error) {
        console.error('[OAuth Simple Test] Error:', error)
        alert(`OAuth Error: ${error.message}`)
      } else {
        console.log('[OAuth Simple Test] OAuth initiated:', data)
      }
    } catch (err) {
      console.error('[OAuth Simple Test] Unexpected error:', err)
      alert(`Unexpected error: ${err}`)
    }
  }
  
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple OAuth Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Sign in with Google
        </button>
        
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">
            This is a minimal OAuth test page. Check the browser console for logs.
          </p>
        </div>
      </div>
    </div>
  )
}