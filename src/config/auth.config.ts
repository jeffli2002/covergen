/**
 * Authentication Configuration
 * 
 * Switch between BestAuth and Supabase by changing USE_BESTAUTH
 */

export const authConfig = {
  // Set to true to use BestAuth, false to use Supabase
  USE_BESTAUTH: true,
  
  // BestAuth configuration
  BESTAUTH: {
    enabled: true,
    providers: ['google', 'email'],
    sessionDuration: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Supabase configuration (backup)
  SUPABASE: {
    enabled: false,
    providers: ['google', 'email'],
  }
}

export const useAuthProvider = () => authConfig.USE_BESTAUTH ? 'bestauth' : 'supabase'

// OAuth redirect persistence helpers
export const OAUTH_NEXT_COOKIE_NAME = 'covergen_oauth_next'
export const OAUTH_NEXT_STORAGE_KEY = 'covergen_post_auth_redirect'
