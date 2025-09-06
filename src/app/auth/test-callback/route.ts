import { NextResponse } from 'next/server'

/**
 * Simple test route to verify OAuth callback functionality
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isVercelPreview = request.headers.get('host')?.includes('vercel.app') || 
                         process.env.VERCEL_ENV === 'preview'
  
  const testInfo = {
    timestamp: new Date().toISOString(),
    url: request.url,
    isVercelPreview,
    host: request.headers.get('host'),
    searchParams: Object.fromEntries(searchParams.entries()),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }
  
  // Test setting cookies
  const response = NextResponse.json(testInfo)
  
  response.cookies.set({
    name: 'test-cookie',
    value: 'test-value-' + Date.now(),
    httpOnly: false,
    secure: isVercelPreview,
    sameSite: 'lax',
    path: '/',
    maxAge: 60
  })
  
  return response
}