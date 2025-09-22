'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function OAuthDebugRedirect() {
  const [oauthUrl, setOauthUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const checkOAuthUrl = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Get the OAuth URL without redirecting
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true // Don't redirect, just get the URL
        }
      })

      if (error) {
        setOauthUrl(`Error: ${error.message}`)
      } else if (data?.url) {
        setOauthUrl(data.url)
        
        // Parse and display the redirect_uri from the OAuth URL
        try {
          const url = new URL(data.url)
          const redirectUri = url.searchParams.get('redirect_uri')
          if (redirectUri) {
            setOauthUrl(prev => `${prev}\n\nParsed redirect_uri: ${redirectUri}`)
          }
        } catch (e) {
          console.error('Error parsing URL:', e)
        }
      }
    } catch (error) {
      setOauthUrl(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OAuth Redirect Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">
            This page will show the actual OAuth URL being generated, including the redirect_uri parameter.
          </p>
          <p className="text-sm text-gray-600">
            The redirect_uri should be: <code className="bg-gray-200 px-1">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback</code>
          </p>
        </div>

        <button
          onClick={checkOAuthUrl}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check OAuth URL'}
        </button>

        {oauthUrl && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">OAuth URL:</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap break-all">
              {oauthUrl}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Fix Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>
              Go to your Supabase Dashboard → Authentication → URL Configuration
            </li>
            <li>
              Add this URL to "Redirect URLs": 
              <code className="bg-yellow-100 px-1 ml-1">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback</code>
            </li>
            <li>
              Also add for production:
              <code className="bg-yellow-100 px-1 ml-1">https://covergen.pro/auth/callback</code>
            </li>
            <li>
              Go to Google Cloud Console → Your OAuth 2.0 Client → Authorized redirect URIs
            </li>
            <li>
              Make sure these URLs are added there as well
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}