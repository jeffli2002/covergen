#!/usr/bin/env node

const dotenv = require('dotenv')
const path = require('path')

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

console.log('🔍 Creem Configuration Diagnostics\n')

// Check test mode configuration
const isTestMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
const nodeEnv = process.env.NODE_ENV
const vercelEnv = process.env.VERCEL_ENV

console.log('1. Environment Mode:')
console.log('   - NEXT_PUBLIC_CREEM_TEST_MODE:', process.env.NEXT_PUBLIC_CREEM_TEST_MODE || 'NOT SET')
console.log('   - NODE_ENV:', nodeEnv || 'NOT SET')
console.log('   - VERCEL_ENV:', vercelEnv || 'NOT SET')
console.log('   - Computed Test Mode:', isTestMode)

// Check API key
const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY || ''
console.log('\n2. API Key Configuration:')
console.log('   - CREEM_SECRET_KEY:', process.env.CREEM_SECRET_KEY ? '✅ SET' : '❌ NOT SET')
console.log('   - CREEM_API_KEY:', process.env.CREEM_API_KEY ? '✅ SET' : '❌ NOT SET')
if (apiKey) {
  console.log('   - Key Type:', apiKey.startsWith('creem_test_') ? 'TEST KEY' : 'PRODUCTION KEY')
  console.log('   - Key Prefix:', apiKey.substring(0, 12) + '...')
}

// Check product IDs
console.log('\n3. Product IDs:')
console.log('   - CREEM_PRO_PLAN_ID:', process.env.CREEM_PRO_PLAN_ID || 'NOT SET (using fallback)')
console.log('   - CREEM_PRO_PLUS_PLAN_ID:', process.env.CREEM_PRO_PLUS_PLAN_ID || 'NOT SET (using fallback)')

// Check webhook secret
console.log('\n4. Webhook Configuration:')
console.log('   - CREEM_WEBHOOK_SECRET:', process.env.CREEM_WEBHOOK_SECRET ? '✅ SET' : '❌ NOT SET')

// API/Test mode mismatch check
console.log('\n5. Configuration Validation:')
const hasTestKey = apiKey.startsWith('creem_test_')
if (isTestMode && !hasTestKey) {
  console.log('   ⚠️  WARNING: Test mode enabled but using production API key')
} else if (!isTestMode && hasTestKey) {
  console.log('   ⚠️  WARNING: Production mode enabled but using test API key')
} else {
  console.log('   ✅ API key matches environment mode')
}

// Check if we're in development but forcing production mode
if (nodeEnv === 'development' && !isTestMode) {
  console.log('   ⚠️  WARNING: Development environment but test mode not enabled')
}

// Suggest fixes
console.log('\n6. Recommended Actions:')
if (!apiKey) {
  console.log('   ❌ Set CREEM_SECRET_KEY in your .env.local file')
}

if (isTestMode) {
  console.log('   📝 Since test mode is enabled:')
  console.log('      - Ensure you have test products created in Creem test dashboard')
  console.log('      - Use test API key (starts with creem_test_)')
  console.log('      - Test checkout URLs will use https://creem.io/test/checkout/...')
} else {
  console.log('   📝 Since production mode is enabled:')
  console.log('      - Ensure you have live products created in Creem production dashboard')
  console.log('      - Use production API key (does not start with creem_test_)')
  console.log('      - Checkout URLs will use https://creem.io/checkout/...')
}

console.log('\n7. Debug Steps:')
console.log('   1. Verify products exist in the correct Creem dashboard (test vs production)')
console.log('   2. Check if the API key matches the environment (test key for test mode)')
console.log('   3. Try toggling NEXT_PUBLIC_CREEM_TEST_MODE to match your API key type')
console.log('   4. Contact Creem support if checkout URLs continue to return 404')

// Show the exact URL format that will be generated
const serverIdx = isTestMode ? 1 : 0
const urlPrefix = serverIdx === 1 ? 'https://creem.io/test' : 'https://creem.io'
console.log('\n8. Expected Checkout URL Format:')
console.log('   ' + urlPrefix + '/checkout/{product_id}/{checkout_id}')