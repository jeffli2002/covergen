// BestAuth Sign Up API Route
import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/bestauth'
import { setSessionCookie } from '@/lib/bestauth/cookies'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email, password, name } = signUpSchema.parse(body)
    
    // Get session ID from cookie
    let sessionId: string | undefined
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';')
      const sessionCookie = cookies.find(c => c.trim().startsWith('covergen_session_id='))
      if (sessionCookie) {
        sessionId = sessionCookie.split('=')[1]
        console.log('[SignUp API] Found session ID:', sessionId)
      }
    }
    
    // Sign up user with session ID
    const result = await signUp({ email, password, name, sessionId })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
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
    
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}