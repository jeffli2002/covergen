#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

async function quickCheck() {
  const response = await fetch('http://localhost:3001/api/bestauth/verify-email?token=229a26343f9ecfcc95ef3802c5962a24370c6e6e1e4d7db0fb085d090a2b5eb6')
  const data = await response.json()
  
  console.log('📊 Verification Status for 994235892@qq.com:')
  console.log('')
  console.log('Status:', data.success ? '✅ VERIFIED' : '❌ NOT VERIFIED')
  console.log('Email:', data.user?.email)
  console.log('Verified:', data.user?.emailVerified ? '✅ YES' : '❌ NO')
  console.log('')
  
  if (data.user?.emailVerified) {
    console.log('🎉 Email verification is ACTIVE!')
    console.log('   User can log in and use all features.')
  }
}

quickCheck().catch(console.error)

