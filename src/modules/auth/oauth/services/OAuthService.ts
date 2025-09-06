// OAuth Service - Isolated authentication logic
import { supabase } from '@/lib/supabase'
import type { OAuthProvider, OAuthUser, OAuthSession, OAuthError } from '../types'

class OAuthService {
  private static instance: OAuthService
  private listeners: Map<string, Set<Function>> = new Map()

  private constructor() {}

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService()
    }
    return OAuthService.instance
  }

  // Event emitter methods
  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  // OAuth methods
  async signIn(provider: OAuthProvider): Promise<{ success: boolean; error?: OAuthError }> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        const oauthError: OAuthError = {
          code: 'OAUTH_SIGNIN_FAILED',
          message: error.message,
          details: error
        }
        this.emit('error', oauthError)
        return { success: false, error: oauthError }
      }

      return { success: true }
    } catch (error) {
      const oauthError: OAuthError = {
        code: 'OAUTH_SIGNIN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
      this.emit('error', oauthError)
      return { success: false, error: oauthError }
    }
  }

  async signOut(): Promise<{ success: boolean; error?: OAuthError }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const oauthError: OAuthError = {
          code: 'OAUTH_SIGNOUT_FAILED',
          message: error.message,
          details: error
        }
        this.emit('error', oauthError)
        return { success: false, error: oauthError }
      }

      this.emit('signOut')
      return { success: true }
    } catch (error) {
      const oauthError: OAuthError = {
        code: 'OAUTH_SIGNOUT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
      this.emit('error', oauthError)
      return { success: false, error: oauthError }
    }
  }

  async getSession(): Promise<OAuthSession | null> {
    try {
      // First check if we have a session from the URL (after OAuth callback)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      
      if (accessToken) {
        console.log('OAuth: Found access token in URL, attempting to set session')
        // Let Supabase handle the URL tokens
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!error && session) {
          // Clear the hash to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('OAuth: Error getting session', error)
        return null
      }
      
      if (!session) {
        console.log('OAuth: No session found')
        return null
      }

      const oauthUser: OAuthUser = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name,
        avatar: session.user.user_metadata?.avatar_url,
        provider: (session.user.app_metadata?.provider as OAuthProvider) || 'google',
        metadata: session.user.user_metadata
      }

      console.log('OAuth: Session found for user', oauthUser.email)

      return {
        user: oauthUser,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at
      }
    } catch (error) {
      console.error('OAuth: Failed to get session', error)
      return null
    }
  }

  async refreshSession(): Promise<{ success: boolean; session?: OAuthSession; error?: OAuthError }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error || !session) {
        const oauthError: OAuthError = {
          code: 'OAUTH_REFRESH_FAILED',
          message: error?.message || 'Failed to refresh session',
          details: error
        }
        return { success: false, error: oauthError }
      }

      const oauthUser: OAuthUser = {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name,
        avatar: session.user.user_metadata?.avatar_url,
        provider: (session.user.app_metadata?.provider as OAuthProvider) || 'google',
        metadata: session.user.user_metadata
      }

      const oauthSession: OAuthSession = {
        user: oauthUser,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at
      }

      this.emit('tokenRefreshed', oauthSession)
      return { success: true, session: oauthSession }
    } catch (error) {
      const oauthError: OAuthError = {
        code: 'OAUTH_REFRESH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }
      return { success: false, error: oauthError }
    }
  }

  // Initialize auth state listener
  initializeAuthListener(callback: (session: OAuthSession | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session) {
        const oauthUser: OAuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name,
          avatar: session.user.user_metadata?.avatar_url,
          provider: (session.user.app_metadata?.provider as OAuthProvider) || 'google',
          metadata: session.user.user_metadata
        }

        const oauthSession: OAuthSession = {
          user: oauthUser,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at
        }

        callback(oauthSession)

        if (event === 'SIGNED_IN') {
          this.emit('signIn', oauthUser)
        }
      } else {
        callback(null)
      }
    })

    return subscription.unsubscribe
  }
}

export const oauthService = OAuthService.getInstance()