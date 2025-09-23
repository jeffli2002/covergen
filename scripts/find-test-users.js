// Script to find test users in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function findTestUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Finding test users in database...\n');
  
  try {
    // Find users with subscriptions
    console.log('1. Looking for users with subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('bestauth_subscriptions')
      .select('user_id, tier, is_trialing, trial_ends_at, status')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (subError) {
      console.error('Error fetching subscriptions:', subError);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log('\nFound subscriptions:');
      subscriptions.forEach((sub, index) => {
        console.log(`\n${index + 1}. User ID: ${sub.user_id}`);
        console.log(`   Tier: ${sub.tier}`);
        console.log(`   Is Trial: ${sub.is_trialing}`);
        console.log(`   Status: ${sub.status}`);
        if (sub.trial_ends_at) {
          console.log(`   Trial ends: ${new Date(sub.trial_ends_at).toLocaleDateString()}`);
        }
      });
    } else {
      console.log('No subscriptions found');
    }
    
    // Find users from bestauth_users table
    console.log('\n\n2. Looking for users in bestauth_users table...');
    const { data: users, error: userError } = await supabase
      .from('bestauth_users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (userError) {
      console.error('Error fetching users:', userError);
    } else if (users && users.length > 0) {
      console.log('\nFound users:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    } else {
      console.log('No users found in bestauth_users');
    }
    
    // Check today's usage tracking
    console.log('\n\n3. Checking today\'s usage tracking...');
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabase
      .from('bestauth_usage_tracking')
      .select('user_id, session_id, generation_count')
      .eq('date', today)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (usageError) {
      console.error('Error fetching usage:', usageError);
    } else if (usage && usage.length > 0) {
      console.log('\nToday\'s usage:');
      usage.forEach((u, index) => {
        console.log(`\n${index + 1}. ${u.user_id ? 'User ID: ' + u.user_id : 'Session ID: ' + u.session_id}`);
        console.log(`   Generations: ${u.generation_count}`);
      });
    } else {
      console.log('No usage tracked today');
    }
    
    console.log('\n\nTo use these IDs in test scripts:');
    console.log('1. Copy a trial user ID and paid user ID');
    console.log('2. Update test-all-user-types.js with these IDs');
    console.log('3. Run: node scripts/test-all-user-types.js');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findTestUsers();