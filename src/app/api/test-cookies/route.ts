import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action')
  
  if (action === 'set') {
    // Try different methods of setting cookies
    const response = NextResponse.json({ 
      message: 'Cookies set',
      timestamp: new Date().toISOString() 
    })
    
    // Method 1: Using response.cookies.set
    response.cookies.set('test-cookie-1', 'value1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    // Method 2: Using Set-Cookie header
    response.headers.append(
      'Set-Cookie',
      `test-cookie-2=value2; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )
    
    console.log('[Test Cookies] Setting cookies:', {
      method1: 'test-cookie-1',
      method2: 'test-cookie-2',
      headers: response.headers.getSetCookie()
    })
    
    return response
  }
  
  // Default: read cookies
  const cookieStore = cookies()
  const allCookies = cookieStore.getAll()
  
  return NextResponse.json({
    action: 'read',
    cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    count: allCookies.length,
    timestamp: new Date().toISOString()
  })
}