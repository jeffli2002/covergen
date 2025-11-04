#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { db } from '../src/lib/bestauth/db-wrapper'
import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'
import crypto from 'crypto'

async function testEmailVerification() {
  console.log('🧪 Email Verification System Test')
  console.log('=' .repeat(70))
  console.log('')

  const testEmail = process.argv[2] || 'jefflee2002@gmail.com'

  // Step 1: Find user
  console.log('📋 Step 1: Finding user...')
  const user = await db.users.findByEmail(testEmail)
  
  if (!user) {
    console.log('   ❌ User not found:', testEmail)
    console.log('   💡 Please sign up first at http://localhost:3001/auth/signup')
    return
  }
  
  console.log(`   ✅ User found: ${user.email}`)
  console.log(`   📝 User ID: ${user.id}`)
  console.log(`   📧 Email verified: ${user.emailVerified ? 'Yes' : 'No'}`)
  console.log('')

  // Step 2: Generate token
  console.log('📋 Step 2: Generating verification token...')
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  console.log(`   ✅ Token generated: ${token.substring(0, 16)}...`)
  console.log(`   ⏰ Expires at: ${expiresAt.toLocaleString()}`)
  console.log('')

  // Step 3: Store token in database
  console.log('📋 Step 3: Storing token in database...')
  const stored = await db.verificationTokens.create({
    email: user.email,
    token: token,
    expires_at: expiresAt,
    user_id: user.id
  })

  if (!stored) {
    console.log('   ❌ Failed to store token in database')
    console.log('   💡 Check database connection and table structure')
    return
  }

  console.log('   ✅ Token stored successfully')
  console.log('')

  // Step 4: Verify token can be found
  console.log('📋 Step 4: Verifying token can be retrieved...')
  const foundToken = await db.verificationTokens.findByToken(token)
  
  if (!foundToken) {
    console.log('   ❌ Token not found in database')
    return
  }

  console.log('   ✅ Token found in database')
  console.log(`   📝 Token ID: ${foundToken.id}`)
  console.log(`   👤 User ID: ${foundToken.user_id}`)
  console.log('')

  // Step 5: Generate verification URL
  console.log('📋 Step 5: Generating verification URL...')
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/verify-email?token=${token}`
  console.log(`   ✅ URL: ${verificationUrl}`)
  console.log('')

  // Step 6: Send verification email
  console.log('📋 Step 6: Sending verification email...')
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
    console.log(`   ❌ Failed to send email: ${result.error}`)
    return
  }

  console.log('   ✅ Email sent successfully!')
  console.log(`   📬 Message ID: ${result.messageId}`)
  console.log('')

  // Summary
  console.log('=' .repeat(70))
  console.log('✅ Email Verification System Working!')
  console.log('=' .repeat(70))
  console.log('')
  console.log('📬 Next steps:')
  console.log(`1. Check ${testEmail} inbox (and spam folder)`)
  console.log('2. Click the verification link in the email')
  console.log('3. You should see a success message')
  console.log('4. Your email will be marked as verified')
  console.log('')
  console.log('🔗 Manual verification URL (for testing):')
  console.log(verificationUrl)
  console.log('')
  console.log('🧪 Test verification API endpoint:')
  console.log(`curl "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/bestauth/verify-email?token=${token}"`)
  console.log('')
}

testEmailVerification().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

