#!/usr/bin/env node

/**
 * Script to verify if Creem products exist
 */

require('dotenv').config({ path: '.env.local' });

// Configuration
const API_KEY = process.env.CREEM_API_KEY || process.env.CREEM_SECRET_KEY || '';
const IS_TEST_MODE = process.env.NEXT_PUBLIC_CREEM_TEST_MODE === 'true' || API_KEY.startsWith('creem_test_');

// Product IDs to check
const PRODUCT_IDS = {
  pro: process.env.CREEM_PRO_PLAN_ID || 'prod_7HHnnUgLVjiHBQOGQyKPKO',
  pro_plus: process.env.CREEM_PRO_PLUS_PLAN_ID || 'prod_5FSXAIuhm6ueniFPAbaOoS'
};

console.log('🔍 Verifying Creem Products');
console.log('==========================');
console.log(`Mode: ${IS_TEST_MODE ? 'TEST' : 'PRODUCTION'}`);
console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
console.log(`Environment: ${IS_TEST_MODE ? 'https://test.creem.io' : 'https://app.creem.io'}`);
console.log('');

if (!API_KEY) {
  console.error('❌ Error: CREEM_API_KEY or CREEM_SECRET_KEY not found');
  process.exit(1);
}

console.log('Product IDs to verify:');
console.log(`  Pro: ${PRODUCT_IDS.pro}`);
console.log(`  Pro+: ${PRODUCT_IDS.pro_plus}`);
console.log('');

// Since we can't import Creem directly, let's make raw API calls
const https = require('https');

function checkProduct(productId, productName) {
  return new Promise((resolve, reject) => {
    const hostname = IS_TEST_MODE ? 'test-api.creem.io' : 'api.creem.io';
    const path = `/v1/products/${productId}`;
    
    console.log(`Checking ${productName} product (${productId})...`);
    console.log(`  API: https://${hostname}${path}`);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const product = JSON.parse(data);
            console.log(`✅ ${productName} product found: ${product.name || productId}`);
            console.log(`   Price: $${((product.amount || product.price || 0) / 100).toFixed(2)} ${product.currency || 'USD'}`);
            console.log(`   Type: ${product.type || product.billingType || 'recurring'}`);
            resolve(true);
          } catch (e) {
            console.log(`✅ ${productName} product found (ID: ${productId})`);
            resolve(true);
          }
        } else if (res.statusCode === 404) {
          console.error(`❌ ${productName} product NOT FOUND`);
          console.error(`   Status: ${res.statusCode}`);
          console.error(`   Response: ${data}`);
          resolve(false);
        } else {
          console.error(`❌ ${productName} product check failed`);
          console.error(`   Status: ${res.statusCode}`);
          console.error(`   Response: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${productName} product check failed`);
      console.error(`   Error: ${error.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function verifyProducts() {
  const proExists = await checkProduct(PRODUCT_IDS.pro, 'Pro');
  console.log('');
  const proPlusExists = await checkProduct(PRODUCT_IDS.pro_plus, 'Pro+');
  
  console.log('');
  console.log('==========================');
  
  if (proExists && proPlusExists) {
    console.log('✅ All products verified successfully!');
    console.log('');
    console.log('Your Creem integration should work correctly.');
  } else {
    console.log('❌ Some products are missing!');
    console.log('');
    console.log('To fix this issue:');
    console.log('1. Create products in your Creem dashboard');
    console.log(`   Visit: ${IS_TEST_MODE ? 'https://test.creem.io' : 'https://app.creem.io'}`);
    console.log('2. Create two products:');
    console.log('   - CoverGen Pro ($9/month)');
    console.log('   - CoverGen Pro+ ($19/month)');
    console.log('3. Update your environment variables with the new product IDs');
    console.log('4. Redeploy your application');
  }

  process.exit(proExists && proPlusExists ? 0 : 1);
}

// Run verification
verifyProducts().catch(console.error);