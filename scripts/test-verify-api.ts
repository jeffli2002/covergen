#!/usr/bin/env tsx
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const token = process.argv[2] || '229a26343f9ecfcc95ef3802c5962a24370c6e6e1e4d7db0fb085d090a2b5eb6'

console.log('🧪 Testing Verify Email API')
console.log('=' .repeat(70))
console.log('')
console.log('Token:', token.substring(0, 20) + '...')
console.log('URL:', `http://localhost:3001/api/bestauth/verify-email?token=${token}`)
console.log('')

async function testVerifyAPI() {
  try {
    const response = await fetch(`http://localhost:3001/api/bestauth/verify-email?token=${token}`)
    
    console.log('Response Status:', response.status, response.statusText)
    console.log('')
    
    const data = await response.json()
    console.log('Response Data:')
    console.log(JSON.stringify(data, null, 2))
    console.log('')
    
    if (response.ok) {
      console.log('✅ Verification successful!')
    } else {
      console.log('❌ Verification failed')
      console.log('Error:', data.error || 'Unknown error')
    }
  } catch (error: any) {
    console.error('❌ Request failed:', error.message)
  }
}

testVerifyAPI()

