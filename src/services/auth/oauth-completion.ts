import { supabase, getSession } from '@/lib/supabase-simple'

interface OAuthCompletionOptions {
  onRetry?: (attempt: number) => void
}

interface OAuthCompletionResult {
  success: boolean
  session: any | null
  user: any | null
  error?: string
  redirectPath?: string
}

class OAuthCompletion {
  private maxRetries = 5
  private retryDelay = 1000

  async completeOAuthFlow(
    nextPath: string = '/en',
    options?: OAuthCompletionOptions
  ): Promise<OAuthCompletionResult> {
    console.log('[OAuth Completion] Starting OAuth completion flow', {
      nextPath,
      timestamp: new Date().toISOString()
    })

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      if (attempt > 0) {
        console.log(`[OAuth Completion] Retry attempt ${attempt}/${this.maxRetries - 1}`)
        options?.onRetry?.(attempt)
        await this.delay(this.retryDelay * attempt)
      }

      try {
        // Try to get the session
        const session = await getSession()
        
        if (session) {
          console.log('[OAuth Completion] Session detected:', {
            user: session.user?.email,
            expiresAt: session.expires_at,
            attempt
          })
          
          return {
            success: true,
            session,
            user: session.user,
            redirectPath: nextPath
          }
        } else {
          console.log('[OAuth Completion] No session found on attempt', attempt + 1)
          
          // On the last attempt, check if cookies are set but session detection failed
          if (attempt === this.maxRetries - 1) {
            // Check for sb- cookies in document.cookie
            if (typeof window !== 'undefined' && document.cookie.includes('sb-')) {
              console.warn('[OAuth Completion] Cookies present but session not detected')
              
              // Try one more time with a fresh client instance
              const { data: { session: freshSession } } = await supabase.auth.getSession()
              if (freshSession) {
                return {
                  success: true,
                  session: freshSession,
                  user: freshSession.user,
                  redirectPath: nextPath
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error('[OAuth Completion] Error during session detection:', error)
        
        // Don't throw on retryable errors
        if (attempt < this.maxRetries - 1) {
          continue
        }
        
        return {
          success: false,
          session: null,
          user: null,
          error: `Failed to detect session: ${error.message}`
        }
      }
    }
    
    return {
      success: false,
      session: null,
      user: null,
      error: 'Session detection timed out after multiple attempts'
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const oauthCompletion = new OAuthCompletion()