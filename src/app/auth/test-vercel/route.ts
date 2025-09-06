import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')
  
  if (test === 'cookies') {
    // Test setting cookies
    const response = NextResponse.json({
      message: 'Cookies set successfully',
      timestamp: new Date().toISOString()
    })
    
    // Test regular cookie
    response.cookies.set({
      name: 'test-cookie',
      value: 'test-value',
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60
    })
    
    // Test auth-like cookie
    response.cookies.set({
      name: 'sb-test-auth-token',
      value: JSON.stringify({ test: true, timestamp: Date.now() }),
      httpOnly: false, // Must be readable by client
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60
    })
    
    return response
  }
  
  if (test === 'read') {
    // Test reading cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    return NextResponse.json({
      cookies: allCookies.map(c => ({ name: c.name, value: c.value })),
      hasSbCookies: allCookies.some(c => c.name.includes('sb-')),
      hasTestCookie: allCookies.some(c => c.name === 'test-cookie'),
      timestamp: new Date().toISOString()
    })
  }
  
  // Default response
  return NextResponse.json({
    message: 'Vercel cookie test endpoint',
    usage: {
      setCookies: '/auth/test-vercel?test=cookies',
      readCookies: '/auth/test-vercel?test=read'
    }
  })
}