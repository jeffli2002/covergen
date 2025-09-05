#!/usr/bin/env node

/**
 * Setup script for Creem test environment
 * This script creates test products in your Creem test dashboard
 * 
 * Usage:
 *   npm run setup:creem-test
 */

require('dotenv').config({ path: '.env.local' })

const { creemService } = require('../src/services/payment/creem')

async function setupCreemTest() {
  console.log('🚀 Setting up Creem test environment...\n')

  // Check environment
  const testMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY

  if (!testMode) {
    console.error('❌ Error: NEXT_PUBLIC_CREEM_TEST_MODE must be set to "true" in .env.local')
    process.exit(1)
  }

  if (!apiKey || !apiKey.startsWith('creem_test_')) {
    console.error('❌ Error: CREEM_SECRET_KEY must be a test API key (starting with "creem_test_")')
    console.error('   Current key:', apiKey ? apiKey.substring(0, 15) + '...' : 'Not set')
    process.exit(1)
  }

  console.log('✅ Test mode enabled')
  console.log('✅ Test API key detected:', apiKey.substring(0, 15) + '...')
  console.log('\n📦 Creating test products...\n')

  try {
    const result = await creemService.setupTestEnvironment()
    console.log('\n✨ Setup complete! Check the logs above for your test product IDs.')
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    process.exit(1)
  }
}

// Run setup
setupCreemTest().catch(console.error)