import { NextResponse } from 'next/server'

/**
 * Test callback route to verify if OAuth callbacks are reaching our routes
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Log all details
  console.log('[Auth Callback Test] Received request:', {
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: {
      host: request.headers.get('host'),
      referer: request.headers.get('referer'),
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...'
    }
  })
  
  // Create a simple response that shows what was received
  const debugInfo = {
    message: 'Callback test route reached',
    timestamp: new Date().toISOString(),
    receivedParams: Object.fromEntries(searchParams.entries()),
    hasCode: searchParams.has('code'),
    hasError: searchParams.has('error')
  }
  
  // If there's a 'next' param, redirect there with debug info
  const next = searchParams.get('next') || '/en'
  const redirectUrl = new URL(next, request.url)
  redirectUrl.searchParams.set('callback_test', 'true')
  redirectUrl.searchParams.set('had_code', String(!!searchParams.get('code')))
  
  return NextResponse.redirect(redirectUrl.toString())
}