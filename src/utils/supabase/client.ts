import { createBrowserClient } from '@supabase/ssr'
import { createVercelOptimizedClient } from '@/lib/supabase/vercel-client'

export function createClient() {
  // Use Vercel-optimized client for preview deployments
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return createVercelOptimizedClient()
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}