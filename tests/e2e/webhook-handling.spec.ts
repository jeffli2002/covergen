import { test, expect } from '@playwright/test';
import { signUp, TEST_USERS } from './helpers/auth.helper';

const WEBHOOK_ENDPOINT = '/api/webhooks/creem';

test.describe('Webhook Handling', () => {
  test.beforeAll(async ({ request }) => {
    await request.post('/api/subscription/clear-test-data', {
      data: {
        emails: Object.values(TEST_USERS).map(u => u.email)
      }
    });
  });

  test.describe('Creem Payment Webhooks', () => {
    test('handles checkout.session.completed webhook', async ({ page, request }) => {
      // Create a user first
      await signUp(page, TEST_USERS.pro);
      
      // Send Creem checkout.session.completed webhook
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          id: 'evt_test_checkout_' + Date.now(),
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_123',
              client_reference_id: 'test_user_id',
              customer: 'cus_test_123',
              customer_email: TEST_USERS.pro.email,
              subscription: 'sub_test_123',
              metadata: {
                user_id: 'test_user_id',
                plan_id: 'pro'
              },
              payment_status: 'paid',
              status: 'complete'
            }
          },
          created: Math.floor(Date.now() / 1000)
        },
        headers: {
          'creem-signature': 'test_signature',
          'content-type': 'application/json'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      // Verify user subscription is updated
      await page.goto('/en/account');
      await page.waitForSelector('text=Pro Plan');
    });

    test('handles charge.failed webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      // First give them a subscription
      await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'charge.succeeded',
          data: {
            id: 'ch_initial',
            amount: 999,
            currency: 'usd',
            customer: { email: TEST_USERS.pro.email },
            metadata: { plan: 'pro' }
          }
        },
        headers: { 'creem-signature': 'test_sig_1' }
      });
      
      // Now send failed charge
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'charge.failed',
          data: {
            id: 'ch_failed_test',
            amount: 999,
            currency: 'usd',
            status: 'failed',
            customer: {
              email: TEST_USERS.pro.email
            },
            failure_message: 'Your card was declined.',
            failure_code: 'card_declined'
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      // User should receive notification about failed payment
      await page.goto('/en/account');
      await expect(page.getByText(/payment failed/i)).toBeVisible();
    });

    test('handles refund.created webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      // Create initial charge
      await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'charge.succeeded',
          data: {
            id: 'ch_refund_test',
            amount: 999,
            currency: 'usd',
            customer: { email: TEST_USERS.pro.email },
            metadata: { plan: 'pro' }
          }
        },
        headers: { 'creem-signature': 'test_sig_1' }
      });
      
      // Send refund webhook
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'refund.created',
          data: {
            id: 'refund_test_1',
            amount: 999,
            currency: 'usd',
            status: 'succeeded',
            charge: 'ch_refund_test',
            customer: {
              email: TEST_USERS.pro.email
            }
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      // User should be downgraded to free
      await page.goto('/en/account');
      await expect(page.getByText('Free Plan')).toBeVisible();
    });
  });

  test.describe('Creem Subscription Webhooks', () => {
    test('handles customer.subscription.created webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          id: 'evt_test_sub_created_' + Date.now(),
          type: 'customer.subscription.created',
          data: {
            object: {
              id: 'sub_created_test',
              customer: 'cus_test_123',
              status: 'active',
              current_period_start: Math.floor(Date.now() / 1000),
              current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
              cancel_at_period_end: false,
              metadata: {
                user_id: 'test_user_id',
                plan_id: 'pro'
              },
              items: {
                data: [{
                  price: {
                    id: 'price_test_pro_900',
                    unit_amount: 900,
                    currency: 'usd',
                    recurring: {
                      interval: 'month'
                    },
                    product: {
                      id: 'prod_test_pro',
                      name: 'Pro Plan',
                      metadata: {
                        plan: 'pro'
                      }
                    }
                  }
                }]
              }
            }
          },
          created: Math.floor(Date.now() / 1000)
        },
        headers: {
          'creem-signature': 'test_signature',
          'content-type': 'application/json'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      await page.goto('/en/account');
      await expect(page.getByText('Pro Plan')).toBeVisible();
      await expect(page.getByText(/renews on/i)).toBeVisible();
    });

    test('handles subscription.updated webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      // Create initial subscription
      await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.created',
          data: {
            id: 'sub_update_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              price: {
                product: {
                  metadata: { plan: 'pro' }
                }
              }
            }]
          }
        },
        headers: { 'creem-signature': 'test_sig_1' }
      });
      
      // Update to Pro+
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.updated',
          data: {
            id: 'sub_update_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              price: {
                unit_amount: 1900,
                product: {
                  metadata: { plan: 'pro-plus' }
                }
              }
            }]
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      await page.goto('/en/account');
      await expect(page.getByText('Pro+ Plan')).toBeVisible();
    });

    test('handles subscription.deleted webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      // Create subscription first
      await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.created',
          data: {
            id: 'sub_delete_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              price: {
                product: {
                  metadata: { plan: 'pro' }
                }
              }
            }]
          }
        },
        headers: { 'creem-signature': 'test_sig_1' }
      });
      
      // Delete subscription
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.deleted',
          data: {
            id: 'sub_delete_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'canceled'
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      await page.goto('/en/account');
      await expect(page.getByText('Free Plan')).toBeVisible();
    });

    test('handles subscription.paused webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      // Create subscription
      await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.created',
          data: {
            id: 'sub_pause_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              price: {
                product: {
                  metadata: { plan: 'pro' }
                }
              }
            }]
          }
        },
        headers: { 'creem-signature': 'test_sig_1' }
      });
      
      // Pause subscription
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'subscription.paused',
          data: {
            id: 'sub_pause_test',
            customer: { email: TEST_USERS.pro.email },
            status: 'paused',
            pause_collection: {
              behavior: 'mark_uncollectible'
            }
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      await page.goto('/en/account');
      await expect(page.getByText(/subscription paused/i)).toBeVisible();
    });
  });

  test.describe('Customer Webhooks', () => {
    test('handles customer.updated webhook', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'customer.updated',
          data: {
            id: 'cus_update_test',
            email: TEST_USERS.pro.email,
            name: 'Updated Name',
            default_payment_method: {
              card: {
                last4: '4242',
                brand: 'visa',
                exp_month: 12,
                exp_year: 2025
              }
            }
          }
        },
        headers: {
          'creem-signature': 'test_signature_' + Date.now()
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      // Payment method should be updated
      await page.goto('/en/account');
      await expect(page.getByText('•••• 4242')).toBeVisible();
    });
  });

  test.describe('Webhook Security', () => {
    test('rejects webhook with invalid signature', async ({ request }) => {
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'charge.succeeded',
          data: {
            id: 'ch_invalid_sig',
            amount: 999,
            customer: { email: TEST_USERS.pro.email }
          }
        },
        headers: {
          'creem-signature': 'invalid_signature'
        }
      });
      
      expect(response.status()).toBe(401);
    });

    test('rejects webhook without signature', async ({ request }) => {
      const response = await request.post(WEBHOOK_ENDPOINT, {
        data: {
          type: 'charge.succeeded',
          data: {
            id: 'ch_no_sig',
            amount: 999,
            customer: { email: TEST_USERS.pro.email }
          }
        }
      });
      
      expect(response.status()).toBe(401);
    });

    test('handles duplicate webhook events', async ({ page, request }) => {
      await signUp(page, TEST_USERS.pro);
      
      const webhookData = {
        type: 'charge.succeeded',
        data: {
          id: 'ch_duplicate_test',
          amount: 999,
          currency: 'usd',
          customer: { email: TEST_USERS.pro.email },
          metadata: { plan: 'pro' }
        }
      };
      
      // Send same webhook twice
      const response1 = await request.post(WEBHOOK_ENDPOINT, {
        data: webhookData,
        headers: { 'creem-signature': 'test_sig_dup_1' }
      });
      
      const response2 = await request.post(WEBHOOK_ENDPOINT, {
        data: webhookData,
        headers: { 'creem-signature': 'test_sig_dup_2' }
      });
      
      expect(response1.ok()).toBeTruthy();
      expect(response2.ok()).toBeTruthy();
      
      // User should only have one subscription
      await page.goto('/en/account');
      const subscriptionElements = await page.locator('text=Pro Plan').count();
      expect(subscriptionElements).toBe(1);
    });
  });
});