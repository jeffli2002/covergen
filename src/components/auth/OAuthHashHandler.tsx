'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import authService from '@/services/authService'

export function OAuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const handleHashTokens = async () => {
      // Check if we have OAuth tokens in the hash
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken && supabase) {
          console.log('[OAuthHashHandler] Found tokens in hash, setting session...')
          
          try {
            // Set the session with the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error('[OAuthHashHandler] Error setting session:', error)
            } else {
              console.log('[OAuthHashHandler] Session set successfully')
              
              // Ensure auth service is initialized with the new session
              await authService.initialize()
              
              // Clear the hash to clean up the URL
              window.history.replaceState(null, '', window.location.pathname)
              
              // Force a refresh to update the auth state
              router.refresh()
            }
          } catch (error) {
            console.error('[OAuthHashHandler] Unexpected error:', error)
          }
        }
      }
    }

    handleHashTokens()
  }, [router])

  return null
}