// Debug route to test OAuth callback environment and configuration
import { NextRequest, NextResponse } from 'next/server'
import { authConfig } from '@/lib/bestauth/config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Check environment variables
  const envCheck = {
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    BESTAUTH_JWT_SECRET: !!process.env.BESTAUTH_JWT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Check OAuth configuration
  const oauthConfig = {
    google: {
      clientId: authConfig.oauth.google.clientId ? 'Set' : 'Missing',
      clientSecret: authConfig.oauth.google.clientSecret ? 'Set' : 'Missing',
      urls: {
        auth: authConfig.oauth.google.authorizationUrl,
        token: authConfig.oauth.google.tokenUrl,
        userInfo: authConfig.oauth.google.userInfoUrl,
      }
    }
  }

  // Check request parameters
  const params = {
    code: searchParams.get('code'),
    state: searchParams.get('state'),
    scope: searchParams.get('scope'),
    error: searchParams.get('error'),
  }

  // Test database connection
  let dbTest = { status: 'unknown', error: null as any }
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    // Test a simple query
    const { data, error } = await supabase
      .from('bestauth_users')
      .select('count')
      .limit(1)
    
    if (error) {
      dbTest = { status: 'error', error: error.message }
    } else {
      dbTest = { status: 'connected', error: null }
    }
  } catch (e) {
    dbTest = { status: 'error', error: e instanceof Error ? e.message : 'Unknown error' }
  }

  return NextResponse.json({
    envCheck,
    oauthConfig,
    params,
    dbTest,
    headers: {
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      cookie: request.headers.get('cookie') ? 'Present' : 'Missing',
    }
  }, { status: 200 })
}