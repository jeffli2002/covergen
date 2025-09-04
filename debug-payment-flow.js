// Payment Flow Debugging Script
// Run this in the browser console to debug payment flow

console.log('=== Payment Flow Debug Script ===');

// Override fetch to log API calls
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, options] = args;
  
  // Log payment-related API calls
  if (url.includes('/api/payment') || url.includes('creem')) {
    console.group(`🔵 API Call: ${options?.method || 'GET'} ${url}`);
    console.log('Request Headers:', options?.headers);
    console.log('Request Body:', options?.body);
    console.groupEnd();
  }
  
  // Call original fetch
  const response = await originalFetch.apply(this, args);
  
  // Log payment-related responses
  if (url.includes('/api/payment') || url.includes('creem')) {
    const clonedResponse = response.clone();
    const responseData = await clonedResponse.json().catch(() => 'Non-JSON response');
    
    console.group(`${response.ok ? '✅' : '❌'} API Response: ${url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Response Data:', responseData);
    console.groupEnd();
  }
  
  return response;
};

// Override window.location to log redirects
const originalLocation = Object.getOwnPropertyDescriptor(window, 'location');
Object.defineProperty(window, 'location', {
  ...originalLocation,
  set: function(value) {
    console.group('🔴 Redirect Detected');
    console.log('Redirecting to:', value);
    console.log('Call Stack:', new Error().stack);
    console.groupEnd();
    
    // Allow the redirect
    originalLocation.set.call(window, value);
  }
});

// Log current environment
console.group('📋 Environment Check');
console.log('Test Mode:', process.env.NEXT_PUBLIC_CREEM_TEST_MODE);
console.log('Dev Mode:', process.env.NEXT_PUBLIC_DEV_MODE);
console.log('Bypass Usage:', process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT);
console.log('Creem Public Key:', process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY);
console.groupEnd();

// Add click listener to payment buttons
document.addEventListener('click', (e) => {
  const target = e.target;
  if (target.tagName === 'BUTTON' && (
    target.textContent.includes('Get Started') || 
    target.textContent.includes('Start Pro') ||
    target.textContent.includes('Go Pro')
  )) {
    console.group('🎯 Payment Button Clicked');
    console.log('Button Text:', target.textContent);
    console.log('Button Classes:', target.className);
    console.log('Parent Card:', target.closest('[class*="Card"]'));
    console.groupEnd();
  }
}, true);

console.log('✅ Debug script loaded. Click a payment button to see the flow.');
console.log('💡 Check Network tab for actual API calls');
console.log('💡 Check Console for debug logs');

// Helper function to manually test payment flow
window.testPaymentFlow = async (plan = 'pro') => {
  console.log('🧪 Manually testing payment flow for plan:', plan);
  
  try {
    const response = await fetch('/api/payment/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')?.access_token || 'NO_TOKEN'}`
      },
      body: JSON.stringify({
        planId: plan,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      })
    });
    
    const data = await response.json();
    console.log('Create Checkout Response:', data);
    
    if (data.url) {
      console.log('Would redirect to:', data.url);
      console.log('To proceed, run: window.location.href = "' + data.url + '"');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

console.log('💡 Run window.testPaymentFlow("pro") to manually test');