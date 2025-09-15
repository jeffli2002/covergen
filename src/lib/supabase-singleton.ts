// Re-export our singleton client to eliminate multiple instances
import { supabase } from '@/lib/supabase-client'

export function getSupabaseBrowserClient() {
  return supabase
}