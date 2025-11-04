import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/bestauth/db-wrapper'
import { emailService } from '@/lib/email/service'
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }
    
    // Find user
    const user = await db.users.findByEmail(email.toLowerCase())
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Store token
    const stored = await db.verificationTokens.create({
      email: user.email,
      token: token,
      expires_at: expiresAt
    })
    if (!stored) {
      return NextResponse.json({ error: 'Failed to store verification token' }, { status: 500 })
    }
    
    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`
    
    // Get email content
    const { html, text } = getVerificationEmailTemplate({
      email: user.email,
      verificationUrl,
      name: user.name
    })
    
    // Send email (will log to console in development)
    const result = await emailService.send({
      to: user.email,
      subject: 'Verify your email - CoverGen Pro',
      html,
      text,
      category: 'verification'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent (check console in dev mode)',
      result,
      verificationUrl,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name
      }
    })
  } catch (error: any) {
    console.error('Debug send verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send verification' },
      { status: 500 }
    )
  }
}
