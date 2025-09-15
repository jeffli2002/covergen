import { createClient } from '@supabase/supabase-js'

// Simple Supabase client for OAuth flows
// This avoids the complexity of SSR client that can cause issues with OAuth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase-simple] Missing required environment variables:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING'
  })
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Use PKCE flow consistently
  }
}) : null

// Log successful creation
if (supabase) {
  console.log('[supabase-simple] Supabase client created successfully')
} else {
  console.error('[supabase-simple] Failed to create Supabase client')
}