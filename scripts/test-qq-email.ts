#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local and override EMAIL_FROM
config({ path: resolve(process.cwd(), '.env.local') })
process.env.EMAIL_FROM = 'onboarding@resend.dev'

import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'

async function testQQEmail() {
  console.log('📮 Testing email to 994235892@qq.com')
  console.log('=====================================\n')
  
  const testEmail = '994235892@qq.com'
  
  try {
    const { html, text } = getVerificationEmailTemplate({
      email: testEmail,
      verificationUrl: `http://localhost:3001/auth/verify-email?token=test-${Date.now()}`,
      name: '994235892'
    })
    
    const result = await emailService.send({
      to: testEmail,
      subject: 'Test Email - CoverGen Pro Email Configuration',
      html,
      text,
      category: 'verification'
    })
    
    if (result.success) {
      console.log('✅ Email sent successfully!')
      console.log('📬 Message ID:', result.messageId)
      console.log('\n💡 Please check:')
      console.log('   1. QQ邮箱收件箱')
      console.log('   2. 垃圾邮件文件夹')
      console.log('   3. 广告邮件文件夹')
    } else {
      console.error('❌ Failed to send email:', result.error)
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

testQQEmail()

