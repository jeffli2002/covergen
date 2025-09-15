import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || request.url.split('/api')[0]
  
  // Create a basic Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const diagnostics: {
    timestamp: string
    environment: {
      nodeEnv: string | undefined
      hasSupabaseUrl: boolean
      hasSupabaseKey: boolean
      siteUrl: string
      computedOrigin: string
      headers: {
        host: string | null
        origin: string | null
        referer: string | null
        'x-forwarded-host': string | null
        'x-forwarded-proto': string | null
      }
    }
    redirectUrls: {
      callback: string
      callbackV2: string
      withNext: string
    }
    oauthTest?: {
      success: boolean
      error: string | null
      urlGenerated: boolean
    }
  } = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseAnonKey,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
      computedOrigin: origin,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      }
    },
    redirectUrls: {
      callback: `${origin}/auth/callback`,
      callbackV2: `${origin}/auth/callback-v2`,
      withNext: `${origin}/auth/callback?next=/en`,
    }
  }

  // Try to create OAuth URL
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })

      diagnostics.oauthTest = {
        success: !!data?.url,
        error: error?.message || null,
        urlGenerated: !!data?.url
      }
    } catch (err) {
      diagnostics.oauthTest = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        urlGenerated: false
      }
    }
  } else {
    diagnostics.oauthTest = {
      success: false,
      error: 'Missing Supabase credentials',
      urlGenerated: false
    }
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
}