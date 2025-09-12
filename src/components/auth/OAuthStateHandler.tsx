'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export function OAuthStateHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Only handle if we have OAuth parameters
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      if (!code && !error) {
        return // Not an OAuth callback
      }

      console.log('[OAuthStateHandler] Processing OAuth callback')

      if (error) {
        console.error('[OAuthStateHandler] OAuth error:', error)
        const errorDescription = searchParams.get('error_description')
        router.push(`/?error=auth_failed&message=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      if (code) {
        try {
          // Let Supabase handle the code exchange since detectSessionInUrl is now true
          // The auth state change listener in authService will handle the session
          console.log('[OAuthStateHandler] OAuth callback handled by Supabase')
          
          // Get the next URL
          const next = searchParams.get('next') || '/en'
          
          // Give Supabase time to process the callback
          setTimeout(() => {
            router.push(next)
          }, 100)
        } catch (err) {
          console.error('[OAuthStateHandler] Unexpected error:', err)
          router.push(`/?error=auth_failed`)
        }
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return null
}