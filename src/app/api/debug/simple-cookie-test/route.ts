import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Simple cookie test',
    timestamp: new Date().toISOString(),
  })

  // Test 1: Basic cookie
  response.cookies.set('test-basic', 'basic-value', {
    path: '/',
    maxAge: 3600,
  })

  // Test 2: Secure cookie with SameSite=None
  response.cookies.set('test-secure', 'secure-value', {
    path: '/',
    maxAge: 3600,
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  })

  // Test 3: Lax cookie
  response.cookies.set('test-lax', 'lax-value', {
    path: '/',
    maxAge: 3600,
    sameSite: 'lax',
  })

  // Test 4: Using the exact session cookie name
  response.cookies.set('bestauth.session', 'test-session-token', {
    path: '/',
    maxAge: 3600,
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  })

  console.log('Simple cookie test - setting cookies:')
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      console.log(`  ${key}: ${value}`)
    }
  })

  return response
}