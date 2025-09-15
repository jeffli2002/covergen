import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('[supabase-simple] Initializing with:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0,
  nodeEnv: process.env.NODE_ENV
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase-simple] Missing environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'SET' : 'NOT SET'
  })
  throw new Error('Missing Supabase environment variables')
}

// Create a simple Supabase client without SSR complications
// This follows the pattern recommended in CLAUDE.md for OAuth flows
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow consistently
  }
})

console.log('[supabase-simple] Client created successfully')