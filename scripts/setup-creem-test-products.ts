#!/usr/bin/env ts-node

import { creemService } from '../src/services/payment/creem'

async function setupTestProducts() {
  console.log('Setting up Creem test products...\n')
  
  // Check if we're in test mode
  if (process.env.NEXT_PUBLIC_CREEM_TEST_MODE !== 'true') {
    console.error('ERROR: NEXT_PUBLIC_CREEM_TEST_MODE must be set to "true"')
    console.error('Please update your .env.local file')
    process.exit(1)
  }
  
  // Check if we have a test API key
  const apiKey = process.env.CREEM_API_KEY || process.env.CREEM_SECRET_KEY
  if (!apiKey || !apiKey.startsWith('creem_test_')) {
    console.error('ERROR: Test API key not found or not a test key')
    console.error('API key should start with "creem_test_"')
    console.error('Current key prefix:', apiKey?.substring(0, 15) || 'NONE')
    process.exit(1)
  }
  
  console.log('Using test API key:', apiKey.substring(0, 20) + '...')
  console.log('Creating products in Creem test environment...\n')
  
  try {
    const results = await creemService.setupTestEnvironment()
    
    console.log('\n✅ Test products created successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Add these environment variables to your Vercel project:')
    console.log('   - Go to your Vercel dashboard')
    console.log('   - Navigate to Settings > Environment Variables')
    console.log('   - Add the product IDs shown above')
    console.log('\n2. Redeploy your application')
    console.log('\n3. Test the checkout flow with these test product IDs')
    
  } catch (error) {
    console.error('\n❌ Failed to create test products:', error)
    console.error('\nTroubleshooting:')
    console.error('1. Verify your test API key is correct')
    console.error('2. Check if you have access to create products in test mode')
    console.error('3. Try logging into test.creem.io with your credentials')
  }
}

// Run the setup
setupProducts().catch(console.error)