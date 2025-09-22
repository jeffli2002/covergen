// Quick test script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variable Check:');
console.log('===========================');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
console.log('BESTAUTH_JWT_SECRET:', process.env.BESTAUTH_JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.GOOGLE_CLIENT_ID) {
  console.log('\nGoogle Client ID preview:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}