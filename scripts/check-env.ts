#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 Checking Email Environment Variables')
console.log('========================================')
console.log(`📁 Loading from: ${resolve(process.cwd(), '.env.local')}\n`)

const envVars = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY,
  'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
  'EMAIL_SERVER_HOST': process.env.EMAIL_SERVER_HOST,
  'EMAIL_SERVER_PORT': process.env.EMAIL_SERVER_PORT,
  'EMAIL_SERVER_USER': process.env.EMAIL_SERVER_USER,
  'EMAIL_SERVER_PASSWORD': process.env.EMAIL_SERVER_PASSWORD,
  'EMAIL_FROM': process.env.EMAIL_FROM,
  'EMAIL_REPLY_TO': process.env.EMAIL_REPLY_TO,
  'NODE_ENV': process.env.NODE_ENV,
}

console.log('Environment Variables:')
console.log('----------------------')
for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    if (key.includes('KEY') || key.includes('PASSWORD')) {
      console.log(`✅ ${key}: ***${value.slice(-8)}`)
    } else {
      console.log(`✅ ${key}: ${value}`)
    }
  } else {
    console.log(`❌ ${key}: Not set`)
  }
}

console.log('\n📧 Email Provider Detection:')
console.log('----------------------------')
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend API Key found - Will use Resend')
} else if (process.env.SENDGRID_API_KEY) {
  console.log('✅ SendGrid API Key found - Will use SendGrid')
} else if (process.env.EMAIL_SERVER_HOST) {
  console.log('✅ SMTP settings found - Will use SMTP')
} else {
  console.log('❌ No email provider configured - Will use Console mode')
  console.log('\n💡 To fix this, add to .env.local:')
  console.log('   RESEND_API_KEY=re_xxxxxxxxxx')
  console.log('   EMAIL_FROM=noreply@covergen.pro')
  console.log('   EMAIL_REPLY_TO=support@covergen.pro')
}

