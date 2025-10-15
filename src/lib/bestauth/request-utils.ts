// BestAuth Request Utilities
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { validateSession as validateSessionCore } from './core'
import type { AuthResult, User } from './types'

/**
 * Extract Bearer token from request headers
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

/**
 * Extract session token from cookies
 */
export async function extractSessionToken(request: NextRequest): Promise<string | null> {
  // First try request cookies (Edge runtime compatible)
  const requestCookie = request.cookies.get('bestauth_session')
  if (requestCookie?.value) {
    return requestCookie.value
  }
  
  // Then try Next.js cookies() API (Node.js runtime only)
  try {
    const cookieStore = await cookies()
    const serverCookie = cookieStore.get('bestauth_session')
    if (serverCookie?.value) {
      return serverCookie.value
    }
  } catch (e) {
    // cookies() API not available (Edge runtime or other context)
  }
  
  return null
}

/**
 * Validate session from NextRequest
 * Checks cookies first, then falls back to Bearer token
 */
export async function validateSessionFromRequest(request: NextRequest): Promise<AuthResult<{ user: User }>> {
  // Try to get token from cookies first (most common for web browsers)
  let token = await extractSessionToken(request)
  
  // Fall back to Authorization header (for API clients)
  if (!token) {
    token = extractBearerToken(request)
  }
  
  if (!token) {
    return {
      success: false,
      error: 'No authorization token provided (checked cookies and headers)'
    }
  }
  
  const result = await validateSessionCore(token)
  
  if (!result.success) {
    return {
      success: false,
      error: result.error
    }
  }
  
  // Transform the result to match the expected structure
  return {
    success: true,
    data: {
      user: result.data!
    }
  }
}