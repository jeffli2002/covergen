#!/usr/bin/env node

const https = require('https');

const CREEM_API_KEY = process.env.CREEM_API_KEY || 'creem_test_74IKMH2ZX1ckFe451eRfF1';

console.log('Checking Creem products...');
console.log('Using API Key:', CREEM_API_KEY);
console.log('');

// Make API request to list products
const options = {
  hostname: 'api.creem.io',
  path: '/v1/products',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${CREEM_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log(`Found ${products.data.length} products:\n`);
        
        products.data.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Price: ${product.price} ${product.currency}`);
          console.log(`   Status: ${product.active ? 'Active' : 'Inactive'}`);
          console.log('');
        });
        
        if (products.data.length === 0) {
          console.log('No products found. You need to create products in Creem first.');
          console.log('\nTo create products:');
          console.log('1. Log into your Creem dashboard');
          console.log('2. Go to Products section');
          console.log('3. Create two products:');
          console.log('   - Pro Plan (monthly subscription)');
          console.log('   - Pro Plus Plan (monthly subscription)');
          console.log('4. Update your .env.local with the new product IDs');
        }
      } else {
        console.error(`Error: ${res.statusCode} - ${data}`);
      }
    } catch (error) {
      console.error('Failed to parse response:', error);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error);
});

req.end();