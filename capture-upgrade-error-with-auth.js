// Run this in browser console while logged in as a Pro user
// This will capture the full 500 error response WITH proper authentication

async function captureUpgradeErrorWithAuth() {
  console.log('🔍 Testing upgrade endpoint with authentication...\n');
  
  // First, check if we have a BestAuth session
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log('🍪 Available cookies:', Object.keys(cookies));
  
  const sessionToken = cookies['bestauth_session'];
  
  if (!sessionToken) {
    console.error('❌ No bestauth_session cookie found!');
    console.log('Available cookies:', cookies);
    return;
  }
  
  console.log('✅ Found session token:', sessionToken.substring(0, 20) + '...\n');
  
  try {
    const response = await fetch('/api/bestauth/subscription/upgrade', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`
      },
      credentials: 'include',
      body: JSON.stringify({ targetTier: 'pro_plus' })
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Status Text:', response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    console.log('\n📦 Response Body:');
    console.log(JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('\n❌ ERROR DETAILS:');
      console.error('Message:', data.error || data.message);
      console.error('Details:', data.details);
      console.error('Debug Info:', data.debugInfo);
      
      // Check for specific error patterns
      if (data.debugInfo) {
        console.error('\n🔍 DEBUG INFO:');
        console.error('Type:', data.debugInfo.type);
        console.error('Code:', data.debugInfo.code);
        console.error('Stack:', data.debugInfo.stack);
        console.error('Message:', data.debugInfo.message);
      }
    } else {
      console.log('\n✅ SUCCESS!');
    }
    
    return data;
    
  } catch (error) {
    console.error('\n💥 FETCH ERROR:', error);
    throw error;
  }
}

// Auto-run and return promise
captureUpgradeErrorWithAuth();
