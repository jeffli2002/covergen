// CRITICAL: Load .env.local BEFORE importing any modules
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local before any imports
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('Loaded env vars:', {
  CREEM_SECRET_KEY: process.env.CREEM_SECRET_KEY ? 'SET' : 'NOT SET',
  NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'NOT SET'
});

// NOW import modules (env.ts will read from process.env)
const { env } = await import('./src/env.ts');
const { CREEM_PRODUCTS } = await import('./src/services/payment/creem.ts');

console.log('\n=== ENV OBJECT ===');
console.log('CREEM_SECRET_KEY:', env.CREEM_SECRET_KEY ? env.CREEM_SECRET_KEY.substring(0, 20) + '...' : 'NOT SET');
console.log('NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY:', env.NEXT_PUBLIC_PRICE_ID_PRO_MONTHLY || 'NOT SET');
console.log('NEXT_PUBLIC_PRICE_ID_PRO_YEARLY:', env.NEXT_PUBLIC_PRICE_ID_PRO_YEARLY || 'NOT SET');
console.log('NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY:', env.NEXT_PUBLIC_PRICE_ID_PROPLUS_MONTHLY || 'NOT SET');
console.log('NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY:', env.NEXT_PUBLIC_PRICE_ID_PROPLUS_YEARLY || 'NOT SET');

console.log('\n=== CREEM_PRODUCTS ===');
console.log(JSON.stringify(CREEM_PRODUCTS, null, 2));

console.log('\n=== TEST: Product IDs Available ===');
const tests = [
  ['pro_monthly', CREEM_PRODUCTS.pro_monthly],
  ['pro_yearly', CREEM_PRODUCTS.pro_yearly],
  ['pro_plus_monthly', CREEM_PRODUCTS.pro_plus_monthly],
  ['pro_plus_yearly', CREEM_PRODUCTS.pro_plus_yearly]
];

let allPassed = true;
for (const [name, value] of tests) {
  if (value) {
    console.log(`✅ ${name}: ${value}`);
  } else {
    console.log(`❌ ${name}: NOT SET`);
    allPassed = false;
  }
}

console.log('\n=== RESULT ===');
if (allPassed) {
  console.log('✅ All product IDs loaded successfully\!');
  process.exit(0);
} else {
  console.log('❌ Some product IDs missing');
  process.exit(1);
}
