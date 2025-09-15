import { NextResponse } from 'next/server'

export async function GET() {
  console.log('[Env Check] Checking environment variables...')
  
  const envCheck: any = {
    timestamp: new Date().toISOString(),
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    },
    site: {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      nodeEnv: process.env.NODE_ENV || 'not set',
    },
    vercel: {
      env: process.env.VERCEL_ENV || 'not set',
      url: process.env.VERCEL_URL || 'not set',
    }
  }
  
  // Log the actual values (partially masked for security)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      envCheck.supabase.hostname = url.hostname
      envCheck.supabase.projectRef = url.hostname.split('.')[0]
    } catch (e) {
      envCheck.supabase.urlError = 'Invalid URL format'
    }
  }
  
  console.log('[Env Check] Results:', envCheck)
  
  return NextResponse.json(envCheck)
}