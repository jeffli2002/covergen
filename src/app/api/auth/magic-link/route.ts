// BestAuth Magic Link API Route
import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/bestauth'
import { z } from 'zod'

const magicLinkSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { email } = magicLinkSchema.parse(body)
    
    // Send magic link
    const result = await sendMagicLink(email)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', errors: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}