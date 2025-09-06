import { createClient } from '@/utils/supabase/client'

// Create a singleton instance for the browser
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = typeof window !== 'undefined' 
  ? (supabaseInstance || (supabaseInstance = createClient()))
  : null as any