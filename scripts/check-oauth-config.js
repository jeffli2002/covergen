#!/usr/bin/env node

console.log('🔍 Checking OAuth Configuration...\n');

// Check environment variables
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log('----------------------');
console.log(`NEXT_PUBLIC_SITE_URL: ${siteUrl || '❌ NOT SET (will use window.location.origin)'}`);
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ NOT SET'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ NOT SET'}`);

console.log('\nExpected OAuth Redirect URL:');
console.log('---------------------------');
if (siteUrl) {
  console.log(`${siteUrl}/auth/callback`);
} else {
  console.log('Will use: [current-domain]/auth/callback');
}

console.log('\n📋 Checklist for OAuth Setup:');
console.log('-----------------------------');
console.log('1. ✓ Set NEXT_PUBLIC_SITE_URL in .env.local');
console.log('2. ✓ Add redirect URLs to Supabase dashboard');
console.log('3. ✓ Add redirect URLs to Google OAuth console');
console.log('4. ✓ Clear browser cookies and cache');
console.log('5. ✓ Restart Next.js dev server');

console.log('\n💡 For local development:');
console.log('------------------------');
console.log('NEXT_PUBLIC_SITE_URL=http://localhost:3001');

console.log('\n🚀 For production:');
console.log('-----------------');
console.log('NEXT_PUBLIC_SITE_URL=https://covergen.pro');