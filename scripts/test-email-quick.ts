#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Override EMAIL_FROM to use Resend's verified test domain
process.env.EMAIL_FROM = 'onboarding@resend.dev'

import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'

async function testEmail() {
  console.log('🧪 Quick Email Test with Resend Test Domain')
  console.log('=============================================')
  
  const testEmails = [
    '994235892@qq.com',
    'jefflee2002@gmail.com'
  ]
  
  console.log('\n📧 Email Configuration:')
  console.log('- Provider: resend')
  console.log('- From:', process.env.EMAIL_FROM)
  console.log('- Reply-To:', process.env.EMAIL_REPLY_TO)
  console.log('- API Key:', process.env.RESEND_API_KEY ? '***' + process.env.RESEND_API_KEY.slice(-8) : 'Not set')
  
  for (const testEmail of testEmails) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📮 Sending test email to: ${testEmail}`)
    console.log('='.repeat(60))
    
    try {
      // Generate test verification email
      const { html, text } = getVerificationEmailTemplate({
        email: testEmail,
        verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/auth/verify-email?token=test-token-${Date.now()}`,
        name: testEmail.split('@')[0]
      })
      
      // Send email
      const result = await emailService.send({
        to: testEmail,
        subject: 'Test Email - CoverGen Pro Email Configuration',
        html,
        text,
        category: 'verification'
      })
      
      if (result.success) {
        console.log('\n✅ Email sent successfully!')
        console.log('📬 Message ID:', result.messageId)
        console.log('🎉 Please check your inbox and spam folder.')
      } else {
        console.error('\n❌ Failed to send email:', result.error)
      }
    } catch (error: any) {
      console.error('\n❌ Error sending email:', error.message)
    }
    
    // Wait a bit between emails to avoid rate limits
    if (testEmail !== testEmails[testEmails.length - 1]) {
      console.log('\n⏳ Waiting 2 seconds before next email...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('🎯 Test Summary')
  console.log('='.repeat(60))
  console.log('✅ Sent test emails to:')
  testEmails.forEach(email => console.log(`   - ${email}`))
  console.log('\n💡 Next steps:')
  console.log('1. Check your inbox (may take 1-2 minutes)')
  console.log('2. Check spam/junk folder')
  console.log('3. For QQ mail: Check "广告邮件" folder')
  console.log('4. View logs at: https://resend.com/emails')
}

// Run the test
testEmail().catch(console.error)

