// BestAuth Request Password Reset API Route
import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/lib/bestauth'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email } = resetPasswordSchema.parse(body)
    
    // Request password reset
    const result = await requestPasswordReset(email)
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}