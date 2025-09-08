import { NextResponse } from 'next/server'

/**
 * PKCE OAuth callback route that immediately redirects to client-side handler
 * This route does NO server-side processing to avoid PKCE code_verifier issues
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  
  // Simply redirect to client-side handler with all params intact
  const clientUrl = new URL(`${origin}/auth/callback-handler`, request.url)
  
  // Copy all search params
  searchParams.forEach((value, key) => {
    clientUrl.searchParams.set(key, value)
  })
  
  // Ensure we have a next URL
  if (!clientUrl.searchParams.has('next')) {
    clientUrl.searchParams.set('next', '/en')
  }

  console.log('[PKCE Callback] Redirecting to client handler:', clientUrl.pathname + clientUrl.search)
  
  return NextResponse.redirect(clientUrl.toString())
}