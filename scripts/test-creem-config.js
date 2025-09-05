#!/usr/bin/env node

/**
 * Test script to verify Creem configuration
 * This helps diagnose 403 Forbidden errors and other configuration issues
 * 
 * Usage:
 *   npm run test:creem-config
 */

require('dotenv').config({ path: '.env.local' })

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

function checkConfig() {
  log('\n🔍 Creem Configuration Test\n', 'cyan')

  // Check environment mode
  const nodeEnv = process.env.NODE_ENV || 'development'
  const testMode = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true'
  log(`Environment: ${nodeEnv}`, 'blue')
  log(`Test Mode: ${testMode ? 'ENABLED' : 'DISABLED'}\n`, testMode ? 'yellow' : 'blue')

  // Check API keys
  const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY || ''
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET || ''
  
  if (!apiKey) {
    log('❌ No API key found! Set CREEM_SECRET_KEY in .env.local', 'red')
    return false
  }

  const isTestKey = apiKey.startsWith('creem_test_')
  log(`API Key: ${apiKey.substring(0, 15)}...`, 'blue')
  log(`Key Type: ${isTestKey ? 'TEST' : 'PRODUCTION'}`, isTestKey ? 'yellow' : 'green')
  
  // Check for environment mismatch
  if (testMode && !isTestKey) {
    log('\n⚠️  WARNING: Test mode enabled but using production API key!', 'red')
    log('This will cause 403 Forbidden errors.', 'red')
    log('Solution: Use a test API key (starts with "creem_test_")', 'yellow')
    return false
  }
  
  if (!testMode && isTestKey) {
    log('\n⚠️  WARNING: Production mode but using test API key!', 'red')
    log('This will cause issues in production.', 'red')
    log('Solution: Use a production API key (starts with "creem_")', 'yellow')
    return false
  }

  log('✅ API key matches environment mode\n', 'green')

  // Check webhook secret
  if (!webhookSecret) {
    log('⚠️  No webhook secret found. Set CREEM_WEBHOOK_SECRET for webhook verification.', 'yellow')
  } else {
    log(`Webhook Secret: ${webhookSecret.substring(0, 10)}...`, 'blue')
  }

  // Check product IDs
  log('\n📦 Product IDs Configuration:\n', 'cyan')
  
  if (testMode) {
    const testProId = process.env.CREEM_TEST_PRO_PRODUCT_ID
    const testProPlusId = process.env.CREEM_TEST_PRO_PLUS_PRODUCT_ID
    
    if (!testProId || !testProPlusId) {
      log('❌ Test product IDs not configured!', 'red')
      log('Run "npm run setup:creem-test" to create test products', 'yellow')
      return false
    }
    
    log(`Test Pro Product: ${testProId || 'NOT SET'}`, testProId ? 'green' : 'red')
    log(`Test Pro+ Product: ${testProPlusId || 'NOT SET'}`, testProPlusId ? 'green' : 'red')
  } else {
    const prodProId = process.env.CREEM_PROD_PRO_PRODUCT_ID
    const prodProPlusId = process.env.CREEM_PROD_PRO_PLUS_PRODUCT_ID
    
    log(`Prod Pro Product: ${prodProId || 'NOT SET'}`, prodProId ? 'green' : 'red')
    log(`Prod Pro+ Product: ${prodProPlusId || 'NOT SET'}`, prodProPlusId ? 'green' : 'red')
  }

  // Check for common misconfigurations
  log('\n🔧 Common Issues Check:\n', 'cyan')
  
  // Check if using production product IDs in env vars (common mistake)
  const envProId = process.env.CREEM_PRO_PLAN_ID
  const envProPlusId = process.env.CREEM_PRO_PLUS_PLAN_ID
  
  if (testMode && (envProId || envProPlusId)) {
    if (envProId && envProId.startsWith('prod_') && !envProId.includes('test')) {
      log('⚠️  Found production product ID in CREEM_PRO_PLAN_ID', 'yellow')
      log(`   ${envProId}`, 'yellow')
      log('   This might cause 403 errors in test mode.', 'yellow')
    }
  }

  // Summary
  log('\n📋 Configuration Summary:\n', 'cyan')
  log(`✅ Environment: ${testMode ? 'TEST' : 'PRODUCTION'}`, 'green')
  log(`✅ API Key Type: ${isTestKey ? 'TEST' : 'PRODUCTION'}`, 'green')
  log(`${webhookSecret ? '✅' : '⚠️ '} Webhook Secret: ${webhookSecret ? 'Configured' : 'Not configured'}`, webhookSecret ? 'green' : 'yellow')
  
  if (testMode) {
    const hasTestProducts = process.env.CREEM_TEST_PRO_PRODUCT_ID && process.env.CREEM_TEST_PRO_PLUS_PRODUCT_ID
    log(`${hasTestProducts ? '✅' : '❌'} Test Products: ${hasTestProducts ? 'Configured' : 'Not configured'}`, hasTestProducts ? 'green' : 'red')
    
    if (!hasTestProducts) {
      log('\n📌 Next Steps:', 'cyan')
      log('1. Run "npm run setup:creem-test" to create test products', 'yellow')
      log('2. Update .env.local with the generated product IDs', 'yellow')
      log('3. Run this test again to verify', 'yellow')
    }
  }

  log('\n✨ Configuration test complete!\n', 'cyan')
  return true
}

// Run the check
const isValid = checkConfig()
process.exit(isValid ? 0 : 1)