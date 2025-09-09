#!/usr/bin/env node

// Simple Creem configuration checker that doesn't require dotenv
// Run with: node scripts/check-creem-config-simple.js

console.log('🔍 Creem Configuration Check\n')

// Check test mode
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
console.log('   Production IDs:')
console.log('   - CREEM_PRO_PLAN_ID:', process.env.CREEM_PRO_PLAN_ID || 'NOT SET (using fallback)')
console.log('   - CREEM_PRO_PLUS_PLAN_ID:', process.env.CREEM_PRO_PLUS_PLAN_ID || 'NOT SET (using fallback)')
console.log('   Test IDs:')
console.log('   - CREEM_TEST_PRO_PLAN_ID:', process.env.CREEM_TEST_PRO_PLAN_ID || 'NOT SET')
console.log('   - CREEM_TEST_PRO_PLUS_PLAN_ID:', process.env.CREEM_TEST_PRO_PLUS_PLAN_ID || 'NOT SET')

// API/Test mode mismatch check
console.log('\n4. Configuration Validation:')
const hasTestKey = apiKey.startsWith('creem_test_')
if (isTestMode && !hasTestKey) {
  console.log('   ⚠️  WARNING: Test mode enabled but using production API key')
} else if (!isTestMode && hasTestKey) {
  console.log('   ⚠️  WARNING: Production mode enabled but using test API key')
} else {
  console.log('   ✅ API key matches environment mode')
}

// Show which product IDs will be used based on current configuration
console.log('\n5. Active Product IDs (based on current mode):')
if (isTestMode) {
  console.log('   - Mode: TEST')
  console.log('   - Pro ID will be:', process.env.CREEM_TEST_PRO_PLAN_ID || process.env.CREEM_PRO_PLAN_ID || 'prod_7HHnnUgLVjiHBQOGQyKPKO (fallback)')
  console.log('   - Pro+ ID will be:', process.env.CREEM_TEST_PRO_PLUS_PLAN_ID || process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_5FSXAIuhm6ueniFPAbaOoS (fallback)')
} else {
  console.log('   - Mode: PRODUCTION')
  console.log('   - Pro ID will be:', process.env.CREEM_PRO_PLAN_ID || 'prod_7HHnnUgLVjiHBQOGQyKPKO (fallback)')
  console.log('   - Pro+ ID will be:', process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_5FSXAIuhm6ueniFPAbaOoS (fallback)')
}

// Problem diagnosis
console.log('\n6. Problem Diagnosis:')
if (isTestMode && !process.env.CREEM_TEST_PRO_PLAN_ID && !process.env.CREEM_TEST_PRO_PLUS_PLAN_ID) {
  console.log('   ❌ PROBLEM DETECTED: Test mode is enabled but no test product IDs are set!')
  console.log('   This will cause 404 errors because production product IDs don\'t exist in test environment.')
}

// Recommended actions
console.log('\n7. Recommended Actions:')
if (isTestMode) {
  if (!process.env.CREEM_TEST_PRO_PLAN_ID || !process.env.CREEM_TEST_PRO_PLUS_PLAN_ID) {
    console.log('   Option 1: Disable test mode by setting NEXT_PUBLIC_CREEM_TEST_MODE=false')
    console.log('   Option 2: Create test products in Creem test dashboard and set:')
    console.log('            - CREEM_TEST_PRO_PLAN_ID=<your_test_pro_product_id>')
    console.log('            - CREEM_TEST_PRO_PLUS_PLAN_ID=<your_test_pro_plus_product_id>')
  }
}

console.log('\n8. Expected Checkout URL Format:')
const urlPrefix = isTestMode ? 'https://creem.io/test' : 'https://creem.io'
console.log('   ' + urlPrefix + '/checkout/{product_id}/{checkout_id}')