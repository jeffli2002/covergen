#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserUsageTable() {
  console.log('Checking user_usage table structure...\n')
  
  try {
    // Try to query the user_usage table
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying user_usage table:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      
      if (error.message.includes('does not exist')) {
        console.error('\nThe user_usage table or usage_count column does not exist.')
        console.error('\nTo fix this issue:')
        console.error('1. Go to your Supabase dashboard')
        console.error('2. Navigate to the SQL Editor')
        console.error('3. Copy and run the migration from: supabase/migrations/20250903_add_usage_tracking.sql')
        console.error('\nOr if you have psql installed, run:')
        console.error('psql $SUPABASE_DB_URL < supabase/migrations/20250903_add_usage_tracking.sql')
      }
    } else {
      console.log('✅ user_usage table exists and is accessible')
      
      // Check if we got any data
      if (data && data.length > 0) {
        console.log('Sample row:', data[0])
        console.log('Columns:', Object.keys(data[0]))
      } else {
        console.log('Table is empty but structure is correct')
      }
    }
    
    // Also check anonymous_usage table
    console.log('\nChecking anonymous_usage table...')
    const { error: anonError } = await supabase
      .from('anonymous_usage')
      .select('*')
      .limit(1)
    
    if (anonError) {
      console.error('❌ Error querying anonymous_usage table:', anonError.message)
    } else {
      console.log('✅ anonymous_usage table exists and is accessible')
    }
    
    // Check generation_logs table
    console.log('\nChecking generation_logs table...')
    const { error: logsError } = await supabase
      .from('generation_logs')
      .select('*')
      .limit(1)
    
    if (logsError) {
      console.error('❌ Error querying generation_logs table:', logsError.message)
    } else {
      console.log('✅ generation_logs table exists and is accessible')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Test getUserUsageToday functionality
async function testGetUserUsage() {
  console.log('\n\nTesting getUserUsageToday functionality...\n')
  
  // Get a test user ID from your auth.users table
  // For now, we'll use the user ID from the error log
  const testUserId = '4d1c8dec-3f72-4ac9-8c24-95ae375dbf1a'
  const monthKey = new Date().toISOString().slice(0, 7) // YYYY-MM format
  
  console.log('Testing with:')
  console.log('- User ID:', testUserId)
  console.log('- Month key:', monthKey)
  
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .select('usage_count')
      .eq('user_id', testUserId)
      .eq('month_key', monthKey)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Query failed:', error.message)
      console.error('Error details:', error)
    } else if (data) {
      console.log('✅ Query successful!')
      console.log('Usage count:', data.usage_count)
    } else {
      console.log('✅ Query successful but no data found (user has not used the service this month)')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

async function main() {
  console.log('=== Supabase Usage Tables Diagnostic Tool ===\n')
  console.log('Supabase URL:', supabaseUrl)
  console.log('')
  
  await checkUserUsageTable()
  await testGetUserUsage()
  
  console.log('\n=== Diagnostic Complete ===')
}

main().catch(console.error)