// BestAuth Request Utilities
import { NextRequest } from 'next/server'
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
 * Validate session from NextRequest
 */
export async function validateSessionFromRequest(request: NextRequest): Promise<AuthResult<{ user: User }>> {
  const token = extractBearerToken(request)
  
  if (!token) {
    return {
      success: false,
      error: 'No authorization token provided'
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