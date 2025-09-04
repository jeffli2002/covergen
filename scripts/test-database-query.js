const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testUserUsageQuery() {
  console.log('Testing user_usage query...\n');
  
  // Test auth first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }
  
  if (!user) {
    console.log('No authenticated user. Please login first.');
    return;
  }
  
  console.log('Authenticated user ID:', user.id);
  
  const monthKey = new Date().toISOString().slice(0, 7);
  console.log('Month key:', monthKey);
  
  // Test the exact query used in authService
  console.log('\nRunning query...');
  const { data, error } = await supabase
    .from('user_usage')
    .select('usage_count')
    .eq('user_id', user.id)
    .eq('month_key', monthKey)
    .single();
    
  console.log('\nQuery result:');
  console.log('Data:', data);
  console.log('Error:', error);
  
  if (error) {
    console.log('\nError details:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('Details:', error.details);
    console.log('Hint:', error.hint);
    
    if (error.code === 'PGRST116') {
      console.log('\nPGRST116 means no rows found. This is expected if the user has no usage record for this month.');
    }
  }
  
  // Also check if any records exist for this user
  console.log('\n\nChecking all user_usage records for this user...');
  const { data: allRecords, error: allError } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', user.id);
    
  if (allError) {
    console.error('Error fetching all records:', allError);
  } else {
    console.log('All user_usage records:', allRecords);
  }
}

testUserUsageQuery().catch(console.error);