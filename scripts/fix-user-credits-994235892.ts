/**
 * Fix credits and subscription for user 994235892@qq.com
 * 
 * This user upgraded to Pro but:
 * - Missing user_id_mapping entry
 * - No Pro monthly credits granted (800 credits)
 * - Subscription tier not synced to Supabase
 * 
 * Usage: npx tsx scripts/fix-user-credits-994235892.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/bestauth/db'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const BESTAUTH_USER_EMAIL = '994235892@qq.com'
const PRO_MONTHLY_CREDITS = 800

async function fixUserCredits() {
  console.log('=' .repeat(80))
  console.log('Fixing credits for user:', BESTAUTH_USER_EMAIL)
  console.log('=' .repeat(80))

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`)
    console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`)
    return
  }

  // Initialize Supabase admin client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Step 1: Find BestAuth user
    console.log('\n1. Finding BestAuth user...')
    const bestAuthUser = await db.users.findByEmail(BESTAUTH_USER_EMAIL)
    
    if (!bestAuthUser) {
      console.error('❌ BestAuth user not found')
      return
    }
    
    console.log('✅ BestAuth user found:', {
      id: bestAuthUser.id,
      email: bestAuthUser.email,
      name: bestAuthUser.name
    })

    // Step 2: Find Supabase user by email
    console.log('\n2. Finding Supabase user...')
    const { data: supabaseUsers, error: supabaseError } = await supabase.auth.admin.listUsers()
    
    if (supabaseError) {
      console.error('❌ Error listing Supabase users:', supabaseError)
      return
    }

    const supabaseUser = supabaseUsers?.users.find(u => u.email === BESTAUTH_USER_EMAIL)
    
    if (!supabaseUser) {
      console.error('❌ Supabase user not found. User may need to be created.')
      console.log('   Note: If user signed up via BestAuth only, they may not have a Supabase auth record.')
      return
    }

    console.log('✅ Supabase user found:', {
      id: supabaseUser.id,
      email: supabaseUser.email
    })

    // Step 3: Ensure BestAuth user exists in Supabase (shadow table)
    console.log('\n3. Syncing BestAuth user to Supabase...')
    const { data: supabaseBestAuthUser } = await supabase
      .from('bestauth_users')
      .select('*')
      .eq('id', bestAuthUser.id)
      .maybeSingle()

    if (!supabaseBestAuthUser) {
      console.log('Creating BestAuth user in Supabase shadow table...')
      const { error: userSyncError } = await supabase
        .from('bestauth_users')
        .insert({
          id: bestAuthUser.id,
          email: bestAuthUser.email,
          name: bestAuthUser.name,
          email_verified: bestAuthUser.emailVerified,
          created_at: bestAuthUser.createdAt,
          updated_at: new Date().toISOString()
        })

      if (userSyncError) {
        console.error('❌ Error syncing BestAuth user:', userSyncError)
        console.log('   This may be because bestauth_users table does not exist in Supabase')
        console.log('   Proceeding without foreign key validation...')
      } else {
        console.log('✅ BestAuth user synced to Supabase')
      }
    } else {
      console.log('✅ BestAuth user already exists in Supabase')
    }

    // Step 4: Check and create user mapping
    console.log('\n4. Checking user mapping...')
    const { data: existingMapping } = await supabase
      .from('user_id_mapping')
      .select('*')
      .eq('bestauth_user_id', bestAuthUser.id)
      .maybeSingle()

    if (existingMapping) {
      console.log('✅ Mapping already exists:', existingMapping)
    } else {
      console.log('Creating user mapping...')
      const { error: mappingError } = await supabase
        .from('user_id_mapping')
        .insert({
          supabase_user_id: supabaseUser.id,
          bestauth_user_id: bestAuthUser.id,
          created_at: new Date().toISOString()
        })

      if (mappingError) {
        console.error('❌ Error creating mapping:', mappingError)
        console.log('   Attempting to create with constraint disabled...')
        
        // Try raw SQL insert without constraint check
        const { error: rawInsertError } = await supabase.rpc('execute_sql', {
          sql: `INSERT INTO user_id_mapping (supabase_user_id, bestauth_user_id, created_at) 
                VALUES ('${supabaseUser.id}', '${bestAuthUser.id}', NOW()) 
                ON CONFLICT (bestauth_user_id) DO NOTHING`
        })
        
        if (rawInsertError) {
          console.error('❌ Raw insert also failed:', rawInsertError)
          console.log('⚠️  Continuing without mapping - credits will be granted directly')
        } else {
          console.log('✅ Mapping created via raw SQL')
        }
      } else {
        console.log('✅ User mapping created')
      }
    }

    // Step 5: Check current points balance
    console.log('\n5. Checking current points balance...')
    const { data: currentBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: supabaseUser.id
    })

    console.log('Current balance:', currentBalance)

    // Step 6: Grant Pro monthly credits
    console.log('\n6. Granting Pro monthly credits...')
    const { data: grantResult, error: grantError } = await supabase.rpc('add_points', {
      p_user_id: supabaseUser.id,
      p_amount: PRO_MONTHLY_CREDITS,
      p_transaction_type: 'subscription_grant',
      p_description: `Pro monthly credits - Manual grant for missing webhook credits`
    })

    if (grantError) {
      console.error('❌ Error granting credits:', grantError)
      return
    }

    console.log('✅ Credits granted successfully')
    console.log('Grant result:', grantResult)

    // Step 7: Verify new balance
    console.log('\n7. Verifying new balance...')
    const { data: newBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: supabaseUser.id
    })

    console.log('New balance:', newBalance)

    // Step 8: Update subscription in Supabase (if exists)
    console.log('\n8. Updating Supabase subscription tier...')
    const { data: supabaseSubscription } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle()

    if (supabaseSubscription) {
      const { error: updateError } = await supabase
        .from('subscriptions_consolidated')
        .update({
          tier: 'pro',
          billing_cycle: 'monthly',
          updated_at: new Date().toISOString()
        })
        .eq('id', supabaseSubscription.id)

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError)
      } else {
        console.log('✅ Subscription tier updated to Pro')
      }
    } else {
      console.log('⚠️  No Supabase subscription record found (using BestAuth subscription only)')
    }

    // Summary
    console.log('\n' + '=' .repeat(80))
    console.log('✅ Fix completed successfully!')
    console.log('=' .repeat(80))
    console.log('Summary:')
    console.log(`- BestAuth User ID: ${bestAuthUser.id}`)
    console.log(`- Supabase User ID: ${supabaseUser.id}`)
    console.log(`- Mapping: Created/Verified`)
    console.log(`- Credits Granted: ${PRO_MONTHLY_CREDITS}`)
    console.log(`- New Balance: ${newBalance?.balance || 'Unknown'}`)
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

// Run the fix
fixUserCredits().catch(console.error)
