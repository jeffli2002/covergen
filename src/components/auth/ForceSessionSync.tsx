'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function ForceSessionSync() {
  useEffect(() => {
    async function syncSession() {
      console.log('[ForceSessionSync] Starting session sync...')
      
      // Get the sb-session-data cookie
      const cookies = document.cookie.split('; ')
      const sessionCookie = cookies.find(c => c.startsWith('sb-session-data='))
      
      if (!sessionCookie) {
        console.log('[ForceSessionSync] No session cookie found')
        return
      }
      
      try {
        // Extract and decode the session data
        const encodedData = sessionCookie.split('=')[1]
        const decodedData = decodeURIComponent(encodedData)
        const sessionData = JSON.parse(decodedData)
        
        console.log('[ForceSessionSync] Found session data:', {
          hasAccessToken: !!sessionData.access_token,
          hasRefreshToken: !!sessionData.refresh_token,
          userEmail: sessionData.user?.email
        })
        
        // Get Supabase client and set the session
        const supabase = createClient()
        const { data, error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        })
        
        if (error) {
          console.error('[ForceSessionSync] Error setting session:', error)
          return
        }
        
        console.log('[ForceSessionSync] Session set successfully:', {
          user: data.session?.user?.email,
          expiresAt: data.session?.expires_at
        })
        
        // Force a page reload to update UI
        setTimeout(() => {
          window.location.reload()
        }, 500)
        
      } catch (error) {
        console.error('[ForceSessionSync] Error processing session:', error)
      }
    }
    
    // Only run if we have the success markers
    if (document.cookie.includes('auth-callback-success') || 
        document.cookie.includes('vercel-auth-complete')) {
      syncSession()
    }
  }, [])
  
  return null
}