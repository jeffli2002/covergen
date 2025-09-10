/**
 * Session bridge for handling OAuth callbacks on Vercel preview deployments
 * This handles the transfer of session data from server-side cookies to client-side storage
 */

import { supabase } from '@/lib/supabase-simple'
import type { SupabaseClient } from '@supabase/supabase-js'

interface SessionData {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
  token_type?: string
  user?: any
}

export class VercelSessionBridge {
  private static readonly SESSION_COOKIE_NAME = 'sb-session-data'
  private static readonly AUTH_MARKER_COOKIE = 'auth-callback-success'
  private static readonly VERCEL_MARKER_COOKIE = 'vercel-auth-complete'
  
  /**
   * Attempts to recover session from temporary server-side cookie
   * and properly initialize the Supabase client
   */
  static async recoverSession(supabaseClient?: SupabaseClient): Promise<boolean> {
    console.log('[VercelSessionBridge] Attempting session recovery...')
    
    // Use the provided client or fallback to the singleton
    const client = supabaseClient || supabase
    
    // Check for session data cookie
    const sessionDataCookie = this.getCookie(this.SESSION_COOKIE_NAME)
    if (!sessionDataCookie) {
      console.log('[VercelSessionBridge] No session data cookie found')
      return false
    }
    
    try {
      const sessionData: SessionData = JSON.parse(decodeURIComponent(sessionDataCookie))
      console.log('[VercelSessionBridge] Found session data, attempting to set session...')
      
      // Set the session in Supabase
      const { data, error } = await client.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      })
      
      if (error) {
        console.error('[VercelSessionBridge] Failed to set session:', error)
        return false
      }
      
      if (!data.session) {
        console.error('[VercelSessionBridge] No session returned after setSession')
        return false
      }
      
      console.log('[VercelSessionBridge] Session successfully set:', {
        user: data.session.user.email,
        userId: data.session.user.id,
        expiresAt: data.session.expires_at
      })
      
      // Clean up temporary cookies
      this.deleteCookie(this.SESSION_COOKIE_NAME)
      this.deleteCookie(this.AUTH_MARKER_COOKIE)
      this.deleteCookie(this.VERCEL_MARKER_COOKIE)
      
      // Force a session refresh to ensure it's properly stored
      const { data: refreshData, error: refreshError } = await client.auth.refreshSession()
      if (refreshError) {
        console.error('[VercelSessionBridge] Failed to refresh session:', refreshError)
      } else {
        console.log('[VercelSessionBridge] Session refreshed successfully')
      }
      
      return true
    } catch (error) {
      console.error('[VercelSessionBridge] Error processing session data:', error)
      // Clean up invalid cookie
      this.deleteCookie(this.SESSION_COOKIE_NAME)
      return false
    }
  }
  
  /**
   * Checks if OAuth callback markers are present
   */
  static hasAuthMarkers(): boolean {
    return !!(this.getCookie(this.AUTH_MARKER_COOKIE) || this.getCookie(this.VERCEL_MARKER_COOKIE))
  }
  
  /**
   * Gets a cookie value by name
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split('; ')
    for (const cookie of cookies) {
      const [cookieName, ...valueParts] = cookie.split('=')
      if (cookieName === name) {
        return valueParts.join('=') // Handle values with = signs
      }
    }
    return null
  }
  
  /**
   * Deletes a cookie by setting it to expire
   */
  private static deleteCookie(name: string): void {
    if (typeof document === 'undefined') return
    
    const cookieString = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; SameSite=lax`
    document.cookie = cookieString
    console.log(`[VercelSessionBridge] Deleted cookie: ${name}`)
  }
  
  /**
   * Waits for cookies to be available after redirect
   * This is necessary because cookies might not be immediately available after redirect
   */
  static async waitForCookies(timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (this.getCookie(this.SESSION_COOKIE_NAME) || this.hasAuthMarkers()) {
        console.log('[VercelSessionBridge] Cookies detected after', Date.now() - startTime, 'ms')
        return true
      }
      
      // Check if session already exists in localStorage
      const storageKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`
      if (typeof localStorage !== 'undefined' && localStorage.getItem(storageKey)) {
        console.log('[VercelSessionBridge] Session already in localStorage')
        return true
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('[VercelSessionBridge] Timeout waiting for cookies')
    return false
  }
}