import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage that ensures PKCE verifier is properly stored
const customStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      const value = window.sessionStorage.getItem(key)
      console.log(`[PKCE Storage] GET ${key}:`, value ? 'found' : 'not found')
      return value
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      console.log(`[PKCE Storage] SET ${key}:`, value.substring(0, 50) + '...')
      window.sessionStorage.setItem(key, value)
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      console.log(`[PKCE Storage] REMOVE ${key}`)
      window.sessionStorage.removeItem(key)
    }
  }
}

export const supabasePKCE = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    storageKey: 'supabase-auth',
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})