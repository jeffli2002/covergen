// Re-export our singleton client to eliminate multiple instances
import { supabase } from '@/lib/supabase'

export function getSupabaseBrowserClient() {
  return supabase
}