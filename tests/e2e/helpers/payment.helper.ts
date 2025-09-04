import { Page } from '@playwright/test';
import { CREEM_TEST_CARDS } from '../../../src/services/payment/creem';

// Creem test cards with full details
export const TEST_CARDS = {
  valid: {
    number: CREEM_TEST_CARDS.success,
    expiry: '12/25',
    cvc: '123',
    postal: '12345'
  },
  declined: {
    number: CREEM_TEST_CARDS.decline,
    expiry: '12/25',
    cvc: '123',
    postal: '12345'
  },
  insufficient_funds: {
    number: CREEM_TEST_CARDS.insufficient,
    expiry: '12/25',
    cvc: '123',
    postal: '12345'
  },
  expired: {
    number: CREEM_TEST_CARDS.expired,
    expiry: '12/20', // Past date
    cvc: '123',
    postal: '12345'
  },
  processing_error: {
    number: CREEM_TEST_CARDS.processing_error,
    expiry: '12/25',
    cvc: '123',
    postal: '12345'
  },
  threeDSecure: {
    number: CREEM_TEST_CARDS.threeDSecure,
    expiry: '12/25',
    cvc: '123',
    postal: '12345'
  }
};

export async function fillPaymentDetails(page: Page, card = TEST_CARDS.valid) {
  // Wait for Creem iframe to load
  const iframe = page.frameLocator('iframe[title="Secure payment input frame"]');
  
  // Fill card details
  await iframe.locator('input[name="cardnumber"]').fill(card.number);
  await iframe.locator('input[name="exp-date"]').fill(card.expiry);
  await iframe.locator('input[name="cvc"]').fill(card.cvc);
  await iframe.locator('input[name="postal"]').fill(card.postal);
}

export async function selectPlan(page: Page, plan: 'pro' | 'pro+') {
  await page.goto('/en/pricing');
  
  if (plan === 'pro') {
    await page.getByRole('button', { name: /upgrade to pro/i }).click();
  } else {
    await page.getByRole('button', { name: /upgrade to pro\+/i }).click();
  }
  
  // Wait for payment page
  await page.waitForURL('**/payment**');
}

export async function completePayment(page: Page, card = TEST_CARDS.valid) {
  await fillPaymentDetails(page, card);
  await page.getByRole('button', { name: /pay now/i }).click();
}

export async function mockWebhook(page: Page, webhookType: string, eventData: any) {
  // Create a properly formatted Creem webhook event
  const webhookEvent = {
    id: `evt_test_${Date.now()}`,
    type: webhookType,
    data: {
      object: eventData
    },
    created: Math.floor(Date.now() / 1000)
  };

  // For test mode, we can use a simple signature
  const signature = process.env.SKIP_WEBHOOK_SIGNATURE === 'true' 
    ? 'test_signature' 
    : generateTestWebhookSignature(JSON.stringify(webhookEvent));

  const response = await page.request.post('/api/webhooks/creem', {
    data: webhookEvent,
    headers: {
      'creem-signature': signature,
      'content-type': 'application/json'
    }
  });
  
  return response;
}

// Helper to generate test webhook signature
function generateTestWebhookSignature(payload: string): string {
  // In real tests, this would use the CREEM_WEBHOOK_SECRET
  // For now, return a test signature that the service will accept in test mode
  return 'test_signature_valid';
}

export async function checkSubscriptionStatus(page: Page, expectedPlan: 'free' | 'pro' | 'pro+') {
  await page.goto('/en/account');
  
  switch (expectedPlan) {
    case 'free':
      await page.waitForSelector('text=Free Plan');
      break;
    case 'pro':
      await page.waitForSelector('text=Pro Plan');
      break;
    case 'pro+':
      await page.waitForSelector('text=Pro+ Plan');
      break;
  }
}