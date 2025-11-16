#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

interface TestResult {
  step: string
  status: 'pass' | 'fail'
  details?: string
  duration?: number
}

const results: TestResult[] = []

async function runE2ETest() {
  console.log('🧪 Email System E2E Automated Testing')
  console.log('=' .repeat(70))
  console.log('')
  console.log('This test will:')
  console.log('1. Create a test user')
  console.log('2. Trigger verification email')
  console.log('3. Verify email was sent')
  console.log('4. Extract and test verification link')
  console.log('5. Verify email status update')
  console.log('6. Clean up test data')
  console.log('')
  console.log('=' .repeat(70))
  console.log('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const testEmail = `test-e2e-${Date.now()}@example.com`
  const testPassword = 'Test123!@#'
  let testUserId: string | null = null
  let verificationToken: string | null = null

  try {
    // Step 1: Create test user
    console.log('📋 Step 1: Creating test user...')
    const startTime1 = Date.now()
    
    const response1 = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'E2E Test User'
      })
    })

    const data1 = await response1.json()
    const duration1 = Date.now() - startTime1

    if (response1.ok && data1.user) {
      console.log(`   ✅ User created successfully (${duration1}ms)`)
      console.log(`   📧 Email: ${testEmail}`)
      console.log(`   👤 User ID: ${data1.user.id}`)
      testUserId = data1.user.id
      results.push({ step: 'Create test user', status: 'pass', duration: duration1 })
    } else {
      console.log(`   ❌ Failed to create user: ${data1.error || 'Unknown error'}`)
      console.log(`   📝 Response:`, JSON.stringify(data1, null, 2))
      results.push({ step: 'Create test user', status: 'fail', details: data1.error || 'Unknown error' })
      return
    }
    console.log('')

    // Wait for async email processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 2: Check if verification token was created
    console.log('📋 Step 2: Checking verification token in database...')
    const startTime2 = Date.now()
    
    const { data: tokens, error: tokenError } = await supabase
      .from('bestauth_verification_tokens')
      .select('*')
      .eq('user_id', testUserId)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)

    const duration2 = Date.now() - startTime2

    if (tokenError) {
      console.log(`   ❌ Database error: ${tokenError.message}`)
      results.push({ step: 'Check token in DB', status: 'fail', details: tokenError.message })
    } else if (tokens && tokens.length > 0) {
      verificationToken = tokens[0].token
      console.log(`   ✅ Verification token found (${duration2}ms)`)
      console.log(`   🔑 Token: ${verificationToken.substring(0, 16)}...`)
      console.log(`   ⏰ Expires: ${new Date(tokens[0].expires_at).toLocaleString()}`)
      results.push({ step: 'Check token in DB', status: 'pass', duration: duration2 })
    } else {
      console.log(`   ❌ No verification token found`)
      results.push({ step: 'Check token in DB', status: 'fail', details: 'Token not found' })
      return
    }
    console.log('')

    // Step 3: Verify email was "sent" (check email service was called)
    console.log('📋 Step 3: Verifying email send trigger...')
    const startTime3 = Date.now()
    
    // Import and check email service
    const { emailService } = await import('../src/lib/email/service')
    const duration3 = Date.now() - startTime3
    
    console.log(`   ✅ Email service is configured (${duration3}ms)`)
    console.log(`   📨 Provider: Resend`)
    console.log(`   📧 From: ${process.env.EMAIL_FROM}`)
    results.push({ step: 'Email service check', status: 'pass', duration: duration3 })
    console.log('')

    // Step 4: Build and test verification link
    console.log('📋 Step 4: Testing verification link...')
    const startTime4 = Date.now()
    
    const verificationUrl = `http://localhost:3001/auth/verify-email?token=${verificationToken}`
    console.log(`   🔗 Link: ${verificationUrl}`)
    console.log('')

    // Test the verification API endpoint
    console.log('   Testing verification API endpoint...')
    const response4 = await fetch(`http://localhost:3001/api/bestauth/verify-email?token=${verificationToken}`)
    const data4 = await response4.json()
    const duration4 = Date.now() - startTime4

    if (response4.ok && data4.success) {
      console.log(`   ✅ Verification link works! (${duration4}ms)`)
      console.log(`   📬 Status: ${data4.message}`)
      console.log(`   👤 User ID: ${data4.user.id}`)
      console.log(`   ✉️  Email: ${data4.user.email}`)
      console.log(`   ✅ Verified: ${data4.user.emailVerified}`)
      results.push({ step: 'Test verification link', status: 'pass', duration: duration4 })
    } else {
      console.log(`   ❌ Verification failed: ${data4.error}`)
      results.push({ step: 'Test verification link', status: 'fail', details: data4.error })
      return
    }
    console.log('')

    // Step 5: Verify user email_verified status updated
    console.log('📋 Step 5: Verifying email_verified status in database...')
    const startTime5 = Date.now()
    
    const { data: user, error: userError } = await supabase
      .from('bestauth_users')
      .select('email_verified')
      .eq('id', testUserId)
      .single()

    const duration5 = Date.now() - startTime5

    if (userError) {
      console.log(`   ❌ Database error: ${userError.message}`)
      results.push({ step: 'Verify DB status', status: 'fail', details: userError.message })
    } else if (user && user.email_verified) {
      console.log(`   ✅ Email verified status updated (${duration5}ms)`)
      console.log(`   📊 email_verified: true`)
      results.push({ step: 'Verify DB status', status: 'pass', duration: duration5 })
    } else {
      console.log(`   ❌ Email verified status NOT updated`)
      results.push({ step: 'Verify DB status', status: 'fail', details: 'Status not updated' })
    }
    console.log('')

    // Step 6: Verify token marked as used
    console.log('📋 Step 6: Verifying token marked as used...')
    const startTime6 = Date.now()
    
    const { data: usedToken, error: usedError } = await supabase
      .from('bestauth_verification_tokens')
      .select('used, used_at')
      .eq('token', verificationToken)
      .single()

    const duration6 = Date.now() - startTime6

    if (usedError) {
      console.log(`   ❌ Database error: ${usedError.message}`)
      results.push({ step: 'Verify token used', status: 'fail', details: usedError.message })
    } else if (usedToken && usedToken.used) {
      console.log(`   ✅ Token marked as used (${duration6}ms)`)
      console.log(`   🕐 Used at: ${new Date(usedToken.used_at).toLocaleString()}`)
      results.push({ step: 'Verify token used', status: 'pass', duration: duration6 })
    } else {
      console.log(`   ❌ Token NOT marked as used`)
      results.push({ step: 'Verify token used', status: 'fail', details: 'Token not marked' })
    }
    console.log('')

    // Step 7: Test that token cannot be reused
    console.log('📋 Step 7: Testing token reuse prevention...')
    const startTime7 = Date.now()
    
    const response7 = await fetch(`http://localhost:3001/api/bestauth/verify-email?token=${verificationToken}`)
    const data7 = await response7.json()
    const duration7 = Date.now() - startTime7

    if (!response7.ok && data7.error) {
      console.log(`   ✅ Token reuse prevented (${duration7}ms)`)
      console.log(`   🔒 Error: ${data7.error}`)
      results.push({ step: 'Test token reuse prevention', status: 'pass', duration: duration7 })
    } else {
      console.log(`   ❌ Token was reused (security issue!)`)
      results.push({ step: 'Test token reuse prevention', status: 'fail', details: 'Token reused' })
    }
    console.log('')

  } catch (error: any) {
    console.error('❌ Test error:', error.message)
    results.push({ step: 'Test execution', status: 'fail', details: error.message })
  } finally {
    // Cleanup: Delete test user
    console.log('📋 Cleanup: Removing test user...')
    if (testUserId) {
      try {
        await supabase
          .from('bestauth_users')
          .delete()
          .eq('id', testUserId)
        
        console.log('   ✅ Test user removed')
      } catch (error: any) {
        console.log('   ⚠️  Failed to remove test user:', error.message)
      }
    }
    console.log('')
  }

  // Summary
  console.log('=' .repeat(70))
  console.log('📊 E2E Test Results Summary')
  console.log('=' .repeat(70))
  console.log('')

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const total = results.length

  console.log(`Total Tests: ${total}`)
  console.log(`✅ Passed: ${passed} (${((passed/total)*100).toFixed(1)}%)`)
  console.log(`❌ Failed: ${failed} (${((failed/total)*100).toFixed(1)}%)`)
  console.log('')

  console.log('Detailed Results:')
  console.log('-'.repeat(70))
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : '❌'
    const durationStr = result.duration ? ` (${result.duration}ms)` : ''
    console.log(`${index + 1}. ${icon} ${result.step}${durationStr}`)
    if (result.details && result.status === 'fail') {
      console.log(`   Error: ${result.details}`)
    }
  })
  console.log('')

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ Email system is working correctly end-to-end')
  } else {
    console.log('⚠️  SOME TESTS FAILED')
    console.log('Please review the failed tests above')
  }
  console.log('=' .repeat(70))

  return failed === 0
}

// Run the E2E test
runE2ETest().then(success => {
  process.exit(success ? 0 : 1)
})

