'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function OAuthStateHandler() {
  useEffect(() => {
    // Check if we have OAuth params in the URL
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      
      if (code || error) {
        console.log('[OAuthStateHandler] OAuth callback detected', { code: !!code, error })
        
        // Let Supabase handle the OAuth callback
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code!)
        
        if (authError) {
          console.error('[OAuthStateHandler] Error exchanging code:', authError)
          // Redirect to error page or show error
          window.location.href = `/en?error=${encodeURIComponent(authError.message)}`
          return
        }
        
        if (data?.session) {
          console.log('[OAuthStateHandler] Session established successfully')
          // Get the next URL or default to /en
          const next = params.get('next') || '/en'
          
          // Clear OAuth params from URL and redirect
          window.history.replaceState({}, '', window.location.pathname)
          window.location.href = next
        }
      }
    }
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      handleOAuthCallback()
    }
  }, [])
  
  return null
}