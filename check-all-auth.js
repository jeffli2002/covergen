// Check all authentication methods in browser console

async function checkAllAuth() {
  console.log('🔍 Checking ALL authentication methods...\n');
  
  // 1. Check cookies
  console.log('=== COOKIES ===');
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log('All cookies:', Object.keys(cookies));
  console.log('BestAuth session:', cookies['bestauth_session'] ? '✅ FOUND' : '❌ NOT FOUND');
  
  // Check for Supabase cookies
  const supabaseCookies = Object.keys(cookies).filter(k => k.includes('sb-') || k.includes('supabase'));
  console.log('Supabase cookies:', supabaseCookies.length > 0 ? supabaseCookies : '❌ NOT FOUND');
  
  // 2. Check localStorage
  console.log('\n=== LOCAL STORAGE ===');
  const localStorageKeys = Object.keys(localStorage);
  console.log('All keys:', localStorageKeys);
  
  const supabaseKeys = localStorageKeys.filter(k => k.includes('supabase') || k.includes('sb-'));
  if (supabaseKeys.length > 0) {
    console.log('✅ Supabase auth found in localStorage:');
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        const parsed = JSON.parse(value);
        console.log(`  ${key}:`, {
          hasAccessToken: !!parsed?.access_token,
          hasUser: !!parsed?.user,
          userEmail: parsed?.user?.email
        });
      } catch (e) {
        console.log(`  ${key}: (not JSON)`);
      }
    });
  } else {
    console.log('❌ No Supabase auth in localStorage');
  }
  
  // 3. Check sessionStorage
  console.log('\n=== SESSION STORAGE ===');
  const sessionKeys = Object.keys(sessionStorage);
  console.log('All keys:', sessionKeys);
  
  // 4. Try to call BestAuth API
  console.log('\n=== BESTAUTH API CHECK ===');
  try {
    const response = await fetch('/api/bestauth/session', {
      credentials: 'include'
    });
    const data = await response.json();
    console.log('BestAuth session API:', response.status, data);
  } catch (e) {
    console.log('BestAuth session API error:', e.message);
  }
  
  // 5. Try to call Supabase session check
  console.log('\n=== SUPABASE SESSION CHECK ===');
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Supabase session:', data);
    } else {
      console.log('Supabase session:', response.status, response.statusText);
    }
  } catch (e) {
    console.log('Supabase session error:', e.message);
  }
  
  // 6. Check subscription status endpoint
  console.log('\n=== SUBSCRIPTION STATUS CHECK ===');
  try {
    const response = await fetch('/api/bestauth/subscription/status', {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subscription status:', data);
    } else {
      console.log('❌ Subscription status:', response.status, await response.text());
    }
  } catch (e) {
    console.log('❌ Subscription status error:', e.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('You are authenticated via:', 
    cookies['bestauth_session'] ? '🟢 BestAuth (cookies)' :
    supabaseKeys.length > 0 ? '🟡 Supabase (localStorage)' :
    '🔴 NOT AUTHENTICATED'
  );
}

checkAllAuth();
