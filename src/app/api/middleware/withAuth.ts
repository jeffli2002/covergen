import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/bestauth/middleware'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name?: string | null
    avatar_url?: string | null
  } | null
}

/**
 * BestAuth authentication middleware for API routes
 * Validates BestAuth session and adds user to request
 */
export function withAuth(
  handler: (
    request: AuthenticatedRequest,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Get user from BestAuth session
      const user = await getUserFromRequest(request)
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatarUrl
      }
      
      return handler(authenticatedRequest, context)
      
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

/**
 * Extract user from request (for non-middleware use)
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatarUrl
    }
  } catch (error) {
    console.error('getAuthenticatedUser error:', error)
    return null
  }
}