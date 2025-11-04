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
}

async function productionEmailTest() {
  console.log('📧 Production Email Testing')
  console.log('=' .repeat(70))
  console.log('')

  const testEmails = [
    '994235892@qq.com',
    'jefflee2002@gmail.com'
  ]

  const results: TestResult[] = []

  console.log('📋 Configuration')
  console.log('-'.repeat(70))
  console.log('Provider:', 'Resend')
  console.log('From:', process.env.EMAIL_FROM || 'noreply@covergen.pro')
  console.log('Reply-To:', process.env.EMAIL_REPLY_TO || 'support@covergen.pro')
  console.log('')

  // Test 1: Email Verification (Production style)
  console.log('📋 Sending Email Verifications')
  console.log('-'.repeat(70))
  
  for (const email of testEmails) {
    console.log(`\n📤 Sending to ${email}...`)
    
    try {
      const { html, text } = getVerificationEmailTemplate({
        email,
        verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/auth/verify-email?token=${generateToken()}`,
        name: email.split('@')[0]
      })
      
      const result = await emailService.send({
        to: email,
        subject: 'Verify your email - CoverGen Pro',
        html,
        text,
        category: 'verification'
      })
      
      if (result.success) {
        console.log(`   ✅ Sent successfully`)
        console.log(`   📬 Message ID: ${result.messageId}`)
        results.push({ name: `Email verification to ${email}`, success: true, messageId: result.messageId })
      } else {
        console.log(`   ❌ Failed: ${result.error}`)
        results.push({ name: `Email verification to ${email}`, success: false, error: result.error })
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
      results.push({ name: `Email verification to ${email}`, success: false, error: error.message })
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Test 2: Subscription notification
  console.log('\n\n📋 Sending Subscription Notification')
  console.log('-'.repeat(70))
  console.log(`\n📤 Sending to jefflee2002@gmail.com...`)
  
  try {
    const subscriptionHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to CoverGen Pro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(to right, #3B82F6, #8B5CF6); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">✨ CoverGen Pro</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1F2937; font-size: 20px;">Welcome to Pro!</h2>
              <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                Thank you for upgrading to CoverGen Pro. You now have access to:
              </p>
              <ul style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                <li>800 monthly credits</li>
                <li>Priority generation</li>
                <li>Advanced AI models</li>
                <li>Premium support</li>
              </ul>
              <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                Start creating amazing covers now!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/generate" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #F97316, #EF4444); color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 6px;">
                      Start Creating
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center;">
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                Questions? Contact us at <a href="mailto:support@covergen.pro" style="color: #3B82F6;">support@covergen.pro</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    
    const subscriptionText = `
Welcome to CoverGen Pro!

Thank you for upgrading to Pro. You now have access to:

• 800 monthly credits
• Priority generation
• Advanced AI models
• Premium support

Start creating amazing covers now at ${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/generate

Questions? Contact us at support@covergen.pro
`
    
    const result = await emailService.send({
      to: 'jefflee2002@gmail.com',
      subject: 'Welcome to CoverGen Pro! 🎉',
      html: subscriptionHtml,
      text: subscriptionText,
      category: 'subscription'
    })
    
    if (result.success) {
      console.log(`   ✅ Sent successfully`)
      console.log(`   📬 Message ID: ${result.messageId}`)
      results.push({ name: 'Subscription notification', success: true, messageId: result.messageId })
    } else {
      console.log(`   ❌ Failed: ${result.error}`)
      results.push({ name: 'Subscription notification', success: false, error: result.error })
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`)
    results.push({ name: 'Subscription notification', success: false, error: error.message })
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Test 3: Credits low warning
  console.log('\n\n📋 Sending Credits Low Warning')
  console.log('-'.repeat(70))
  console.log(`\n📤 Sending to 994235892@qq.com...`)
  
  try {
    const creditsHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your credits are running low</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
          <tr>
            <td style="background: linear-gradient(to right, #F59E0B, #EF4444); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">⚠️ Credits Running Low</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1F2937; font-size: 20px;">You have 15 credits remaining</h2>
              <p style="margin: 0 0 20px 0; color: #4B5563; font-size: 16px; line-height: 24px;">
                Your CoverGen Pro credits are running low. To continue creating amazing covers, consider upgrading your plan or purchasing additional credits.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/pricing" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(to right, #F97316, #EF4444); color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 6px;">
                      View Plans
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center;">
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                Questions? Contact us at <a href="mailto:support@covergen.pro" style="color: #3B82F6;">support@covergen.pro</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
    
    const creditsText = `
Your credits are running low

You have 15 credits remaining.

Your CoverGen Pro credits are running low. To continue creating amazing covers, consider upgrading your plan or purchasing additional credits.

View Plans: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/pricing

Questions? Contact us at support@covergen.pro
`
    
    const result = await emailService.send({
      to: '994235892@qq.com',
      subject: 'Your CoverGen credits are running low',
      html: creditsHtml,
      text: creditsText,
      category: 'credits_exhausted'
    })
    
    if (result.success) {
      console.log(`   ✅ Sent successfully`)
      console.log(`   📬 Message ID: ${result.messageId}`)
      results.push({ name: 'Credits low warning', success: true, messageId: result.messageId })
    } else {
      console.log(`   ❌ Failed: ${result.error}`)
      results.push({ name: 'Credits low warning', success: false, error: result.error })
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`)
    results.push({ name: 'Credits low warning', success: false, error: error.message })
  }

  // Summary
  console.log('\n\n' + '='.repeat(70))
  console.log('📊 Summary')
  console.log('='.repeat(70))
  console.log('')
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => r.success === false).length
  
  console.log(`Total: ${results.length}`)
  console.log(`✅ Sent: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log('')
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${status} ${result.name}`)
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
  console.log('These are production-style emails without any test indicators.')
  console.log('Please check your email inboxes to verify delivery.')
  console.log('')
  console.log('📊 View logs at: https://resend.com/emails')
  console.log('='.repeat(70))
  
  return passed === results.length
}

function generateToken(): string {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

// Run production test
productionEmailTest().then(success => {
  process.exit(success ? 0 : 1)
})

