import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Simple pass-through to client-side handler
  // No Supabase client usage to avoid multiple instances
  const url = new URL(request.url)
  const redirectUrl = new URL('/auth/callback-handler', url.origin)
  
  // Copy all search params
  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })
  
  // Ensure next param exists
  if (!redirectUrl.searchParams.has('next')) {
    redirectUrl.searchParams.set('next', '/en')
  }

  console.log('[Auth Callback] Simple redirect to client handler:', redirectUrl.toString())
  return NextResponse.redirect(redirectUrl.toString())
}