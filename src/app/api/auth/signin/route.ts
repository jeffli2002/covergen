// BestAuth Sign In API Route
import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/bestauth'
import { setSessionCookie } from '@/lib/bestauth/cookies'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password } = signInSchema.parse(body)
    
    // Sign in user
    const result = await signIn({ email, password })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 401 }
      )
    }
    
    // Create response
    const response = NextResponse.json({
      user: result.data!.user,
      session: {
        token: result.data!.accessToken,
        expires_at: result.data!.expiresAt,
      },
      expiresAt: result.data!.expiresAt,
    })
    
    // Set session cookie
    setSessionCookie(response, result.data!.accessToken)
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}