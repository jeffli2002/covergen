// BestAuth Confirm Password Reset API Route
import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/lib/bestauth'
import { z } from 'zod'

const confirmResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { token, password } = confirmResetSchema.parse(body)
    
    // Reset password
    const result = await resetPassword(token, password)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Password reset confirm error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}