import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a simple browser client that works with server-set cookies
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Let server handle OAuth callbacks
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  // Use default cookie handling from @supabase/ssr
  // which properly handles httpOnly cookies set by the server
})