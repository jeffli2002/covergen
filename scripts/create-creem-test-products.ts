#!/usr/bin/env tsx
/**
 * Create test products in Creem for development
 * Usage: npm run create:creem-test-products
 */

import { Creem } from 'creem'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function createTestProducts() {
  const CREEM_API_KEY = process.env.CREEM_SECRET_KEY || ''
  const TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  
  if (!CREEM_API_KEY) {
    console.error('❌ CREEM_SECRET_KEY not found in environment variables')
    process.exit(1)
  }

  if (!TEST_MODE) {
    console.error('❌ This script should only be run in test mode (NEXT_PUBLIC_CREEM_TEST_MODE=true)')
    process.exit(1)
  }

  console.log('🧪 Creating Test Products in Creem\n')
  console.log('API Key:', CREEM_API_KEY.substring(0, 20) + '...')
  
  // Initialize Creem client for test mode
  const creem = new Creem({
    serverIdx: 1, // Test mode server
  })

  try {
    // Create Pro product
    console.log('\n📦 Creating Pro product...')
    const proProduct = await creem.createProduct({
      xApiKey: CREEM_API_KEY,
      createProductRequestEntity: {
        name: 'CoverGen Pro (Test)',
        description: 'Pro subscription plan - 120 covers per month',
        price: 900, // $9.00 in cents
        currency: 'USD',
        billingType: 'recurring',
        billingPeriod: 'monthly'
      }
    })
    console.log('✅ Pro product created:', proProduct.id)

    // Create Pro+ product
    console.log('\n📦 Creating Pro+ product...')
    const proPlusProduct = await creem.createProduct({
      xApiKey: CREEM_API_KEY,
      createProductRequestEntity: {
        name: 'CoverGen Pro+ (Test)',
        description: 'Pro+ subscription plan - 300 covers per month with commercial license',
        price: 1900, // $19.00 in cents
        currency: 'USD',
        billingType: 'recurring',
        billingPeriod: 'monthly'
      }
    })
    console.log('✅ Pro+ product created:', proPlusProduct.id)

    console.log('\n🎉 Test products created successfully!')
    console.log('\nNext steps:')
    console.log('1. Go to your Creem dashboard to create pricing for these products')
    console.log('2. Update your .env file with the new product IDs if different')
    console.log('3. Run "npm run test:creem-checkout" to test checkout creation')
    
  } catch (error: any) {
    console.error('\n❌ Error creating products:')
    console.error('Status:', error.response?.status)
    console.error('Message:', error.response?.data || error.message)
    
    if (error.response?.status === 409) {
      console.log('\nℹ️  Products might already exist. Check your Creem dashboard.')
    }
    
    process.exit(1)
  }
}

// Run the script
createTestProducts()