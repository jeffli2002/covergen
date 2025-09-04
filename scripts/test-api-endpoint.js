const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testApiEndpoint() {
  // First check if server is running
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
  console.log('Testing API at:', baseUrl);
  
  try {
    // Test if server is reachable
    console.log('\n1. Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      timeout: 5000
    }).catch(err => {
      console.error('Server not reachable:', err.message);
      return null;
    });
    
    if (!healthResponse) {
      console.error('\nERROR: Server is not running at', baseUrl);
      console.log('Please start the development server with: npm run dev:3001');
      return;
    }
    
    console.log('Server is reachable!');
    
    // Test the payment API endpoint
    console.log('\n2. Testing payment API endpoint...');
    const apiUrl = `${baseUrl}/api/payment/create-checkout`;
    
    // Test without auth first
    console.log('\nTesting without authentication...');
    const noAuthResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: 'pro',
        successUrl: `${baseUrl}/payment/success`,
        cancelUrl: `${baseUrl}/payment/cancel`
      })
    });
    
    console.log('Response status:', noAuthResponse.status);
    const noAuthData = await noAuthResponse.json();
    console.log('Response:', noAuthData);
    
    // Test OPTIONS request (for CORS)
    console.log('\n3. Testing CORS preflight...');
    const optionsResponse = await fetch(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': baseUrl,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('OPTIONS response status:', optionsResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers')
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApiEndpoint();