import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    // Get test email from request
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email address is required' 
      }, { status: 400 })
    }

    console.log('[Test Email] Starting email test to:', email)
    
    // Check environment variables
    const envCheck = {
      EMAIL_SERVER_HOST: !!process.env.EMAIL_SERVER_HOST,
      EMAIL_SERVER_PORT: !!process.env.EMAIL_SERVER_PORT,
      EMAIL_SERVER_USER: !!process.env.EMAIL_SERVER_USER,
      EMAIL_SERVER_PASSWORD: !!process.env.EMAIL_SERVER_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    }
    
    console.log('[Test Email] Environment check:', envCheck)
    
    // Check if all required env vars are present
    const missingVars = Object.entries(envCheck)
      .filter(([_, value]) => !value)
      .map(([key]) => key)
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: missingVars,
        envCheck
      }, { status: 500 })
    }

    // Get email service configuration
    const config = emailService.getConfig()
    
    console.log('[Test Email] Email config:', {
      host: config.server?.host,
      port: config.server?.port,
      secure: config.server?.secure,
      user: config.server?.auth?.user,
      from: config.from,
      hasPassword: !!config.server?.auth?.pass
    })

    // Send test email
    const testToken = 'test-token-' + Date.now()
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${testToken}`
    
    console.log('[Test Email] Sending test email with URL:', verificationUrl)
    
    const result = await emailService.sendVerificationEmail(email, verificationUrl)
    
    if (result.success) {
      console.log('[Test Email] Email sent successfully:', result)
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        config: {
          host: config.server?.host,
          port: config.server?.port,
          from: config.from,
          to: email
        }
      })
    } else {
      console.error('[Test Email] Failed to send email:', result.error)
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
        details: result.error,
        config: {
          host: config.server?.host,
          port: config.server?.port,
          from: config.from,
          to: email
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}