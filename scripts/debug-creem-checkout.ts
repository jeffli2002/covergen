import { Creem } from 'creem'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function debugCreemCheckout() {
  const apiKey = process.env.CREEM_SECRET_KEY || ''
  const productId = process.env.CREEM_PRO_PLAN_ID || 'prod_7aQWgvmz1JHGafTEGZtz9g'
  const isTestMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  
  console.log('🔍 Debugging Creem Checkout Issue\n')
  console.log('Configuration:')
  console.log('- Mode:', isTestMode ? 'TEST' : 'PRODUCTION')
  console.log('- API Key:', apiKey.substring(0, 15) + '...')
  console.log('- Product ID:', productId)
  
  const creem = new Creem({
    serverIdx: isTestMode ? 1 : 0
  })
  
  try {
    // Step 1: Verify product exists
    console.log('\n1️⃣ Verifying product exists...')
    const product = await creem.retrieveProduct({
      productId: productId,
      xApiKey: apiKey
    })
    console.log('✅ Product found:', product.name)
    console.log('   Status:', product.status)
    console.log('   Mode:', product.mode)
    
    // Step 2: Create checkout
    console.log('\n2️⃣ Creating checkout session...')
    const checkout = await creem.createCheckout({
      xApiKey: apiKey,
      createCheckoutRequest: {
        productId: productId,
        requestId: `debug_${Date.now()}`,
        successUrl: 'http://localhost:3001/en/payment/success?session_id={CHECKOUT_SESSION_ID}',
        metadata: {
          userId: 'debug_user',
          userEmail: 'debug@example.com',
          planId: 'pro',
        },
        customer: {
          email: 'debug@example.com',
        },
      }
    })
    
    console.log('✅ Checkout created:')
    console.log('   ID:', checkout.id)
    console.log('   Status:', checkout.status)
    console.log('   URL:', checkout.checkoutUrl)
    
    // Step 3: Try to retrieve the checkout
    console.log('\n3️⃣ Retrieving checkout to verify it exists...')
    try {
      const retrievedCheckout = await creem.retrieveCheckout({
        checkoutId: checkout.id,
        xApiKey: apiKey
      })
      console.log('✅ Checkout retrieved successfully')
      console.log('   Status:', retrievedCheckout.status)
      console.log('   Product:', retrievedCheckout.product)
    } catch (error: any) {
      console.log('❌ Failed to retrieve checkout:', error.message)
    }
    
    // Step 4: Check if URL is accessible
    console.log('\n4️⃣ Testing checkout URL accessibility...')
    console.log('   URL:', checkout.checkoutUrl)
    console.log('\n⚠️  IMPORTANT: The 404 error happens when accessing this URL in the browser.')
    console.log('   This might be a Creem-side issue with their checkout page.')
    
    // Step 5: Alternative approach - check if we should use a different URL format
    console.log('\n5️⃣ Possible solutions:')
    console.log('   1. Contact Creem support about the 404 error on checkout URLs')
    console.log('   2. Check if there\'s a different URL format or domain for test mode')
    console.log('   3. Verify if the product needs to be "published" in Creem dashboard')
    console.log('   4. Check if there are any additional product settings required')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    if (error.response) {
      console.error('Response:', error.response)
    }
    if (error.data) {
      console.error('Data:', error.data)
    }
  }
}

debugCreemCheckout()