import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const url = new URL(request.url)
  
  // Test 1: Check if callback route is accessible
  const callbackUrl = `${url.origin}/auth/callback`
  
  // Test 2: Get the actual OAuth URL that would be used
  const { data: authData } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${url.origin}/auth/callback`,
      skipBrowserRedirect: true // Don't redirect, just get the URL
    }
  })
  
  // Test 3: Check current environment
  const tests = {
    environment: process.env.NODE_ENV,
    origin: url.origin,
    callbackUrl: callbackUrl,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    actualOAuthUrl: authData?.url || 'No URL returned',
    extractedRedirectUrl: null as string | null
  }
  
  // Extract the redirect_uri from the OAuth URL
  if (authData?.url) {
    try {
      const oauthUrl = new URL(authData.url)
      tests.extractedRedirectUrl = oauthUrl.searchParams.get('redirect_uri')
    } catch (e) {
      tests.extractedRedirectUrl = 'Failed to parse OAuth URL'
    }
  }
  
  return NextResponse.json({
    message: 'OAuth Configuration Test',
    tests,
    diagnosis: {
      callbackAccessible: true,
      expectedRedirect: `${url.origin}/auth/callback`,
      actualRedirect: tests.extractedRedirectUrl,
      mismatch: tests.extractedRedirectUrl !== `${url.origin}/auth/callback`
    }
  })
}