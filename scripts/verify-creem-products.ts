#!/usr/bin/env tsx

/**
 * Script to verify if Creem products exist
 */

import { Creem } from 'creem'

// Configuration
const API_KEY = process.env.CREEM_API_KEY || process.env.CREEM_SECRET_KEY || ''
const IS_TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' || API_KEY.startsWith('creem_test_')

// Product IDs to check
const PRODUCT_IDS = {
  pro: process.env.CREEM_PRO_PLAN_ID || 'prod_7HHnnUgLVjiHBQOGQyKPKO',
  pro_plus: process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_5FSXAIuhm6ueniFPAbaOoS'
}

async function verifyProducts() {
  console.log('🔍 Verifying Creem Products')
  console.log('==========================')
  console.log(`Mode: ${IS_TEST_MODE ? 'TEST' : 'PRODUCTION'}`)
  console.log(`API Key: ${API_KEY.substring(0, 20)}...`)
  console.log(`Environment: ${IS_TEST_MODE ? 'https://test.creem.io' : 'https://app.creem.io'}`)
  console.log('')

  if (!API_KEY) {
    console.error('❌ Error: CREEM_API_KEY or CREEM_SECRET_KEY not found')
    process.exit(1)
  }

  // Initialize Creem client
  const creem = new Creem({
    serverIdx: IS_TEST_MODE ? 1 : 0
  })

  console.log('Product IDs to verify:')
  console.log(`  Pro: ${PRODUCT_IDS.pro}`)
  console.log(`  Pro+: ${PRODUCT_IDS.pro_plus}`)
  console.log('')

  let allProductsExist = true

  // Check Pro product
  try {
    console.log(`Checking Pro product (${PRODUCT_IDS.pro})...`)
    const proProduct = await creem.retrieveProduct({
      xApiKey: API_KEY,
      productId: PRODUCT_IDS.pro
    })
    console.log('✅ Pro product found:', proProduct.name)
    console.log(`   Price: $${(proProduct.amount / 100).toFixed(2)} ${proProduct.currency}`)
    console.log(`   Type: ${proProduct.type}`)
  } catch (error: any) {
    console.error('❌ Pro product NOT FOUND')
    console.error(`   Error: ${error.message}`)
    allProductsExist = false
  }

  console.log('')

  // Check Pro+ product
  try {
    console.log(`Checking Pro+ product (${PRODUCT_IDS.pro_plus})...`)
    const proPlusProduct = await creem.retrieveProduct({
      xApiKey: API_KEY,
      productId: PRODUCT_IDS.pro_plus
    })
    console.log('✅ Pro+ product found:', proPlusProduct.name)
    console.log(`   Price: $${(proPlusProduct.amount / 100).toFixed(2)} ${proPlusProduct.currency}`)
    console.log(`   Type: ${proPlusProduct.type}`)
  } catch (error: any) {
    console.error('❌ Pro+ product NOT FOUND')
    console.error(`   Error: ${error.message}`)
    allProductsExist = false
  }

  console.log('')
  console.log('==========================')
  
  if (allProductsExist) {
    console.log('✅ All products verified successfully!')
    console.log('')
    console.log('Your Creem integration should work correctly.')
  } else {
    console.log('❌ Some products are missing!')
    console.log('')
    console.log('To fix this issue:')
    console.log('1. Run: npm run create-creem-products')
    console.log('2. Update your environment variables with the new product IDs')
    console.log('3. Redeploy your application')
    console.log('')
    console.log(`Or manually create products at: ${IS_TEST_MODE ? 'https://test.creem.io' : 'https://app.creem.io'}`)
  }

  process.exit(allProductsExist ? 0 : 1)
}

// Run verification
verifyProducts().catch(console.error)