import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      cwd: process.cwd()
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 
          'NOT SET'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'
    },
    supabase: {
      canCreateClient: false,
      authWorking: false,
      error: null as string | null
    }
  }
  
  // Test Supabase client
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (url && key) {
      const supabase = createClient(url, key)
      diagnostics.supabase.canCreateClient = true
      
      const { error } = await supabase.auth.getSession()
      if (!error) {
        diagnostics.supabase.authWorking = true
      } else {
        diagnostics.supabase.error = error.message
      }
    } else {
      diagnostics.supabase.error = 'Missing URL or Key'
    }
  } catch (error) {
    diagnostics.supabase.error = String(error)
  }
  
  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
}