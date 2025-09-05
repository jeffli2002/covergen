// Test script to verify environment variables are loaded correctly
console.log('=== Environment Variables Test ===\n')

// Check Node environment
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('VERCEL_ENV:', process.env.VERCEL_ENV)
console.log('')

// Check Creem-related variables
const creemVars = {
  'CREEM_SECRET_KEY': process.env.CREEM_SECRET_KEY,
  'CREEM_API_KEY': process.env.CREEM_API_KEY,
  'CREEM_TEST_API_KEY': process.env.CREEM_TEST_API_KEY,
  'NEXT_PUBLIC_CREEM_TEST_MODE': process.env.NEXT_PUBLIC_CREEM_TEST_MODE,
  'CREEM_PRO_PLAN_ID': process.env.CREEM_PRO_PLAN_ID,
  'CREEM_PRO_PLUS_PLAN_ID': process.env.CREEM_PRO_PLUS_PLAN_ID,
  'CREEM_WEBHOOK_SECRET': process.env.CREEM_WEBHOOK_SECRET
}

console.log('Creem Environment Variables:')
for (const [key, value] of Object.entries(creemVars)) {
  if (value) {
    console.log(`${key}: ${value.substring(0, 20)}... (length: ${value.length})`)
  } else {
    console.log(`${key}: NOT SET`)
  }
}

// Check if the API key is a test key
const apiKey = process.env.CREEM_SECRET_KEY || process.env.CREEM_API_KEY || ''
if (apiKey) {
  console.log('\nAPI Key validation:')
  console.log('- Is test key:', apiKey.startsWith('creem_test_'))
  console.log('- Test mode enabled:', process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true')
  
  if (process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' && !apiKey.startsWith('creem_test_')) {
    console.error('\n⚠️  WARNING: Test mode is enabled but API key is not a test key!')
  }
}

console.log('\n=== End Test ===')