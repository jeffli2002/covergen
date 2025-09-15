import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    }
    
    // Check OAuth callback URL
    const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    const callbackUrl = isLocalDev 
      ? `http://localhost:3001/auth/callback`
      : `${url.origin}/auth/callback`
    
    // Check Supabase configuration
    let supabaseInfo = {}
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
        supabaseInfo = {
          configured: true,
          projectRef: supabaseUrl.hostname.split('.')[0],
          domain: supabaseUrl.hostname,
        }
      } catch (e) {
        supabaseInfo = {
          configured: false,
          error: 'Invalid Supabase URL format'
        }
      }
    } else {
      supabaseInfo = {
        configured: false,
        error: 'Missing Supabase environment variables'
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      oauth: {
        isLocalDev,
        expectedCallbackUrl: callbackUrl,
        redirectUrl: `${callbackUrl}?next=/en`,
        origin: url.origin,
        hostname: url.hostname,
      },
      supabase: supabaseInfo,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      },
      tips: [
        'Ensure the callback URL is added to Supabase Auth settings',
        'For production, use your actual domain (not localhost)',
        'Check that Google OAuth is enabled in Supabase',
        'Verify OAuth consent screen is configured in Google Cloud Console',
      ]
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug route error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}