// BestAuth Cookie Management
import { serialize, parse } from 'cookie'
import { authConfig } from './config'
import type { NextRequest, NextResponse } from 'next/server'

// Cookie names
export const COOKIE_NAMES = {
  session: authConfig.session.name,
  csrf: 'bestauth.csrf',
  oauth_state: 'bestauth.oauth.state',
} as const

// Set a cookie
export function setCookie(
  response: NextResponse,
  name: string,
  value: string,
  options?: {
    maxAge?: number
    expires?: Date
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    path?: string
    domain?: string
  }
): void {
  const cookieOptions = {
    httpOnly: options?.httpOnly ?? authConfig.session.httpOnly,
    secure: options?.secure ?? authConfig.session.secure,
    sameSite: options?.sameSite ?? authConfig.session.sameSite,
    path: options?.path ?? authConfig.session.path,
    maxAge: options?.maxAge ?? authConfig.session.maxAge,
    expires: options?.expires,
    domain: options?.domain,
  }
  
  const serialized = serialize(name, value, cookieOptions)
  
  console.log('[setCookie] Setting cookie:', {
    name,
    valueLength: value.length,
    options: cookieOptions,
    serialized: serialized.substring(0, 100) + '...',
  })

  response.headers.append('Set-Cookie', serialized)
}

// Get a cookie value
export function getCookie(request: NextRequest, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return undefined

  const cookies = parse(cookieHeader)
  return cookies[name]
}

// Delete a cookie
export function deleteCookie(response: NextResponse, name: string): void {
  setCookie(response, name, '', {
    maxAge: 0,
    expires: new Date(0),
  })
}

// Set session cookie
export function setSessionCookie(response: NextResponse, token: string): void {
  // For OAuth callbacks, we need to use sameSite: 'none' with secure: true
  // to ensure cookies work across the OAuth redirect flow
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_URL !== undefined
  
  console.log('[setSessionCookie] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    isProduction,
    cookieName: COOKIE_NAMES.session,
    tokenLength: token.length,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  })
  
  setCookie(response, COOKIE_NAMES.session, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site OAuth, but requires secure
    maxAge: authConfig.session.maxAge,
    path: authConfig.session.path,
  })
}

// Get session cookie
export function getSessionCookie(request: NextRequest): string | undefined {
  return getCookie(request, COOKIE_NAMES.session)
}

// Delete session cookie
export function deleteSessionCookie(response: NextResponse): void {
  deleteCookie(response, COOKIE_NAMES.session)
}

// Set OAuth state cookie for CSRF protection
export function setOAuthStateCookie(response: NextResponse, state: string): void {
  setCookie(response, COOKIE_NAMES.oauth_state, state, {
    httpOnly: true,
    secure: authConfig.session.secure,
    sameSite: 'lax', // Important for OAuth redirects
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })
}

// Get OAuth state cookie
export function getOAuthStateCookie(request: NextRequest): string | undefined {
  return getCookie(request, COOKIE_NAMES.oauth_state)
}

// Delete OAuth state cookie
export function deleteOAuthStateCookie(response: NextResponse): void {
  deleteCookie(response, COOKIE_NAMES.oauth_state)
}

// CSRF token management
export function generateCSRFToken(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64url')
}

export function setCSRFCookie(response: NextResponse, token: string): void {
  setCookie(response, COOKIE_NAMES.csrf, token, {
    httpOnly: true,
    secure: authConfig.session.secure,
    sameSite: 'strict',
    maxAge: authConfig.session.maxAge,
    path: '/',
  })
}

export function getCSRFCookie(request: NextRequest): string | undefined {
  return getCookie(request, COOKIE_NAMES.csrf)
}

export function validateCSRFToken(request: NextRequest, token: string): boolean {
  const cookieToken = getCSRFCookie(request)
  return cookieToken === token
}