import { getSupabaseBrowserClient } from '@/lib/supabase-singleton'
import { AuthProvider, AuthResult, AuthSession } from '../types'
import { authEventBus } from '../eventBus'

export class GoogleOAuthProvider implements AuthProvider {
  private supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null
  private session: AuthSession | null = null
  private static instance: GoogleOAuthProvider | null = null

  constructor() {
    // Singleton pattern to ensure consistent state
    if (GoogleOAuthProvider.instance) {
      return GoogleOAuthProvider.instance
    }
    GoogleOAuthProvider.instance = this
  }

  async signIn(options?: { redirectUrl?: string }): Promise<AuthResult> {
    try {
      if (!this.supabase) {
        throw new Error('OAuth not available in server context')
      }

      // Default redirect URL
      const currentPath = window.location.pathname || '/en'
      const redirectUrl = options?.redirectUrl || 
        `${window.location.origin}/auth/callback/google?next=${encodeURIComponent(currentPath)}`

      console.log('[GoogleOAuth] Initiating sign in with redirect URL:', redirectUrl)

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      })

      if (error) {
        console.error('[GoogleOAuth] Sign in error:', error)
        
        // Emit error event
        await authEventBus.emit({
          type: 'auth:signin:error',
          error: error.message,
          metadata: { provider: 'google' }
        })

        return {
          success: false,
          error: error.message
        }
      }

      // OAuth flow will redirect to Google
      return {
        success: true,
        data
      }
    } catch (error: any) {
      console.error('[GoogleOAuth] Unexpected error:', error)
      
      await authEventBus.emit({
        type: 'auth:signin:error',
        error: error.message || 'Failed to initiate Google sign in',
        metadata: { provider: 'google' }
      })

      return {
        success: false,
        error: error.message || 'Failed to initiate Google sign in'
      }
    }
  }

  async handleCallback(code: string): Promise<AuthResult> {
    try {
      if (!this.supabase) {
        throw new Error('OAuth not available in server context')
      }

      console.log('[GoogleOAuth] Exchanging code for session')
      
      const { data, error } = await this.supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('[GoogleOAuth] Code exchange error:', error)
        
        await authEventBus.emit({
          type: 'auth:signin:error',
          error: error.message,
          metadata: { provider: 'google', step: 'callback' }
        })

        return {
          success: false,
          error: error.message
        }
      }

      if (!data?.session) {
        return {
          success: false,
          error: 'No session returned from code exchange'
        }
      }

      // Store session locally
      this.session = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: data.session.user as any
      }

      // Emit success event - listeners will handle profile sync, etc
      await authEventBus.emit({
        type: 'auth:signin:success',
        user: this.session.user,
        session: this.session,
        metadata: { provider: 'google' }
      })

      console.log('[GoogleOAuth] Sign in successful:', {
        user: this.session.user.email,
        userId: this.session.user.id
      })

      return {
        success: true,
        user: this.session.user,
        session: this.session
      }
    } catch (error: any) {
      console.error('[GoogleOAuth] Callback error:', error)
      
      await authEventBus.emit({
        type: 'auth:signin:error',
        error: error.message || 'Failed to complete sign in',
        metadata: { provider: 'google', step: 'callback' }
      })

      return {
        success: false,
        error: error.message || 'Failed to complete sign in'
      }
    }
  }

  async signOut(): Promise<AuthResult> {
    try {
      if (!this.supabase) {
        return {
          success: true
        }
      }

      const { error } = await this.supabase.auth.signOut()

      if (error) {
        console.error('[GoogleOAuth] Sign out error:', error)
        
        await authEventBus.emit({
          type: 'auth:signout:error',
          error: error.message,
          metadata: { provider: 'google' }
        })

        return {
          success: false,
          error: error.message
        }
      }

      // Clear local session
      const wasSignedIn = this.session !== null
      this.session = null

      // Only emit event if we were actually signed in
      if (wasSignedIn) {
        await authEventBus.emit({
          type: 'auth:signout:success',
          metadata: { provider: 'google' }
        })
      }

      return {
        success: true
      }
    } catch (error: any) {
      console.error('[GoogleOAuth] Sign out error:', error)
      
      await authEventBus.emit({
        type: 'auth:signout:error',
        error: error.message || 'Failed to sign out',
        metadata: { provider: 'google' }
      })

      return {
        success: false,
        error: error.message || 'Failed to sign out'
      }
    }
  }

  getSession(): AuthSession | null {
    return this.session
  }

  isSessionValid(): boolean {
    if (!this.session || !this.session.expires_at) {
      return false
    }

    const expiresAt = new Date(this.session.expires_at * 1000)
    const now = new Date()
    return now < expiresAt
  }

  // Static method to get instance
  static getInstance(): GoogleOAuthProvider {
    if (!GoogleOAuthProvider.instance) {
      GoogleOAuthProvider.instance = new GoogleOAuthProvider()
    }
    return GoogleOAuthProvider.instance
  }
}