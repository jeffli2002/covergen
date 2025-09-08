// Re-export the singleton instance from supabase-simple
// This ensures all code paths use the exact same instance
import { supabase } from '@/lib/supabase-simple'

export function createSimpleClient() {
  console.log('[Simple Client] Returning singleton instance from supabase-simple')
  return supabase
}