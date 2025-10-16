#!/usr/bin/env node

/**
 * Test webhook handler locally with sample Creem payloads
 */

import { creemService } from '../src/services/payment/creem.js'

// Sample checkout.completed payload
const checkoutCompletedPayload = {
  id: 'checkout_test_123',
  eventType: 'checkout.completed',
  object: {
    id: 'checkout_test_123',
    customer: {
      id: 'cust_test_456',
      email: '994235892@qq.com',
      external_id: '57c1c563-4cdd-4471-baa0-f49064b997c9'
    },
    subscription: {
      id: 'sub_test_789',
      subscription_id: 'sub_test_789',
      product: {
        id: 'prod_pro_monthly'
      }
    },
    metadata: {
      userId: '57c1c563-4cdd-4471-baa0-f49064b997c9',
      userEmail: '994235892@qq.com',
      planId: 'pro',
      billingCycle: 'monthly',
      currentPlan: 'free'
    },
    order: {
      id: 'order_test_012',
      product: 'prod_pro_monthly',
      subscription_id: 'sub_test_789'
    },
    trial_period_days: 0
  }
}

// Sample subscription.update payload
const subscriptionUpdatePayload = {
  id: 'event_test_345',
  eventType: 'subscription.update',
  object: {
    id: 'sub_test_789',
    customer: {
      id: 'cust_test_456',
      email: '994235892@qq.com'
    },
    status: 'active',
    metadata: {
      userId: '57c1c563-4cdd-4471-baa0-f49064b997c9',
      planId: 'pro'
    },
    product: {
      id: 'prod_pro_monthly'
    },
    current_period_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false
  }
}

console.log('=== Testing Webhook Handler Locally ===\n')

console.log('Test 1: checkout.completed event')
console.log('-----------------------------------')
try {
  const result1 = await creemService.handleWebhookEvent(checkoutCompletedPayload)
  console.log('\n✅ Result:', JSON.stringify(result1, null, 2))
  console.log('\nExpected:')
  console.log('  - type: "checkout_complete"')
  console.log('  - planId: "pro"')
  console.log('  - userId: "57c1c563-4cdd-4471-baa0-f49064b997c9"')
  console.log('\nActual:')
  console.log('  - type:', result1.type)
  console.log('  - planId:', result1.planId)
  console.log('  - userId:', result1.userId)
  console.log('\n' + (result1.planId === 'pro' ? '✅ PASS' : '❌ FAIL: planId should be "pro"'))
} catch (error) {
  console.error('❌ Error:', error.message)
}

console.log('\n\nTest 2: subscription.update event')
console.log('-----------------------------------')
try {
  const result2 = await creemService.handleWebhookEvent(subscriptionUpdatePayload)
  console.log('\n✅ Result:', JSON.stringify(result2, null, 2))
  console.log('\nExpected:')
  console.log('  - type: "subscription_update"')
  console.log('  - planId: "pro"')
  console.log('  - userId: "57c1c563-4cdd-4471-baa0-f49064b997c9"')
  console.log('\nActual:')
  console.log('  - type:', result2.type)
  console.log('  - planId:', result2.planId)
  console.log('  - userId:', result2.userId)
  console.log('\n' + (result2.planId === 'pro' ? '✅ PASS' : '❌ FAIL: planId should be "pro"'))
} catch (error) {
  console.error('❌ Error:', error.message)
}

console.log('\n=== Tests Complete ===\n')
