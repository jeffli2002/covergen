import { NextResponse } from 'next/server'

export async function GET() {
  // Check critical environment variables
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      isValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co'),
      host: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host : null
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || null
    },
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    VERCEL: process.env.VERCEL || 'false',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    CI: process.env.CI || 'false'
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: env,
    runtime: {
      version: process.version,
      platform: process.platform
    }
  })
}