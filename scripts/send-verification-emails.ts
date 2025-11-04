#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

import { emailService } from '../src/lib/email/service'
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification'

async function sendVerificationEmails() {
  console.log('📧 Sending Email Verifications (Production)')
  console.log('=' .repeat(60))
  console.log('')

  const emails = ['994235892@qq.com', 'jefflee2002@gmail.com']
  
  for (const email of emails) {
    console.log(`📤 Sending to ${email}...`)
    
    try {
      const token = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      const { html, text } = getVerificationEmailTemplate({
        email,
        verificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.pro'}/auth/verify-email?token=${token}`,
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
      } else {
        console.log(`   ❌ Failed: ${result.error}`)
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('')
    await new Promise(resolve => setTimeout(resolve, 1500))
  }
}

sendVerificationEmails()

