/**
 * Find and Fix User Mapping for jefflee2002@gmail.com
 * 
 * This script:
 * 1. Finds the BestAuth user
 * 2. Finds or creates the Supabase user
 * 3. Creates the user_id_mapping
 * 4. Ensures points balance exists
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const TEST_USER_EMAIL = 'jefflee2002@gmail.com'

async function findAndFixUserMapping() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  console.log('\n=== Finding and Fixing User Mapping ===\n')
  
  // Step 1: Find BestAuth user
  console.log('Step 1: Finding BestAuth user...')
  const { data: bestAuthUser } = await supabase
    .from('bestauth_users')
    .select('*')
    .eq('email', TEST_USER_EMAIL)
    .single()
  
  if (!bestAuthUser) {
    console.error('❌ BestAuth user not found')
    return
  }
  
  console.log('✅ BestAuth user found:')
  console.log('   ID:', bestAuthUser.id)
  console.log('   Email:', bestAuthUser.email)
  console.log('   Name:', bestAuthUser.name)
  
  // Step 2: Find Supabase auth user
  console.log('\nStep 2: Finding Supabase auth user...')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Error listing Supabase users:', authError)
    return
  }
  
  const supabaseUser = authUsers?.users.find(u => u.email === TEST_USER_EMAIL)
  
  if (!supabaseUser) {
    console.log('❌ No Supabase auth user found for this email')
    console.log('   This user only exists in BestAuth')
    console.log('   We need to create a points_balance with the BestAuth user ID')
  } else {
    console.log('✅ Supabase auth user found:')
    console.log('   ID:', supabaseUser.id)
    console.log('   Email:', supabaseUser.email)
    console.log('   Created:', supabaseUser.created_at)
  }
  
  // Step 3: Check existing mapping
  console.log('\nStep 3: Checking existing user_id_mapping...')
  const { data: existingMapping } = await supabase
    .from('user_id_mapping')
    .select('*')
    .eq('bestauth_user_id', bestAuthUser.id)
    .maybeSingle()
  
  if (existingMapping) {
    console.log('✅ Mapping already exists:')
    console.log('   BestAuth ID:', existingMapping.bestauth_user_id)
    console.log('   Supabase ID:', existingMapping.supabase_user_id)
  } else {
    console.log('❌ No mapping found')
    
    if (supabaseUser) {
      console.log('\n   Creating user_id_mapping...')
      const { error: mappingError } = await supabase
        .from('user_id_mapping')
        .insert({
          bestauth_user_id: bestAuthUser.id,
          supabase_user_id: supabaseUser.id,
          sync_status: 'active',
          last_synced_at: new Date().toISOString()
        })
      
      if (mappingError) {
        console.error('   ❌ Error creating mapping:', mappingError)
      } else {
        console.log('   ✅ Mapping created successfully!')
      }
    }
  }
  
  // Step 4: Check points balance
  const pointsUserId = supabaseUser?.id || bestAuthUser.id
  console.log('\nStep 4: Checking points balance for user ID:', pointsUserId)
  
  const { data: balance, error: balanceError } = await supabase.rpc('get_points_balance', {
    p_user_id: pointsUserId
  })
  
  if (balanceError) {
    console.error('❌ Error getting balance:', balanceError.message)
    
    // Try to check if the points_balances record exists
    const { data: balanceRecord } = await supabase
      .from('points_balances')
      .select('*')
      .eq('user_id', pointsUserId)
      .maybeSingle()
    
    if (!balanceRecord) {
      console.log('❌ No points_balances record found')
      console.log('\n   Creating points_balances record...')
      
      const { error: insertError } = await supabase
        .from('points_balances')
        .insert({
          user_id: pointsUserId,
          balance: 830, // Current balance from bug report
          lifetime_earned: 830,
          lifetime_spent: 0,
          tier: 'free'
        })
      
      if (insertError) {
        console.error('   ❌ Error creating points balance:', insertError)
      } else {
        console.log('   ✅ Points balance created with 830 credits')
      }
    } else {
      console.log('✅ Points balance record exists:', balanceRecord)
    }
  } else {
    console.log('✅ Points balance found:')
    console.log('   Balance:', balance.balance)
    console.log('   Lifetime Earned:', balance.lifetime_earned)
    console.log('   Lifetime Spent:', balance.lifetime_spent)
  }
  
  // Step 5: Update subscription metadata
  console.log('\nStep 5: Updating subscription metadata...')
  const { data: subscription } = await supabase
    .from('bestauth_subscriptions')
    .select('*')
    .eq('user_id', bestAuthUser.id)
    .single()
  
  if (subscription) {
    const updatedMetadata = {
      ...subscription.metadata,
      resolved_supabase_user_id: pointsUserId,
      points_user_id: pointsUserId,
      mapping_verified_at: new Date().toISOString()
    }
    
    const { error: updateError } = await supabase
      .from('bestauth_subscriptions')
      .update({ metadata: updatedMetadata })
      .eq('user_id', bestAuthUser.id)
    
    if (updateError) {
      console.error('❌ Error updating subscription metadata:', updateError)
    } else {
      console.log('✅ Subscription metadata updated with resolved_supabase_user_id')
    }
  } else {
    console.log('❌ No subscription found for user')
  }
  
  console.log('\n=== Fix Complete ===')
  console.log('Next steps:')
  console.log('1. User generates an image')
  console.log('2. Check credits are deducted from balance')
  console.log('3. Monitor logs for "User ID resolution" messages')
}

findAndFixUserMapping().catch(console.error)
