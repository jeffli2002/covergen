import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  // Construct the Supabase OAuth callback URL
  const supabaseCallbackUrl = `${supabaseUrl}/auth/v1/callback?${searchParams.toString()}`
  
  // Redirect to the actual Supabase OAuth callback
  return NextResponse.redirect(supabaseCallbackUrl)
}