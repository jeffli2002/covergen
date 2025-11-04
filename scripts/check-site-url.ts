#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

console.log('🔍 Checking NEXT_PUBLIC_SITE_URL')
console.log('=' .repeat(60))
console.log('')

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

if (!siteUrl) {
  console.log('❌ NEXT_PUBLIC_SITE_URL is not set')
  console.log('')
  console.log('💡 Add to .env.local:')
  console.log('   NEXT_PUBLIC_SITE_URL=http://localhost:3001')
} else {
  console.log('✅ NEXT_PUBLIC_SITE_URL is set:')
  console.log(`   ${siteUrl}`)
  console.log('')
  
  if (siteUrl.includes('ngrok')) {
    console.log('⚠️  WARNING: Using ngrok URL')
    console.log('   ngrok URLs are temporary and will expire!')
    console.log('')
    console.log('💡 For local development, change to:')
    console.log('   NEXT_PUBLIC_SITE_URL=http://localhost:3001')
    console.log('')
    console.log('💡 For production, use your domain:')
    console.log('   NEXT_PUBLIC_SITE_URL=https://covergen.pro')
  } else if (siteUrl.includes('localhost')) {
    console.log('✅ Using localhost (good for development)')
  } else if (siteUrl.includes('covergen.pro')) {
    console.log('✅ Using production domain')
  } else {
    console.log('⚠️  Unknown URL format')
  }
}

console.log('')
console.log('📧 Email verification links will use:')
console.log(`   ${siteUrl || 'http://localhost:3001'}/auth/verify-email?token=...`)
console.log('')

