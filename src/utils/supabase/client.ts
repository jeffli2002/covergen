import { createBrowserClient } from '@supabase/ssr'
import { createVercelOptimizedClient } from '@/lib/supabase/vercel-client'

// Singleton instance to prevent multiple client creation
let cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if it exists
  if (cachedClient) {
    return cachedClient
  }

  // Use Vercel-optimized client for preview deployments
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    cachedClient = createVercelOptimizedClient()
    return cachedClient
  }
  
  cachedClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return cachedClient
}