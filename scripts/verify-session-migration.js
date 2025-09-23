// Simple script to verify session migration using direct Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function verifyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('Verifying session tracking migration...\n');
  
  try {
    // Test 1: Check table structure
    console.log('1. Checking table structure...');
    const { data: checkData, error: checkError } = await supabase
      .from('bestauth_usage_tracking')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking table:', checkError.message);
    } else {
      const columns = checkData[0] ? Object.keys(checkData[0]) : [];
      console.log('✅ Table columns:', columns.join(', '));
      console.log('   Has session_id:', columns.includes('session_id') ? 'YES' : 'NO');
    }
    
    // Test 2: Try inserting with session_id only (no user_id)
    console.log('\n2. Testing session-only insert...');
    const testSessionId = 'verify-' + Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    const { data: insertData, error: insertError } = await supabase
      .from('bestauth_usage_tracking')
      .insert({
        session_id: testSessionId,
        date: today,
        generation_count: 1
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      if (insertError.message.includes('user_id')) {
        console.error('   user_id is still required - migration may not be complete');
      }
    } else {
      console.log('✅ Session-only insert successful!');
      console.log('   Inserted:', insertData[0]);
      
      // Clean up
      await supabase
        .from('bestauth_usage_tracking')
        .delete()
        .eq('session_id', testSessionId)
        .eq('date', today);
    }
    
    // Test 3: Check if user_id is nullable
    console.log('\n3. Checking column nullability...');
    const { data: columnsData, error: columnsError } = await supabase.rpc('get_column_info', {
      table_name: 'bestauth_usage_tracking',
      column_name: 'user_id'
    }).single();
    
    if (columnsError) {
      // Try alternative query
      const { data: schemaData, error: schemaError } = await supabase
        .from('bestauth_usage_tracking')
        .insert({ date: today, generation_count: 0 })
        .select();
      
      if (schemaError && schemaError.message.includes('user_id')) {
        console.log('❌ user_id is NOT nullable');
      } else if (schemaData) {
        console.log('✅ user_id appears to be nullable');
        // Clean up if insert succeeded
        await supabase.from('bestauth_usage_tracking').delete().eq('date', today).eq('generation_count', 0);
      }
    } else {
      console.log('   user_id nullable:', columnsData?.is_nullable === 'YES' ? 'YES' : 'NO');
    }
    
    console.log('\n✅ Migration verification complete!');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
  }
}

verifyMigration();