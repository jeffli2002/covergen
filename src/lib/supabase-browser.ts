import { getSupabaseBrowserClient } from './supabase-singleton'

export function createSupabaseBrowser() {
  return getSupabaseBrowserClient()
}