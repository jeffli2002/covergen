'use client'

import { useState, useEffect } from 'react'
import { supabasePKCE } from '@/lib/supabase-pkce-fixed'

export default function OAuthRedirectDebug() {
  const [redirectUrl, setRedirectUrl] = useState('')
  const [authUrl, setAuthUrl] = useState('')
  
  useEffect(() => {
    // Get the OAuth URL without actually redirecting
    const getOAuthUrl = async () => {
      try {
        const { data, error } = await supabasePKCE.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: true // Don't redirect, just get the URL
          }
        })
        
        if (data?.url) {
          setAuthUrl(data.url)
          
          // Parse the redirect_uri from the OAuth URL
          const url = new URL(data.url)
          const redirectUri = url.searchParams.get('redirect_uri')
          if (redirectUri) {
            setRedirectUrl(decodeURIComponent(redirectUri))
          }
        }
        
        if (error) {
          console.error('OAuth error:', error)
        }
      } catch (err) {
        console.error('Error getting OAuth URL:', err)
      }
    }
    
    getOAuthUrl()
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">OAuth Redirect Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Expected Redirect URL:</h3>
          <p className="font-mono text-sm break-all">{window.location.origin}/auth/callback</p>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold mb-2">Actual Redirect URL in OAuth:</h3>
          <p className="font-mono text-sm break-all">{redirectUrl || 'Loading...'}</p>
        </div>
        
        {redirectUrl && redirectUrl !== `${window.location.origin}/auth/callback` && (
          <div className="p-4 bg-red-100 rounded">
            <h3 className="font-semibold text-red-700 mb-2">⚠️ Redirect URL Mismatch!</h3>
            <p className="text-sm">The OAuth is using a different redirect URL than expected.</p>
            <p className="text-sm mt-2">This explains why the callback is not working.</p>
          </div>
        )}
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Full OAuth URL:</h3>
          <p className="font-mono text-xs break-all">{authUrl || 'Loading...'}</p>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold mb-2">What's happening:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>The OAuth URL is generated with a redirect_uri parameter</li>
            <li>This redirect_uri is controlled by Supabase's configuration</li>
            <li>If it doesn't match our callback page, the flow will fail</li>
            <li>The actual redirect is happening to: {redirectUrl ? redirectUrl.split('?')[0] : '...'}</li>
          </ol>
        </div>
      </div>
    </div>
  )
}