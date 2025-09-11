import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // Get OAuth URL to see what redirect URL is being sent
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback-popup`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: true
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Parse the OAuth URL to see what's actually being sent
    const oauthUrl = new URL(data.url!)
    const redirectUri = oauthUrl.searchParams.get('redirect_uri')
    
    return NextResponse.json({
      success: true,
      oauthUrl: data.url,
      parsedRedirectUri: redirectUri,
      expectedRedirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/callback-popup`,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
      note: 'Check if parsedRedirectUri matches expectedRedirectUri'
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}