#!/usr/bin/env tsx
/**
 * Test script to verify Creem SDK checkout creation
 * Usage: npm run test:creem-checkout
 */

import { Creem } from 'creem'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function testCreemCheckout() {
  const CREEM_API_KEY = process.env.CREEM_SECRET_KEY || ''
  const TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  
  if (!CREEM_API_KEY) {
    console.error('❌ CREEM_SECRET_KEY not found in environment variables')
    process.exit(1)
  }

  console.log('🧪 Testing Creem SDK Checkout Creation\n')
  console.log('Mode:', TEST_MODE ? 'TEST' : 'PRODUCTION')
  
  // Initialize Creem client
  const creem = new Creem({
    serverIdx: TEST_MODE ? 1 : 0, // 0: production, 1: test-mode
  })

  try {
    // Test checkout creation
    const checkoutResult = await creem.createCheckout({
      xApiKey: CREEM_API_KEY,
      createCheckoutRequest: {
        productId: TEST_MODE ? 'prod_test_pro' : 'prod_pro',
        requestId: `test_checkout_${Date.now()}`,
        successUrl: 'https://localhost:3000/payment/success',
        metadata: {
          userId: 'test_user_123',
          userEmail: 'test@example.com',
          planId: 'pro',
          test: true,
        },
        customer: {
          email: 'test@example.com',
        },
      }
    })

    // TODO: Fix checkout result type checking
    // if (!checkoutResult.ok) {
    //   console.error('❌ Failed to create checkout:', checkoutResult.error)
    //   process.exit(1)
    // }

    const checkout = checkoutResult
    console.log('✅ Checkout created successfully!')
    console.log('\nCheckout Details:')
    console.log('- ID:', checkout.id)
    console.log('- Status:', checkout.status)
    console.log('- Checkout URL:', checkout.checkoutUrl)
    console.log('- Request ID:', checkout.requestId)
    console.log('- Product:', typeof checkout.product === 'string' ? checkout.product : checkout.product.id)
    
    console.log('\n📝 Full response:', JSON.stringify(checkout, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the test
testCreemCheckout()