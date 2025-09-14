import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client for browser-side usage
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Client] Missing required environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing')
    
    // Return null to indicate client creation failed
    return null as any
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

// Legacy export for backward compatibility
export const supabase = createSupabaseClient()