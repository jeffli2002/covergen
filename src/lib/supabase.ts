// Compatibility layer for existing code that imports from '@/lib/supabase'
// Creates a singleton client instance for backward compatibility
import { createClient } from './supabase/client'

// Create and export a singleton instance
export const supabase = createClient()

// Note: This is a compatibility layer. New code should import createClient
// from './supabase/client', './supabase/server', or './supabase/browser-client'
// directly based on the context (server component, client component, etc.)