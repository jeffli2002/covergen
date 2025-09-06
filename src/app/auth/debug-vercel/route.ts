import { NextResponse } from 'next/server'

/**
 * Debug endpoint to diagnose OAuth and cookie issues on Vercel preview deployments
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  // Get all cookies from the request
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [name, ...valueParts] = cookie.split('=')
    acc[name] = valueParts.join('=')
    return acc
  }, {} as Record<string, string>)
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      hostname: request.headers.get('host'),
      isVercelPreview: request.headers.get('host')?.includes('vercel.app'),
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    },
    cookies: {
      count: Object.keys(cookies).length,
      authCookies: Object.keys(cookies).filter(name => 
        name.includes('sb-') || 
        name.includes('supabase') || 
        name.includes('auth')
      ),
      sessionData: !!cookies['sb-session-data'],
      authMarkers: {
        'auth-callback-success': !!cookies['auth-callback-success'],
        'vercel-auth-complete': !!cookies['vercel-auth-complete']
      }
    },
    supabaseConfig: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }
  
  // If action=test-cookie, try to set a test cookie
  if (action === 'test-cookie') {
    const response = NextResponse.json({
      ...debugInfo,
      testCookie: {
        action: 'setting test cookie',
        name: 'vercel-debug-test',
        value: Date.now().toString()
      }
    })
    
    response.cookies.set({
      name: 'vercel-debug-test',
      value: Date.now().toString(),
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 5 // 5 minutes
    })
    
    return response
  }
  
  // If action=clear, clear all auth-related cookies
  if (action === 'clear') {
    const response = NextResponse.json({
      ...debugInfo,
      action: 'clearing auth cookies',
      cleared: Object.keys(cookies).filter(name => 
        name.includes('sb-') || 
        name.includes('supabase') || 
        name.includes('auth')
      )
    })
    
    // Clear all auth-related cookies
    Object.keys(cookies).forEach(name => {
      if (name.includes('sb-') || name.includes('supabase') || name.includes('auth')) {
        response.cookies.set({
          name,
          value: '',
          maxAge: 0,
          path: '/'
        })
      }
    })
    
    return response
  }
  
  return NextResponse.json(debugInfo)
}