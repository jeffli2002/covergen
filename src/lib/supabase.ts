// Single source of truth for Supabase client
// This ensures consistent OAuth flow handling across the application
import { getSupabaseBrowserClient } from './supabase-singleton'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Authentication features will be disabled.')
}

// Export the singleton instance
export const supabase = typeof window !== 'undefined' ? getSupabaseBrowserClient() : null!