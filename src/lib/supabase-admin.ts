/**
 * Admin Supabase client for server-side operations
 * This client can be imported in both server and client contexts
 * but should only be used in server-side code (API routes, server actions, etc.)
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Create admin client with service role key
// This is safe because the service role key is only available server-side
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)