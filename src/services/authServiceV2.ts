// Enhanced Auth Service for Production OAuth
import { createOAuthSupabaseClient, getOAuthRedirectUrl, validateOAuthEnvironment } from '@/lib/supabase-oauth-config'

class AuthServiceV2 {
  private supabase = createOAuthSupabaseClient()

  async signInWithGoogle() {
    try {
      // First validate environment
      const validation = await validateOAuthEnvironment()
      if (!validation.isValid) {
        console.error('[AuthV2] Environment validation failed:', validation.errors)
        throw new Error('OAuth environment not properly configured')
      }

      if (validation.warnings.length > 0) {
        console.warn('[AuthV2] Environment warnings:', validation.warnings)
      }

      // Get current path for redirect
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/en'
      const redirectUrl = getOAuthRedirectUrl(currentPath)

      console.log('[AuthV2] Initiating OAuth flow:', {
        redirectUrl,
        origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
        env: process.env.NODE_ENV
      })

      // Clear any existing session first (helps with stuck states)
      await this.clearSession()

      // Initiate OAuth flow with explicit PKCE parameters
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            // Force PKCE flow with response_type
            response_type: 'code'
          } as any,
          // Add scopes if needed
          scopes: 'email profile',
        }
      })

      if (error) {
        console.error('[AuthV2] OAuth error:', error)
        throw error
      }

      if (!data?.url) {
        throw new Error('No OAuth URL returned')
      }

      console.log('[AuthV2] OAuth URL generated successfully')
      
      // In production, we might want to add a small delay to ensure cookies are set
      if (process.env.NODE_ENV === 'production') {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Redirect to OAuth provider
      window.location.href = data.url

      return { success: true, url: data.url }
    } catch (error) {
      console.error('[AuthV2] Sign in error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async handleOAuthCallback() {
    try {
      console.log('[AuthV2] Handling OAuth callback')

      // Check for error in URL params
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')

      if (error) {
        console.error('[AuthV2] OAuth provider error:', { error, errorDescription })
        throw new Error(errorDescription || error)
      }

      // Exchange code for session
      const { data, error: exchangeError } = await this.supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (exchangeError) {
        console.error('[AuthV2] Code exchange error:', exchangeError)
        throw exchangeError
      }

      if (!data?.session) {
        throw new Error('No session returned after code exchange')
      }

      console.log('[AuthV2] Session established successfully')

      // Verify session is properly stored
      const { data: sessionData } = await this.supabase.auth.getSession()
      if (!sessionData?.session) {
        console.warn('[AuthV2] Session not persisted after exchange')
      }

      return { success: true, session: data.session }
    } catch (error) {
      console.error('[AuthV2] Callback handling error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle OAuth callback'
      }
    }
  }

  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('[AuthV2] Get session error:', error)
        return null
      }

      return data?.session || null
    } catch (error) {
      console.error('[AuthV2] Session check error:', error)
      return null
    }
  }

  async clearSession() {
    try {
      // Sign out from Supabase
      await this.supabase.auth.signOut()
      
      // Clear all auth-related storage in production
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key)
          }
        })

        // Clear cookies (attempt to clear with various domain settings)
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          if (name.includes('sb-') || name.includes('supabase')) {
            // Try multiple domain variations
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`
          }
        })
      }

      console.log('[AuthV2] Session cleared')
    } catch (error) {
      console.error('[AuthV2] Clear session error:', error)
    }
  }

  // Debug helper
  async debugAuthState() {
    const session = await this.getSession()
    const validation = await validateOAuthEnvironment()
    
    const debugInfo = {
      hasSession: !!session,
      userId: session?.user?.id || null,
      environment: {
        valid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      browser: {
        cookies: document.cookie,
        localStorage: Object.keys(localStorage).filter(k => k.includes('supabase')),
        origin: window.location.origin,
        protocol: window.location.protocol
      }
    }

    console.log('[AuthV2] Debug info:', debugInfo)
    return debugInfo
  }
}

export const authServiceV2 = new AuthServiceV2()