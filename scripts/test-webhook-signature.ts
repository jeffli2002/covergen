#!/usr/bin/env tsx
/**
 * Test script to verify Creem webhook signature generation
 * Usage: npm run test:webhook-signature
 */

import * as crypto from 'crypto';

// Sample webhook payload
const samplePayload = {
  id: 'evt_test_123',
  eventType: 'checkout.completed',
  created_at: Date.now(),
  object: {
    id: 'ch_test_123',
    customer: {
      id: 'cust_test_123',
      email: 'test@example.com'
    },
    subscription: {
      id: 'sub_test_123'
    },
    metadata: {
      userId: 'user_123',
      planId: 'pro'
    }
  }
};

// Function to generate signature (same as Creem's implementation)
function generateSignature(payload: string, secret: string): string {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return computedSignature;
}

// Test the signature generation
function testWebhookSignature() {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET || 'whsec_test_secret';
  const payloadString = JSON.stringify(samplePayload);
  
  console.log('🔐 Testing Creem Webhook Signature Generation\n');
  console.log('Webhook Secret:', webhookSecret.substring(0, 10) + '...');
  console.log('Payload:', JSON.stringify(samplePayload, null, 2));
  
  const signature = generateSignature(payloadString, webhookSecret);
  console.log('\n✅ Generated Signature:', signature);
  
  // Test verification
  console.log('\n🔍 Testing Verification:');
  const isValid = signature === generateSignature(payloadString, webhookSecret);
  console.log('Signature valid:', isValid);
  
  // Example curl command
  console.log('\n📡 Example curl command to test webhook:');
  console.log(`
curl -X POST https://your-domain.com/api/webhooks/creem \\
  -H "Content-Type: application/json" \\
  -H "creem-signature: ${signature}" \\
  -d '${payloadString}'
`);

  // Local testing with different URL
  console.log('\n🏠 For local testing with ngrok:');
  console.log(`
curl -X POST https://YOUR_NGROK_URL.ngrok.io/api/webhooks/creem-test \\
  -H "Content-Type: application/json" \\
  -H "creem-signature: ${signature}" \\
  -d '${payloadString}'
`);
}

// Run the test
testWebhookSignature();