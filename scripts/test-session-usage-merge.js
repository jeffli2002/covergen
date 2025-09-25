#!/usr/bin/env node

/**
 * Test script to verify session usage merging on signup
 * 
 * This script simulates:
 * 1. An unauthenticated user making generations with a session ID
 * 2. The same user signing up
 * 3. Verifying their session usage is merged to their user account
 */

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testpassword123';

// Simulate a session ID
const SESSION_ID = uuidv4();

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `covergen_session_id=${SESSION_ID}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { response, data };
}

async function testSessionUsageMerge() {
  console.log('🧪 Testing Session Usage Merge on Signup');
  console.log('Session ID:', SESSION_ID);
  console.log('Test Email:', TEST_EMAIL);
  console.log('');

  try {
    // Step 1: Check initial usage as unauthenticated user
    console.log('1️⃣ Checking initial usage for session...');
    const { data: initialUsage } = await makeRequest('/api/usage/status');
    console.log('Initial usage:', {
      daily_usage: initialUsage.daily_usage,
      daily_limit: initialUsage.daily_limit,
      subscription_tier: initialUsage.subscription_tier,
    });
    console.log('');

    // Step 2: Make a generation as unauthenticated user
    console.log('2️⃣ Making generation as unauthenticated user...');
    const { response: genResponse, data: genData } = await makeRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Test generation for session usage merge',
        mode: 'text',
      }),
    });

    if (genResponse.status === 429) {
      console.log('⚠️  Daily limit already reached for this session');
      console.log('Response:', genData);
    } else if (genResponse.ok) {
      console.log('✅ Generation successful');
    } else {
      console.log('❌ Generation failed:', genData);
    }
    console.log('');

    // Step 3: Check usage after generation
    console.log('3️⃣ Checking usage after generation...');
    const { data: afterGenUsage } = await makeRequest('/api/usage/status');
    console.log('Usage after generation:', {
      daily_usage: afterGenUsage.daily_usage,
      daily_limit: afterGenUsage.daily_limit,
    });
    console.log('');

    // Step 4: Sign up with the same session
    console.log('4️⃣ Signing up with the same session...');
    const { response: signupResponse, data: signupData } = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'Test User',
      }),
    });

    if (!signupResponse.ok) {
      console.log('❌ Signup failed:', signupData);
      return;
    }

    console.log('✅ Signup successful');
    console.log('User ID:', signupData.user.id);
    console.log('');

    // Step 5: Check usage after signup (should include session usage)
    console.log('5️⃣ Checking usage after signup (should include merged session usage)...');
    const authHeaders = {
      'Cookie': `covergen_session_id=${SESSION_ID}; bestauth_session=${signupData.session.token}`,
    };
    
    const { data: afterSignupUsage } = await makeRequest('/api/usage/status', {
      headers: authHeaders,
    });
    
    console.log('Usage after signup:', {
      daily_usage: afterSignupUsage.daily_usage,
      daily_limit: afterSignupUsage.daily_limit,
      subscription_tier: afterSignupUsage.subscription_tier,
    });
    console.log('');

    // Step 6: Verify the merge
    console.log('6️⃣ Verification Results:');
    if (afterSignupUsage.daily_usage >= afterGenUsage.daily_usage) {
      console.log('✅ Session usage successfully merged!');
      console.log(`   Session had ${afterGenUsage.daily_usage} generations`);
      console.log(`   User now has ${afterSignupUsage.daily_usage} generations`);
    } else {
      console.log('❌ Session usage NOT merged');
      console.log(`   Session had ${afterGenUsage.daily_usage} generations`);
      console.log(`   User only has ${afterSignupUsage.daily_usage} generations`);
    }

    // Step 7: Try to make another generation as authenticated user
    console.log('');
    console.log('7️⃣ Testing generation as authenticated user...');
    const { response: authGenResponse, data: authGenData } = await makeRequest('/api/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        prompt: 'Test generation as authenticated user',
        mode: 'text',
      }),
    });

    if (authGenResponse.status === 429) {
      console.log('✅ Correctly blocked - daily limit reached (session usage was merged)');
      console.log('Response:', authGenData);
    } else if (authGenResponse.ok) {
      console.log('⚠️  Generation allowed - this might mean session usage was NOT merged');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSessionUsageMerge().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});