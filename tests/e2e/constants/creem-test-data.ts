/**
 * Creem Test Data Constants
 * Reference: https://docs.creem.io/testing
 */

// Creem Test Cards
export const CREEM_TEST_CARDS = {
  // Successful payments
  SUCCESS: {
    number: '4242424242424242',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  // Card errors
  DECLINED: {
    number: '4000000000000002',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  INSUFFICIENT_FUNDS: {
    number: '4000000000009995',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  EXPIRED_CARD: {
    number: '4000000000000069',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  INCORRECT_CVC: {
    number: '4000000000000127',
    exp: '12/25',
    cvc: '999', // Wrong CVC
    zip: '10001'
  },
  
  PROCESSING_ERROR: {
    number: '4000000000000119',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  // 3D Secure
  THREE_D_SECURE_REQUIRED: {
    number: '4000000000003220',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  },
  
  THREE_D_SECURE_OPTIONAL: {
    number: '4000000000003246',
    exp: '12/25',
    cvc: '123',
    zip: '10001'
  }
};

// Creem Test Bank Accounts (for ACH/SEPA)
export const CREEM_TEST_BANK_ACCOUNTS = {
  SUCCESS: {
    routing: '110000000',
    account: '000123456789',
    type: 'checking'
  },
  
  FAILED: {
    routing: '110000000',
    account: '000111111113',
    type: 'checking'
  }
};

// Creem Test Webhook Events
export const CREEM_TEST_EVENTS = {
  CHECKOUT_COMPLETED: {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_{{SESSION_ID}}',
        payment_status: 'paid',
        status: 'complete',
        customer: 'cus_test_{{CUSTOMER_ID}}',
        subscription: 'sub_test_{{SUBSCRIPTION_ID}}',
        metadata: {}
      }
    }
  },
  
  SUBSCRIPTION_CREATED: {
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test_{{SUBSCRIPTION_ID}}',
        customer: 'cus_test_{{CUSTOMER_ID}}',
        status: 'active',
        items: {
          data: []
        },
        metadata: {}
      }
    }
  },
  
  PAYMENT_SUCCEEDED: {
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: 'in_test_{{INVOICE_ID}}',
        customer: 'cus_test_{{CUSTOMER_ID}}',
        subscription: 'sub_test_{{SUBSCRIPTION_ID}}',
        status: 'paid',
        metadata: {}
      }
    }
  },
  
  PAYMENT_FAILED: {
    type: 'invoice.payment_failed',
    data: {
      object: {
        id: 'in_test_{{INVOICE_ID}}',
        customer: 'cus_test_{{CUSTOMER_ID}}',
        subscription: 'sub_test_{{SUBSCRIPTION_ID}}',
        status: 'open',
        metadata: {}
      }
    }
  }
};

// Creem Test Price IDs (should match your test mode products)
export const CREEM_TEST_PRICES = {
  PRO_MONTHLY: 'price_test_pro_900',
  PRO_PLUS_MONTHLY: 'price_test_proplus_1900',
  PRO_YEARLY: 'price_test_pro_yearly_9000',
  PRO_PLUS_YEARLY: 'price_test_proplus_yearly_19000'
};

// Helper to generate test IDs
export function generateTestId(prefix: string): string {
  return `${prefix}_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to create test metadata
export function createTestMetadata(data: Record<string, any>): Record<string, string> {
  // Creem requires metadata values to be strings
  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    metadata[key] = String(value);
  }
  return metadata;
}