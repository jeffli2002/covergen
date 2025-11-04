#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

// Force local URL
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001'

import { db } from '../src/lib/bestauth/db-wrapper'
import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'
import crypto from 'crypto'

async function resendVerification() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('❌ Please provide an email address')
    console.log('Usage: npm run resend:verification <email>')
    return
  }

  console.log('📧 Resending Email Verification')
  console.log('=' .repeat(70))
  console.log('')
  console.log(`📍 Using URL: ${process.env.NEXT_PUBLIC_SITE_URL}`)
  console.log('')

  try {
    // Find user
    console.log('📋 Finding user...')
    const user = await db.users.findByEmail(email)
    
    if (!user) {
      console.log('   ❌ User not found')
      return
    }
    
    console.log(`   ✅ User found: ${user.email}`)
    console.log(`   📝 Email verified: ${user.emailVerified ? 'Yes' : 'No'}`)
    console.log('')

    // Generate new token
    console.log('🔑 Generating new token...')
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    console.log(`   ✅ Token: ${token.substring(0, 16)}...`)
    console.log('')

    // Store token
    console.log('💾 Storing token...')
    const stored = await db.verificationTokens.create({
      email: user.email,
      token: token,
      expires_at: expiresAt,
      user_id: user.id
    })

    if (!stored) {
      console.log('   ❌ Failed to store token')
      return
    }
    console.log('   ✅ Token stored')
    console.log('')

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email?token=${token}`
    
    console.log('📧 Sending verification email...')
    console.log(`   📍 URL: ${verificationUrl}`)
    console.log('')

    const { html, text } = getVerificationEmailTemplate({
      email: user.email,
      verificationUrl,
      name: user.name || user.email.split('@')[0]
    })

    const result = await emailService.send({
      to: user.email,
      subject: 'Verify your email - CoverGen Pro',
      html,
      text,
      category: 'verification'
    })

    if (!result.success) {
      console.log(`   ❌ Failed to send: ${result.error}`)
      return
    }

    console.log('   ✅ Email sent successfully!')
    console.log(`   📬 Message ID: ${result.messageId}`)
    console.log('')

    console.log('=' .repeat(70))
    console.log('✅ Verification email sent!')
    console.log('=' .repeat(70))
    console.log('')
    console.log('📬 Check your inbox at:', email)
    console.log('🔗 Or use this link directly:')
    console.log(verificationUrl)
    console.log('')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

resendVerification()

