// Test script to verify session-based usage tracking is working
// Run with: node scripts/test-session-usage.js

import { bestAuthSubscriptionService } from '../src/services/bestauth/BestAuthSubscriptionService.js'

async function testSessionUsage() {
  console.log('Testing session-based usage tracking...\n')
  
  // Test session ID
  const testSessionId = 'test-session-' + Date.now()
  console.log('Test Session ID:', testSessionId)
  
  try {
    // 1. Check initial usage (should be 0)
    console.log('\n1. Checking initial usage...')
    const initialUsage = await bestAuthSubscriptionService.getSessionUsageToday(testSessionId)
    console.log('Initial usage:', initialUsage)
    
    // 2. Check if can generate
    console.log('\n2. Checking if session can generate...')
    const canGenerate = await bestAuthSubscriptionService.canSessionGenerate(testSessionId)
    console.log('Can generate:', canGenerate)
    
    // 3. Increment usage
    console.log('\n3. Incrementing usage...')
    const result1 = await bestAuthSubscriptionService.incrementSessionUsage(testSessionId, 1)
    console.log('Increment result:', result1)
    
    // 4. Check usage again
    console.log('\n4. Checking usage after increment...')
    const usageAfter1 = await bestAuthSubscriptionService.getSessionUsageToday(testSessionId)
    console.log('Usage after increment:', usageAfter1)
    
    // 5. Increment again
    console.log('\n5. Incrementing usage again...')
    const result2 = await bestAuthSubscriptionService.incrementSessionUsage(testSessionId, 1)
    console.log('Second increment result:', result2)
    
    // 6. Check final usage
    console.log('\n6. Checking final usage...')
    const finalUsage = await bestAuthSubscriptionService.getSessionUsageToday(testSessionId)
    console.log('Final usage:', finalUsage)
    
    // 7. Try to exceed limit (free tier has 3 daily limit)
    console.log('\n7. Testing limit (incrementing one more time)...')
    const result3 = await bestAuthSubscriptionService.incrementSessionUsage(testSessionId, 1)
    console.log('Third increment result:', result3)
    
    // 8. Check if can still generate
    console.log('\n8. Checking if session can still generate...')
    const canGenerateAfter = await bestAuthSubscriptionService.canSessionGenerate(testSessionId)
    console.log('Can generate after 3 uses:', canGenerateAfter)
    
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
  }
}

// Run the test
testSessionUsage()