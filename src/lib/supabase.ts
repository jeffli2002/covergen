// Simple working approach - exactly like VideoTutor
import { createClient } from '@supabase/supabase-js'

// Create client - simple and working
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'coverimage_session'
    }
  }
)

// Re-exports for compatibility
export { createClient as createSupabaseClient } from './supabase/client'

