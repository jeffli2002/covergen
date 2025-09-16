import { createClient } from '@supabase/supabase-js'

// Create a properly configured Supabase client for PKCE flow
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabasePKCE = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export async function signInWithGooglePKCE() {
  try {
    const currentPath = window.location.pathname || '/en'
    const redirectUrl = `${window.location.origin}/auth/callback-production?next=${encodeURIComponent(currentPath)}`
    
    // The key fix: We need to ensure response_type=code is included
    const { data, error } = await supabasePKCE.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code' // CRITICAL: Force response_type=code
        }
      }
    })
    
    if (error) {
      console.error('[Auth] OAuth error:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (error: any) {
    console.error('[Auth] Sign in with Google failed:', error)
    return { success: false, error: error.message || 'Failed to initiate Google sign in' }
  }
}