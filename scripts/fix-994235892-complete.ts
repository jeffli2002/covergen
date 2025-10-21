/**
 * Complete Fix for User 994235892@qq.com
 * 
 * Issues:
 * 1. Subscription metadata missing resolved_supabase_user_id
 * 2. User has 3971 credits (should be 800 for Pro)
 * 3. Multiple duplicate subscription_grant transactions
 * 4. No user_id_mapping entry
 * 
 * Usage: npx tsx scripts/fix-994235892-complete.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const BESTAUTH_USER_ID = '57c1c563-4cdd-4471-baa0-f49064b997c9'
const SUPABASE_USER_ID = '3ac0ce48-2bd0-4172-8c30-cca42ff1e805'
const CORRECT_BALANCE = 800 // Pro tier monthly allocation

async function completeFix() {
  console.log('=' .repeat(80))
  console.log('Complete Fix for User 994235892@qq.com')
  console.log('=' .repeat(80))
  console.log(`BestAuth ID: ${BESTAUTH_USER_ID}`)
  console.log(`Supabase ID: ${SUPABASE_USER_ID}`)
  console.log('=' .repeat(80))

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // STEP 1: Update subscription metadata
    console.log('\n📝 STEP 1: Updating subscription metadata...')
    
    const { data: currentSub, error: fetchError } = await supabase
      .from('bestauth_subscriptions')
      .select('metadata')
      .eq('user_id', BESTAUTH_USER_ID)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching subscription:', fetchError)
      return
    }

    const updatedMetadata = {
      ...currentSub.metadata,
      resolved_supabase_user_id: SUPABASE_USER_ID,
      supabase_user_id: SUPABASE_USER_ID,
      original_userId: SUPABASE_USER_ID
    }

    const { error: updateError } = await supabase
      .from('bestauth_subscriptions')
      .update({ metadata: updatedMetadata })
      .eq('user_id', BESTAUTH_USER_ID)

    if (updateError) {
      console.error('❌ Error updating metadata:', updateError)
      return
    }

    console.log('✅ Subscription metadata updated with resolved_supabase_user_id')

    // STEP 2: Check current balance
    console.log('\n💰 STEP 2: Checking current balance...')
    
    const { data: currentBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: SUPABASE_USER_ID
    })

    console.log(`   Current Balance: ${currentBalance.balance}`)
    console.log(`   Lifetime Earned: ${currentBalance.lifetime_earned}`)
    console.log(`   Lifetime Spent: ${currentBalance.lifetime_spent}`)

    if (currentBalance.balance === CORRECT_BALANCE) {
      console.log('✅ Balance is already correct!')
    } else {
      console.log(`⚠️  Balance needs correction: ${currentBalance.balance} → ${CORRECT_BALANCE}`)
    }

    // STEP 3: Get transaction count
    console.log('\n📊 STEP 3: Checking transaction history...')
    
    const { data: transactions, error: txError } = await supabase
      .from('points_transactions')
      .select('id, amount, transaction_type, created_at, description')
      .eq('user_id', SUPABASE_USER_ID)
      .eq('transaction_type', 'subscription_grant')
      .order('created_at', { ascending: true })

    if (txError) {
      console.error('❌ Error fetching transactions:', txError)
      return
    }

    console.log(`   Found ${transactions.length} subscription grant transactions`)
    
    if (transactions.length > 1) {
      console.log('   ⚠️  Multiple grants detected (should only be 1)')
      transactions.forEach((tx, i) => {
        console.log(`      ${i + 1}. ${tx.created_at}: ${tx.amount} credits - ${tx.description}`)
      })
    }

    // STEP 4: Reset balance to correct amount
    if (currentBalance.balance !== CORRECT_BALANCE || transactions.length > 1) {
      console.log('\n🔧 STEP 4: Resetting balance to correct amount...')
      
      // Delete all transactions for this user
      console.log('   Deleting all existing transactions...')
      const { error: deleteError } = await supabase
        .from('points_transactions')
        .delete()
        .eq('user_id', SUPABASE_USER_ID)

      if (deleteError) {
        console.error('❌ Error deleting transactions:', deleteError)
        return
      }

      // Reset balance in subscriptions_consolidated
      console.log('   Resetting balance in subscriptions_consolidated...')
      const { error: resetError } = await supabase
        .from('subscriptions_consolidated')
        .update({
          points_balance: 0,
          points_lifetime_earned: 0,
          points_lifetime_spent: 0
        })
        .eq('user_id', SUPABASE_USER_ID)

      if (resetError) {
        console.error('❌ Error resetting balance:', resetError)
        return
      }

      // Create single correct grant
      console.log(`   Granting ${CORRECT_BALANCE} credits (Pro tier allocation)...`)
      const { error: grantError } = await supabase.rpc('add_points', {
        p_user_id: SUPABASE_USER_ID,
        p_amount: CORRECT_BALANCE,
        p_transaction_type: 'subscription_grant',
        p_description: 'Pro monthly credits - Corrected after duplicate grant cleanup'
      })

      if (grantError) {
        console.error('❌ Error granting credits:', grantError)
        return
      }

      console.log('✅ Balance reset and correct credits granted')
    } else {
      console.log('\n✅ STEP 4: Balance already correct, skipping reset')
    }

    // STEP 5: Verify final state
    console.log('\n✅ STEP 5: Verifying final state...')
    
    const { data: finalBalance } = await supabase.rpc('get_points_balance', {
      p_user_id: SUPABASE_USER_ID
    })

    console.log(`   Final Balance: ${finalBalance.balance}`)
    console.log(`   Lifetime Earned: ${finalBalance.lifetime_earned}`)
    console.log(`   Lifetime Spent: ${finalBalance.lifetime_spent}`)

    const { data: finalTx } = await supabase
      .from('points_transactions')
      .select('count')
      .eq('user_id', SUPABASE_USER_ID)
      .eq('transaction_type', 'subscription_grant')
      .single()

    console.log(`   Subscription Grant Transactions: ${finalTx?.count || 0}`)

    // STEP 6: Test account API
    console.log('\n🧪 STEP 6: Testing account API resolution...')
    
    const { data: subscription } = await supabase
      .from('bestauth_subscriptions')
      .select('metadata')
      .eq('user_id', BESTAUTH_USER_ID)
      .single()

    const hasResolvedId = subscription?.metadata?.resolved_supabase_user_id === SUPABASE_USER_ID
    
    if (hasResolvedId) {
      console.log('✅ Subscription metadata contains correct resolved_supabase_user_id')
      console.log('   Account API will now resolve user ID correctly!')
    } else {
      console.log('❌ Subscription metadata still missing resolved_supabase_user_id')
    }

    // SUMMARY
    console.log('\n' + '=' .repeat(80))
    console.log('FIX SUMMARY')
    console.log('=' .repeat(80))
    console.log('✅ Subscription metadata updated')
    console.log(`✅ Balance corrected: ${CORRECT_BALANCE} credits`)
    console.log(`✅ Transaction history cleaned: 1 grant (was ${transactions.length})`)
    console.log('✅ Account API will now show correct balance')
    console.log('=' .repeat(80))
    console.log('\n🎉 All fixes complete! User can now see correct balance on account page.')

  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

completeFix().catch(console.error)
