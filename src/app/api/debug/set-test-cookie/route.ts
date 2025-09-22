import { NextRequest, NextResponse } from 'next/server'
import { setCookie } from '@/lib/bestauth/cookies'
import { authConfig } from '@/lib/bestauth/config'

export async function GET(request: NextRequest) {
  // Create a response
  const response = NextResponse.json({
    message: 'Test cookies set',
    cookieConfig: {
      sessionName: authConfig.session.name,
      secure: authConfig.session.secure,
      sameSite: authConfig.session.sameSite,
      httpOnly: authConfig.session.httpOnly,
      path: authConfig.session.path,
      maxAge: authConfig.session.maxAge,
    }
  })

  // Set various test cookies
  setCookie(response, 'test-basic', 'basic-value', {
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  })

  setCookie(response, 'test-secure', 'secure-value', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax'
  })

  setCookie(response, authConfig.session.name, 'test-session-token', {
    httpOnly: authConfig.session.httpOnly,
    secure: authConfig.session.secure,
    sameSite: authConfig.session.sameSite,
    path: authConfig.session.path,
    maxAge: authConfig.session.maxAge,
  })

  // Log what we're setting
  console.log('Setting test cookies:')
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      console.log(`  ${key}: ${value}`)
    }
  })

  return response
}