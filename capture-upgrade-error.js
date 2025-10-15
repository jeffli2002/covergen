// Run this in browser console while logged in as a Pro user
// This will capture the full 500 error response

async function captureUpgradeError() {
  console.log('🔍 Testing upgrade endpoint...\n');
  
  try {
    const response = await fetch('/api/bestauth/subscription/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
captureUpgradeError();
