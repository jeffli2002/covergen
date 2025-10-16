// Load .env.local BEFORE importing any modules
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

// Import after env is loaded
const { creemService } = await import('./src/services/payment/creem.ts');

console.log('\n=== TESTING CREEM CHECKOUT ===\n');

const result = await creemService.createCheckoutSession({
  userId: 'test_user_123',
  userEmail: 'test@example.com',
  planId: 'pro',
  billingCycle: 'monthly',
  successUrl: 'http://localhost:3000/success',
  cancelUrl: 'http://localhost:3000/cancel',
  currentPlan: 'free'
});

console.log('\n=== CHECKOUT RESULT ===');
console.log(JSON.stringify(result, null, 2));

if (result.success) {
  console.log('\n✅ Checkout session created successfully\!');
  console.log('Session ID:', result.sessionId);
  console.log('Checkout URL:', result.url);
  process.exit(0);
} else {
  console.log('\n❌ Checkout failed:', result.error);
  process.exit(1);
}
