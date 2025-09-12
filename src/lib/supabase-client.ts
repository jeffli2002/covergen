import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client for browser-side usage
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Legacy export for backward compatibility
export const supabase = createSupabaseClient()