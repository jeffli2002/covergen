import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Server-side environment check
  const serverEnv: any = {
    timestamp: new Date().toISOString(),
    runtime: 'server',
    node_version: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
    },
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    }
  }

  // Check if we can parse Supabase URL
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      serverEnv.supabase = {
        configured: true,
        hostname: url.hostname,
        projectRef: url.hostname.split('.')[0]
      }
    } catch (e) {
      serverEnv.supabase = {
        configured: false,
        error: 'Invalid URL format'
      }
    }
  } else {
    serverEnv.supabase = {
      configured: false,
      error: 'NEXT_PUBLIC_SUPABASE_URL not set'
    }
  }

  return NextResponse.json(serverEnv)
}