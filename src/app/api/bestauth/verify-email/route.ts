import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/bestauth/db-wrapper'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 })
    }
    
    // Find the token
    const verificationToken = await db.verificationTokens.findByToken(token)
    
    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }
    
    // Update user's email verification status
    const user = await db.users.update(verificationToken.user_id, {
      emailVerified: true
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Mark token as used
    await db.verificationTokens.markAsUsed(token)
    
    // Log the verification
    await db.activityLogs.create({
      userId: user.id,
      action: 'email_verified',
      metadata: { email: user.email }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified
      }
    })
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Resend verification email
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    // Find user
    const user = await db.users.findByEmail(email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
    }
    
    // Generate new token
    const crypto = await import('crypto')
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Store token
    const stored = await db.verificationTokens.create({
      email: user.email,
      token: token,
      expires_at: expiresAt
    })
    if (!stored) {
      throw new Error('Failed to store verification token')
    }
    
    // Send email
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`
    
    const { emailService } = await import('@/lib/email/service')
    const { getVerificationEmailTemplate } = await import('@/lib/email/templates/verification')
    
    const { html, text } = getVerificationEmailTemplate({
      email: user.email,
      verificationUrl,
      name: user.name
    })
    
    const result = await emailService.send({
      to: user.email,
      subject: 'Verify your email - CoverGen Pro',
      html,
      text,
      category: 'verification'
    })
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent'
    })
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
