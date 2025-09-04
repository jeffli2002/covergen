#!/usr/bin/env node

// Simple script to test if payment API endpoints are accessible
const https = require('https');
const http = require('http');

const endpoints = [
  '/api/payment/create-checkout',
  '/api/payment/create-portal',
  '/api/payment/cancel-subscription',
  '/api/payment/resume-subscription',
  '/api/webhooks/creem'
];

const port = process.env.PORT || 3001;
const isHttps = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https');

console.log('Testing payment API endpoints...\n');

endpoints.forEach(endpoint => {
  const options = {
    hostname: 'localhost',
    port: port,
    path: endpoint,
    method: 'OPTIONS',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const protocol = isHttps ? https : http;
  
  const req = protocol.request(options, (res) => {
    console.log(`✓ ${endpoint} - Status: ${res.statusCode}`);
    
    // Check CORS headers
    const corsHeaders = {
      'access-control-allow-origin': res.headers['access-control-allow-origin'],
      'access-control-allow-methods': res.headers['access-control-allow-methods'],
      'access-control-allow-headers': res.headers['access-control-allow-headers']
    };
    
    if (res.statusCode === 200) {
      console.log('  CORS Headers:', JSON.stringify(corsHeaders, null, 2));
    }
  });

  req.on('error', (error) => {
    console.error(`✗ ${endpoint} - Error: ${error.message}`);
  });

  req.end();
});

console.log('\nNote: This tests only if endpoints exist and respond to OPTIONS requests.');
console.log('For full testing, use proper authentication and request bodies.');