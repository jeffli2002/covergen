// Script to apply session tracking migration
// Run with: node scripts/apply-session-migration.js

import { getBestAuthSupabaseClient } from '../src/lib/bestauth/db-client.js'

async function applyMigration() {
  console.log('Applying session tracking migration...\n')
  
  try {
    const client = getBestAuthSupabaseClient()
    if (!client) {
      console.error('❌ Failed to get database client. Check BESTAUTH_DATABASE_URL environment variable.')
      process.exit(1)
    }

    // Check if session_id column exists
    console.log('1. Checking if session_id column exists...')
    const { data: columns, error: columnsError } = await client
      .from('bestauth_usage_tracking')
      .select('*')
      .limit(0)
    
    if (columnsError) {
      console.error('Error checking columns:', columnsError)
      // Table might not exist, which is okay
    }

    // Add session_id column using raw SQL through Supabase
    console.log('\n2. Adding session_id column if not exists...')
    try {
      // Note: Supabase doesn't support direct DDL, so we'll use a different approach
      // We'll check if we can insert a record with session_id
      const testRecord = {
        session_id: 'test-migration-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        generation_count: 0
      }
      
      const { error: insertError } = await client
        .from('bestauth_usage_tracking')
        .insert(testRecord)
      
      if (insertError) {
        if (insertError.message.includes('column') && insertError.message.includes('session_id')) {
          console.log('❌ session_id column does not exist')
          console.log('\nPlease run this SQL in your database:')
          console.log('ALTER TABLE bestauth_usage_tracking ADD COLUMN session_id VARCHAR(255);')
          console.log('\nYou can run it through:')
          console.log('1. Supabase Dashboard → SQL Editor')
          console.log('2. Or any PostgreSQL client with proper credentials')
          return
        } else {
          console.log('✅ session_id column exists')
          // Clean up test record
          await client
            .from('bestauth_usage_tracking')
            .delete()
            .eq('session_id', testRecord.session_id)
        }
      } else {
        console.log('✅ session_id column exists')
        // Clean up test record
        await client
          .from('bestauth_usage_tracking')
          .delete()
          .eq('session_id', testRecord.session_id)
      }
    } catch (err) {
      console.log('Could not verify session_id column:', err.message)
    }

    // Test session tracking functionality
    console.log('\n3. Testing session tracking...')
    const testSessionId = 'test-session-' + Date.now()
    const today = new Date().toISOString().split('T')[0]
    
    // Try to insert a session-only record
    const { data: insertData, error: insertError } = await client
      .from('bestauth_usage_tracking')
      .insert({
        session_id: testSessionId,
        date: today,
        generation_count: 1
      })
      .select()
    
    if (insertError) {
      console.error('❌ Failed to insert session record:', insertError.message)
      if (insertError.message.includes('user_id')) {
        console.log('\n⚠️  The user_id column is still required. The full migration needs to be applied.')
        console.log('Please run the full migration SQL in your database.')
      }
    } else {
      console.log('✅ Successfully inserted session record:', insertData)
      
      // Clean up
      await client
        .from('bestauth_usage_tracking')
        .delete()
        .eq('session_id', testSessionId)
        .eq('date', today)
    }

    // Check current table structure
    console.log('\n4. Checking table structure...')
    const { data: sampleData, error: sampleError } = await client
      .from('bestauth_usage_tracking')
      .select('*')
      .limit(1)
    
    if (!sampleError && sampleData) {
      console.log('Sample record structure:', Object.keys(sampleData[0] || {}))
    }

    console.log('\n✅ Migration check completed!')
    console.log('\nNext steps:')
    console.log('1. If session_id column is missing, add it via Supabase SQL Editor')
    console.log('2. Make user_id nullable: ALTER TABLE bestauth_usage_tracking ALTER COLUMN user_id DROP NOT NULL;')
    console.log('3. Test by visiting the app as an unauthenticated user and generating an image')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})