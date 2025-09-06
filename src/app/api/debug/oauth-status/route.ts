import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  // Get specific auth-related cookies
  const authCookies = allCookies.filter(c => 
    c.name.includes('sb-') || 
    c.name.includes('auth') || 
    c.name.includes('session')
  )
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      referer: request.headers.get('referer'),
      'user-agent': request.headers.get('user-agent')
    },
    cookies: {
      total: allCookies.length,
      authCookies: authCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite
      })),
      hasSbSessionData: allCookies.some(c => c.name === 'sb-session-data'),
      hasAuthCallbackSuccess: allCookies.some(c => c.name === 'auth-callback-success'),
      hasVercelAuthComplete: allCookies.some(c => c.name === 'vercel-auth-complete')
    },
    env: {
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV
    }
  })
}