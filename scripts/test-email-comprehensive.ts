#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'

interface TestResult {
  name: string
  success: boolean
  messageId?: string
  error?: string
  duration: number
}

async function comprehensiveEmailTest() {
  console.log('🧪 COMPREHENSIVE EMAIL TEST')
  console.log('=' .repeat(70))
  console.log('')

  // Test configuration
  const testEmails = [
    '994235892@qq.com',
    'jefflee2002@gmail.com'
  ]

  const testCategories = [
    'verification',
    'subscription',
    'payment_failure',
    'credits_exhausted',
    'general'
  ]

  const results: TestResult[] = []
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  // Display configuration
  console.log('📧 Email Configuration')
  console.log('-'.repeat(70))
  console.log('Provider:', process.env.RESEND_API_KEY ? 'Resend' : process.env.SENDGRID_API_KEY ? 'SendGrid' : process.env.EMAIL_SERVER_HOST ? 'SMTP' : 'Console')
  console.log('From:', process.env.EMAIL_FROM || 'noreply@covergen.pro')
  console.log('Reply-To:', process.env.EMAIL_REPLY_TO || 'support@covergen.pro')
  console.log('API Key:', process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-8) : 'Not set')
  console.log('BCC Monitoring:')
  console.log('  - Subscription:', process.env.EMAIL_BCC_SUBSCRIPTION || 'Not set')
  console.log('  - Payment Failure:', process.env.EMAIL_BCC_PAYMENT_FAILURE || 'Not set')
  console.log('  - Credits Exhausted:', process.env.EMAIL_BCC_CREDITS_EXHAUSTED || 'Not set')
  console.log('  - Bugs:', process.env.EMAIL_BCC_BUGS || 'Not set')
  console.log('')

  // Test 1: Basic email to both recipients
  console.log('📋 Test Suite 1: Basic Email Delivery')
  console.log('-'.repeat(70))
  
  for (const email of testEmails) {
    const testName = `Basic email to ${email}`
    totalTests++
    
    console.log(`\n🔸 ${testName}`)
    const startTime = Date.now()
    
    try {
      const { html, text } = getVerificationEmailTemplate({
        email,
        verificationUrl: `http://localhost:3001/auth/verify-email?token=test-${Date.now()}`,
        name: email.split('@')[0]
      })
      
      const result = await emailService.send({
        to: email,
        subject: '✅ Comprehensive Test - Basic Email',
        html,
        text,
        category: 'verification'
      })
      
      const duration = Date.now() - startTime
      
      if (result.success) {
        console.log(`   ✅ Success! (${duration}ms)`)
        console.log(`   📬 Message ID: ${result.messageId}`)
        passedTests++
        results.push({ name: testName, success: true, messageId: result.messageId, duration })
      } else {
        console.log(`   ❌ Failed: ${result.error}`)
        failedTests++
        results.push({ name: testName, success: false, error: result.error, duration })
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.log(`   ❌ Error: ${error.message}`)
      failedTests++
      results.push({ name: testName, success: false, error: error.message, duration })
    }
    
    // Wait between emails
    if (email !== testEmails[testEmails.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Test 2: Different email categories
  console.log('\n\n📋 Test Suite 2: Email Categories (with BCC)')
  console.log('-'.repeat(70))
  
  for (const category of testCategories) {
    const testName = `Category: ${category}`
    totalTests++
    
    console.log(`\n🔸 ${testName}`)
    const startTime = Date.now()
    
    try {
      const result = await emailService.send({
        to: 'jefflee2002@gmail.com',
        subject: `✅ Test - ${category.replace('_', ' ').toUpperCase()}`,
        html: `<h1>Test Email - ${category}</h1><p>This is a test email for category: ${category}</p>`,
        text: `Test Email - ${category}\n\nThis is a test email for category: ${category}`,
        category: category as any
      })
      
      const duration = Date.now() - startTime
      
      if (result.success) {
        console.log(`   ✅ Success! (${duration}ms)`)
        console.log(`   📬 Message ID: ${result.messageId}`)
        passedTests++
        results.push({ name: testName, success: true, messageId: result.messageId, duration })
      } else {
        console.log(`   ❌ Failed: ${result.error}`)
        failedTests++
        results.push({ name: testName, success: false, error: result.error, duration })
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      console.log(`   ❌ Error: ${error.message}`)
      failedTests++
      results.push({ name: testName, success: false, error: error.message, duration })
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Test 3: Plain text email
  console.log('\n\n📋 Test Suite 3: Plain Text Email')
  console.log('-'.repeat(70))
  
  const plainTextTest = 'Plain text email'
  totalTests++
  console.log(`\n🔸 ${plainTextTest}`)
  const startTime3 = Date.now()
  
  try {
    const result = await emailService.send({
      to: 'jefflee2002@gmail.com',
      subject: '✅ Test - Plain Text Email',
      text: 'This is a plain text email without HTML formatting.\n\nIt should be delivered successfully.',
      category: 'general'
    })
    
    const duration = Date.now() - startTime3
    
    if (result.success) {
      console.log(`   ✅ Success! (${duration}ms)`)
      console.log(`   📬 Message ID: ${result.messageId}`)
      passedTests++
      results.push({ name: plainTextTest, success: true, messageId: result.messageId, duration })
    } else {
      console.log(`   ❌ Failed: ${result.error}`)
      failedTests++
      results.push({ name: plainTextTest, success: false, error: result.error, duration })
    }
  } catch (error: any) {
    const duration = Date.now() - startTime3
    console.log(`   ❌ Error: ${error.message}`)
    failedTests++
    results.push({ name: plainTextTest, success: false, error: error.message, duration })
  }

  // Test 4: Email with custom BCC
  console.log('\n\n📋 Test Suite 4: Custom BCC Recipients')
  console.log('-'.repeat(70))
  
  const bccTest = 'Email with custom BCC'
  totalTests++
  console.log(`\n🔸 ${bccTest}`)
  const startTime4 = Date.now()
  
  try {
    const result = await emailService.send({
      to: '994235892@qq.com',
      subject: '✅ Test - Email with BCC',
      html: '<h1>Test Email with BCC</h1><p>This email should be sent with BCC to monitoring address.</p>',
      text: 'Test Email with BCC\n\nThis email should be sent with BCC to monitoring address.',
      bcc: 'jefflee2002@gmail.com',
      category: 'general'
    })
    
    const duration = Date.now() - startTime4
    
    if (result.success) {
      console.log(`   ✅ Success! (${duration}ms)`)
      console.log(`   📬 Message ID: ${result.messageId}`)
      console.log(`   📤 BCC sent to: jefflee2002@gmail.com`)
      passedTests++
      results.push({ name: bccTest, success: true, messageId: result.messageId, duration })
    } else {
      console.log(`   ❌ Failed: ${result.error}`)
      failedTests++
      results.push({ name: bccTest, success: false, error: result.error, duration })
    }
  } catch (error: any) {
    const duration = Date.now() - startTime4
    console.log(`   ❌ Error: ${error.message}`)
    failedTests++
    results.push({ name: bccTest, success: false, error: error.message, duration })
  }

  // Summary
  console.log('\n\n' + '='.repeat(70))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(70))
  console.log('')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`)
  console.log(`❌ Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`)
  console.log('')

  // Detailed results
  console.log('📋 Detailed Results:')
  console.log('-'.repeat(70))
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${status} ${result.name} (${result.duration}ms)`)
    if (result.messageId) {
      console.log(`   Message ID: ${result.messageId}`)
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })

  console.log('')
  console.log('='.repeat(70))
  console.log('📬 Check Your Inboxes')
  console.log('='.repeat(70))
  console.log('')
  console.log('QQ Mail (994235892@qq.com):')
  console.log('  • 收件箱')
  console.log('  • 垃圾邮件')
  console.log('  • 广告邮件')
  console.log('')
  console.log('Gmail (jefflee2002@gmail.com):')
  console.log('  • Primary Inbox')
  console.log('  • Spam')
  console.log('  • Promotions')
  console.log('')
  console.log('📊 View logs at: https://resend.com/emails')
  console.log('')
  console.log('⏰ Emails usually arrive within 1-2 minutes')
  console.log('='.repeat(70))
  
  return passedTests === totalTests
}

// Run comprehensive test
comprehensiveEmailTest().then(success => {
  process.exit(success ? 0 : 1)
})

