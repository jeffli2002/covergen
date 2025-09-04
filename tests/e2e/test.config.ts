export const testConfig = {
  // Test environment URLs
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  
  // Test timeouts
  timeouts: {
    generation: 30000,
    payment: 20000,
    navigation: 10000
  },
  
  // Test data
  testData: {
    // Test credit card numbers (Stripe/Creem test cards)
    cards: {
      valid: '4242424242424242',
      declined: '4000000000000002',
      insufficientFunds: '4000000000009995',
      expired: '4000000000000069',
      incorrectCvc: '4000000000000127'
    },
    
    // Test webhook signatures
    webhookSignature: process.env.TEST_WEBHOOK_SIGNATURE || 'test_signature',
    
    // Test user cleanup
    cleanupEmails: [
      'test@example.com',
      'free.user@test.com',
      'pro.user@test.com',
      'proplus.user@test.com'
    ]
  },
  
  // Feature flags for tests
  features: {
    skipWebhookSignatureValidation: process.env.SKIP_WEBHOOK_SIGNATURE === 'true',
    useRealPaymentProvider: process.env.USE_REAL_PAYMENT === 'true',
    enableDebugLogging: process.env.DEBUG === 'true'
  }
};