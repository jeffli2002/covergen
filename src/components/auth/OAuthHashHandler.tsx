'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
        
        if (accessToken && refreshToken) {
          console.log('[OAuthHashHandler] Found tokens in hash, setting session...')
          
          try {
            // Ensure auth service is initialized first
            await authService.initialize()
            
            // Set the session with the tokens from the hash using authService
            const result = await authService.setOAuthSession(accessToken, refreshToken)
            
            if (!result.success) {
              console.error('[OAuthHashHandler] Error setting session:', result.error)
            } else {
              console.log('[OAuthHashHandler] Session set successfully')
              
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