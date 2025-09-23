// Test script for session-based usage tracking
import { bestAuthSubscriptionService } from '../src/services/bestauth/BestAuthSubscriptionService'
import { v4 as uuidv4 } from 'uuid'

async function testSessionUsage() {
  console.log('Testing session-based usage tracking...')
  
  // Create a test session ID
  const sessionId = uuidv4()
  console.log('Test session ID:', sessionId)
  
  // Check initial usage
  const initialUsage = await bestAuthSubscriptionService.getSessionUsageToday(sessionId)
  console.log('Initial usage:', initialUsage)
  
  // Check if can generate
  const canGenerate = await bestAuthSubscriptionService.canSessionGenerate(sessionId)
  console.log('Can generate:', canGenerate)
  
  // Increment usage
  const result = await bestAuthSubscriptionService.incrementSessionUsage(sessionId)
  console.log('Increment result:', result)
  
  // Check usage after increment
  const newUsage = await bestAuthSubscriptionService.getSessionUsageToday(sessionId)
  console.log('New usage:', newUsage)
  
  // Try incrementing 2 more times (should hit limit at 3)
  for (let i = 0; i < 2; i++) {
    const result = await bestAuthSubscriptionService.incrementSessionUsage(sessionId)
    console.log(`Increment ${i + 2} result:`, result)
  }
  
  // Check if can still generate (should be false)
  const canGenerateAfter = await bestAuthSubscriptionService.canSessionGenerate(sessionId)
  console.log('Can generate after 3 uses:', canGenerateAfter)
  
  // Try to increment beyond limit
  const beyondLimit = await bestAuthSubscriptionService.incrementSessionUsage(sessionId)
  console.log('Increment beyond limit result:', beyondLimit)
}

// Run the test
testSessionUsage().catch(console.error)