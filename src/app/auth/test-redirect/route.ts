import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  
  // Log the incoming request
  console.log('[Test Redirect] Received request:', {
    path: url.pathname,
    code: code ? 'present' : 'missing',
    fullUrl: request.url
  })
  
  // Return diagnostic information
  return NextResponse.json({
    success: true,
    path: url.pathname,
    hasCode: !!code,
    origin: url.origin,
    message: 'If you see this, the redirect is working correctly',
    nextStep: 'Update Supabase dashboard with this URL as a redirect URI'
  })
}