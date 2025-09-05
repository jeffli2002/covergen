'use client'

import { useEffect } from 'react'
import authService from '@/services/authService'

/**
 * Hook to sync client session with server session
 * This is especially important after OAuth redirects
 */
export function useServerSession() {
  useEffect(() => {
    const syncSession = async () => {
      console.log('[useServerSession] Checking for server session...')
      
      // Get the supabase client from authService
      const supabase = authService.getSupabaseClient()
      if (!supabase) {
        console.log('[useServerSession] Supabase client not available')
        return
      }
      
      // Get the session from cookies (set by server)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[useServerSession] Error getting session:', error)
        return
      }
      
      if (session) {
        console.log('[useServerSession] Found server session:', session.user?.email)
        
        // Force a manual session update in authService
        const currentUser = authService.getCurrentUser()
        
        if (!currentUser || currentUser.id !== session.user.id) {
          console.log('[useServerSession] Syncing session with authService...')
          
          // Manually trigger the auth state change
          // This ensures the AuthContext updates even if the event didn't fire
          const authChangeHandler = (authService as any).onAuthChange
          if (authChangeHandler) {
            authChangeHandler(session.user)
          }
          
          // Also trigger a re-initialization to be safe
          await authService.initialize()
        }
      }
    }
    
    // Run sync on mount
    syncSession()
    
    // Also run after a short delay to handle any race conditions
    const timer = setTimeout(syncSession, 500)
    
    return () => clearTimeout(timer)
  }, [])
}