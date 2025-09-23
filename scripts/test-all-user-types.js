// Comprehensive test script for all user types
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testAllUserTypes() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const today = new Date().toISOString().split('T')[0];
  
  console.log('Testing usage tracking for all user types...\n');
  console.log('Today\'s date:', today);
  console.log('=' .repeat(60));
  
  // Test users - you'll need to update these with actual test user IDs
  const testUsers = {
    anonymous: { 
      session_id: 'test-anon-' + Date.now(), 
      user_id: null,
      type: 'Anonymous (Free Tier)',
      daily_limit: 3
    },
    proTrial: { 
      session_id: 'test-pro-trial-' + Date.now(), 
      user_id: 'YOUR_PRO_TRIAL_USER_ID', // Replace with actual pro trial user ID
      type: 'Pro Trial User',
      daily_limit: 4
    },
    proPlusTrial: { 
      session_id: 'test-proplus-trial-' + Date.now(), 
      user_id: 'YOUR_PROPLUS_TRIAL_USER_ID', // Replace with actual pro+ trial user ID
      type: 'Pro+ Trial User',
      daily_limit: 6
    },
    proPaid: { 
      session_id: 'test-pro-paid-' + Date.now(), 
      user_id: 'YOUR_PRO_PAID_USER_ID', // Replace with actual paid pro user ID
      type: 'Paid Pro User',
      monthly_limit: 120
    },
    proPlusPaid: { 
      session_id: 'test-proplus-paid-' + Date.now(), 
      user_id: 'YOUR_PROPLUS_PAID_USER_ID', // Replace with actual paid pro+ user ID
      type: 'Paid Pro+ User',
      monthly_limit: 300
    }
  };
  
  for (const [key, user] of Object.entries(testUsers)) {
    console.log(`\nTesting ${user.type}:`);
    console.log('-'.repeat(40));
    
    try {
      // 1. Check current usage
      console.log('1. Checking current usage...');
      let query = supabase
        .from('bestauth_usage_tracking')
        .select('*')
        .eq('date', today);
      
      if (user.user_id) {
        query = query.eq('user_id', user.user_id);
      } else {
        query = query.eq('session_id', user.session_id);
      }
      
      const { data: currentData, error: currentError } = await query;
      
      if (currentError) {
        console.error('   Error:', currentError.message);
      } else {
        const currentUsage = currentData?.[0]?.generation_count || 0;
        const limit = user.daily_limit || user.monthly_limit;
        const limitType = user.daily_limit ? 'daily' : 'monthly';
        console.log(`   Current usage: ${currentUsage}/${limit} (${limitType})`);
      }
      
      // 2. Simulate usage increments
      console.log('\n2. Simulating usage increments...');
      
      for (let i = 1; i <= 5; i++) {
        // Insert or update usage
        const { data: existingData } = await query;
        
        if (existingData && existingData.length > 0) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('bestauth_usage_tracking')
            .update({ generation_count: existingData[0].generation_count + 1 })
            .eq('id', existingData[0].id);
          
          if (updateError) {
            console.error(`   Increment ${i} failed:`, updateError.message);
          } else {
            const newCount = existingData[0].generation_count + 1;
            const limit = user.daily_limit || user.monthly_limit;
            const limitReached = newCount >= limit;
            console.log(`   Increment ${i}: ${newCount}/${limit}${limitReached ? ' (LIMIT REACHED!)' : ''}`);
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('bestauth_usage_tracking')
            .insert({
              user_id: user.user_id,
              session_id: user.session_id,
              date: today,
              generation_count: 1
            });
          
          if (insertError) {
            console.error(`   Increment ${i} failed:`, insertError.message);
          } else {
            const limit = user.daily_limit || user.monthly_limit;
            console.log(`   Increment ${i}: 1/${limit}`);
          }
        }
      }
      
      // 3. Check final usage
      console.log('\n3. Checking final usage...');
      const { data: finalData, error: finalError } = await query;
      
      if (finalError) {
        console.error('   Error:', finalError.message);
      } else {
        const finalUsage = finalData?.[0]?.generation_count || 0;
        const limit = user.daily_limit || user.monthly_limit;
        const limitType = user.daily_limit ? 'Daily' : 'Monthly';
        console.log(`   Final usage: ${finalUsage}/${limit}`);
        
        if (finalUsage >= limit) {
          console.log(`   ⚠️  ${limitType} limit reached! Upgrade popup should appear.`);
        }
      }
      
      // 4. Cleanup test data
      console.log('\n4. Cleaning up test data...');
      let cleanupQuery = supabase
        .from('bestauth_usage_tracking')
        .delete()
        .eq('date', today);
      
      if (user.user_id) {
        cleanupQuery = cleanupQuery.eq('user_id', user.user_id);
      } else {
        cleanupQuery = cleanupQuery.eq('session_id', user.session_id);
      }
      
      const { error: cleanupError } = await cleanupQuery;
      if (cleanupError) {
        console.error('   Cleanup failed:', cleanupError.message);
      } else {
        console.log('   ✅ Test data cleaned up');
      }
      
    } catch (error) {
      console.error(`\n❌ Error testing ${user.type}:`, error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('UI Testing Instructions:');
  console.log('1. Check the header - it should show usage counter with tier badge');
  console.log('2. For anonymous users: Should show "X/3 today" (Free badge)');
  console.log('3. For Pro trial users: Should show "X/4 today" (Pro Trial badge)');
  console.log('4. For Pro+ trial users: Should show "X/6 today" (Pro+ Trial badge)');
  console.log('5. For paid Pro users: Should show "X/120 this month" (Pro badge)');
  console.log('6. For paid Pro+ users: Should show "X/300 this month" (Pro+ badge)');
  console.log('7. When limit is reached, an upgrade popup should appear');
  console.log('8. The header should update in real-time after each generation');
  
  console.log('\nNOTE: Replace the following with actual user IDs from bestauth_users table:');
  console.log('- YOUR_PRO_TRIAL_USER_ID');
  console.log('- YOUR_PROPLUS_TRIAL_USER_ID');
  console.log('- YOUR_PRO_PAID_USER_ID');
  console.log('- YOUR_PROPLUS_PAID_USER_ID');
}

testAllUserTypes();