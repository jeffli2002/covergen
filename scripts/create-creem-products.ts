#!/usr/bin/env tsx

/**
 * Script to create products in Creem (test or production)
 * 
 * Usage:
 * npm run create-creem-products
 */

import { Creem } from 'creem'

// Configuration
const API_KEY = process.env.CREEM_API_KEY || process.env.CREEM_SECRET_KEY || ''
const IS_TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' || API_KEY.startsWith('creem_test_')

async function createProducts() {
  console.log('🚀 Creating Creem Products')
  console.log('========================')
  console.log(`Mode: ${IS_TEST_MODE ? 'TEST' : 'PRODUCTION'}`)
  console.log(`API Key: ${API_KEY.substring(0, 20)}...`)
  console.log('')

  if (!API_KEY) {
    console.error('❌ Error: CREEM_API_KEY or CREEM_SECRET_KEY not found in environment variables')
    process.exit(1)
  }

  // Initialize Creem client
  const creem = new Creem({
    serverIdx: IS_TEST_MODE ? 1 : 0 // 0: production, 1: test
  })

  try {
    // Create Pro product
    console.log('Creating Pro product...')
    const proProduct = await creem.products.createProduct({
      xApiKey: API_KEY,
      createProductRequestEntity: {
        name: 'CoverGen Pro',
        description: 'Professional plan with 120 covers per month, priority support, and basic tool usage',
        amount: 900, // $9.00 in cents
        currency: 'USD',
        type: 'recurring',
        interval: 'monthly',
        // Add success URL for after payment
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.ai'}/payment/success?plan=pro`,
        // Add other metadata
        metadata: {
          plan: 'pro',
          credits: '120',
          features: 'priority_support,basic_tools'
        }
      }
    })
    console.log('✅ Pro product created:', proProduct.id)

    // Create Pro+ product
    console.log('\nCreating Pro+ product...')
    const proPlusProduct = await creem.products.createProduct({
      xApiKey: API_KEY,
      createProductRequestEntity: {
        name: 'CoverGen Pro+',
        description: 'Premium plan with 300 covers per month, commercial license, all tools, and dedicated support',
        amount: 1900, // $19.00 in cents
        currency: 'USD',
        type: 'recurring',
        interval: 'monthly',
        // Add success URL for after payment
        successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://covergen.ai'}/payment/success?plan=pro_plus`,
        // Add other metadata
        metadata: {
          plan: 'pro_plus',
          credits: '300',
          features: 'commercial_license,all_tools,dedicated_support,cloud_gallery'
        }
      }
    })
    console.log('✅ Pro+ product created:', proPlusProduct.id)

    // Summary
    console.log('\n📋 Summary')
    console.log('==========')
    console.log(`Environment: ${IS_TEST_MODE ? 'TEST' : 'PRODUCTION'}`)
    console.log(`Pro Product ID: ${proProduct.id}`)
    console.log(`Pro+ Product ID: ${proPlusProduct.id}`)
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Add these to your environment variables:')
    console.log(`   CREEM_PRO_PLAN_ID=${proProduct.id}`)
    console.log(`   CREEM_PRO_PLUS_PLAN_ID=${proPlusProduct.id}`)
    console.log('')
    console.log('2. Update your Vercel environment variables')
    console.log('3. Redeploy your application')
    
    if (IS_TEST_MODE) {
      console.log('\n💡 Test Card Numbers:')
      console.log('   Success: 4242 4242 4242 4242')
      console.log('   Decline: 4000 0000 0000 0002')
    }

  } catch (error: any) {
    console.error('\n❌ Error creating products:', error.message)
    
    if (error.response) {
      console.error('Response:', error.response.data)
    }
    
    console.error('\n🔍 Troubleshooting:')
    console.error('1. Verify your API key is correct')
    console.error('2. Check if you have permission to create products')
    console.error(`3. Try logging into ${IS_TEST_MODE ? 'https://test.creem.io' : 'https://app.creem.io'}`)
    console.error('4. Make sure the products don\'t already exist')
    
    process.exit(1)
  }
}

// Run the script
createProducts().catch(console.error)