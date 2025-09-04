#!/usr/bin/env tsx
/**
 * Script to set up Creem products and prices for CoverGen Pro subscriptions
 * Run this once to create products in your Creem account
 * 
 * Usage: npm run setup:creem-products
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { creemService } from '../src/services/payment/creem'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function setupCreemProducts() {
  console.log('🚀 Setting up Creem products...')
  
  // Check if API key is configured
  if (!process.env.CREEM_SECRET_KEY) {
    console.error('❌ CREEM_SECRET_KEY not found in environment variables')
    console.error('Please add it to your .env.local file')
    process.exit(1)
  }

  const testMode = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  console.log(`📝 Running in ${testMode ? 'TEST' : 'PRODUCTION'} mode`)
  
  try {
    // Create products
    console.log('\n📦 Creating products...')
    const results = await creemService.createProducts()
    
    results.forEach((result, index) => {
      if (result.success && 'product' in result) {
        console.log(`✅ Product ${index + 1} created:`)
        console.log(`   ID: ${result.product.id}`)
        console.log(`   Name: ${result.product.name}`)
      } else if ('error' in result) {
        console.error(`❌ Product ${index + 1} failed: ${result.error}`)
      }
    })
    
    console.log('\n🎉 Creem products setup complete!')
    console.log('\nNext steps:')
    console.log('1. Go to your Creem dashboard to verify the products')
    console.log('2. Update the product and price IDs in src/services/payment/creem.ts if needed')
    console.log('3. Set up webhook endpoints in Creem dashboard pointing to /api/webhooks/creem')
    console.log('4. Copy the webhook signing secret to CREEM_WEBHOOK_SECRET in .env.local')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupCreemProducts()