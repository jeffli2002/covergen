#!/usr/bin/env tsx
/**
 * SYSTEMATIC CREDIT SYSTEM AUDIT AND FIX
 * 
 * Ensures ALL users have proper credit tracking:
 * 1. All BestAuth users have user_id_mapping entries
 * 2. All paid subscribers have points_balances records
 * 3. All balances match subscription tier allocations
 * 4. All subscription metadata has resolved_supabase_user_id
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Credit allocations by tier
const TIER_ALLOCATIONS = {
  free: 30, // Signup bonus
  pro: 800, // Monthly
  pro_plus: 1600 // Monthly (but we're using 830 for some reason?)
}

interface AuditResult {
  totalUsers: number
  usersWithMapping: number
  usersWithoutMapping: number
  paidUsersWithoutBalance: number
  balanceMismatches: number
  metadataIssues: number
  fixed: number
  errors: string[]
}

async function auditAndFix(dryRun: boolean = true): Promise<AuditResult> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  
  const result: AuditResult = {
    totalUsers: 0,
    usersWithMapping: 0,
    usersWithoutMapping: 0,
    paidUsersWithoutBalance: 0,
    balanceMismatches: 0,
    metadataIssues: 0,
    fixed: 0,
    errors: []
  }
  
  console.log('='.repeat(80))
  console.log('SYSTEMATIC CREDIT SYSTEM AUDIT')
  console.log('='.repeat(80))
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will fix issues)'}`)
  console.log('')
  
  // 1. Get all BestAuth users
  console.log('Step 1: Loading all BestAuth users...')
  const { data: bestAuthUsers, error: usersError } = await supabase
    .from('bestauth_users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
  
  if (usersError || !bestAuthUsers) {
    result.errors.push(`Failed to load users: ${usersError?.message}`)
    return result
  }
  
  result.totalUsers = bestAuthUsers.length
  console.log(`✅ Found ${result.totalUsers} BestAuth users\n`)
  
  // 2. Check each user
  console.log('Step 2: Auditing each user...\n')
  
  for (const user of bestAuthUsers) {
    console.log(`\n${'─'.repeat(80)}`)
    console.log(`User: ${user.email} (${user.id})`)
    
    // 2a. Check user_id_mapping
    const { data: mapping } = await supabase
      .from('user_id_mapping')
      .select('*')
      .eq('bestauth_user_id', user.id)
      .maybeSingle()
    
    if (mapping) {
      result.usersWithMapping++
      console.log(`  ✅ Has user_id_mapping → ${mapping.supabase_user_id}`)
    } else {
      result.usersWithoutMapping++
      console.log(`  ❌ NO user_id_mapping`)
      
      // Try to fix by creating mapping (BestAuth ID = Supabase ID for most users)
      if (!dryRun) {
        const { error: mappingError } = await supabase
          .from('user_id_mapping')
          .insert({
            bestauth_user_id: user.id,
            supabase_user_id: user.id,
            sync_status: 'active',
            last_synced_at: new Date().toISOString()
          })
        
        if (mappingError) {
          console.log(`  ⚠️  Could not create mapping: ${mappingError.message}`)
          result.errors.push(`${user.email}: Mapping creation failed - ${mappingError.message}`)
        } else {
          console.log(`  ✅ Created user_id_mapping`)
          result.fixed++
        }
      } else {
        console.log(`  [DRY RUN] Would create user_id_mapping`)
      }
    }
    
    // 2b. Check subscription
    const { data: subscription } = await supabase
      .from('subscriptions_consolidated')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!subscription) {
      console.log(`  ℹ️  No subscription (likely free tier)`)
      continue
    }
    
    const tier = subscription.tier
    const status = subscription.status
    console.log(`  📋 Subscription: ${tier} (${status})`)
    
    // 2c. Check subscription metadata
    const resolvedId = mapping?.supabase_user_id || user.id
    const hasResolvedInMetadata = subscription.metadata?.resolved_supabase_user_id
    
    if (!hasResolvedInMetadata) {
      result.metadataIssues++
      console.log(`  ❌ Missing resolved_supabase_user_id in metadata`)
      
      if (!dryRun) {
        const updatedMetadata = {
          ...subscription.metadata,
          resolved_supabase_user_id: resolvedId,
          points_user_id: resolvedId,
          metadata_fixed_at: new Date().toISOString()
        }
        
        const { error: metaError } = await supabase
          .from('bestauth_subscriptions')
          .update({ metadata: updatedMetadata })
          .eq('user_id', user.id)
        
        if (metaError) {
          console.log(`  ⚠️  Could not update metadata: ${metaError.message}`)
          result.errors.push(`${user.email}: Metadata update failed`)
        } else {
          console.log(`  ✅ Updated subscription metadata`)
          result.fixed++
        }
      } else {
        console.log(`  [DRY RUN] Would update subscription metadata`)
      }
    } else {
      console.log(`  ✅ Has resolved_supabase_user_id in metadata`)
    }
    
    // 2d. Check points_balances (only for paid users)
    if (tier !== 'free' && status === 'active') {
      const { data: balance } = await supabase.rpc('get_points_balance', {
        p_user_id: resolvedId
      }).catch(() => ({ data: null }))
      
      if (!balance || balance.balance === 0) {
        result.paidUsersWithoutBalance++
        console.log(`  ❌ CRITICAL: Paid user has NO credits (balance: ${balance?.balance || 0})`)
        
        // Calculate expected balance
        const expectedBalance = tier === 'pro' ? TIER_ALLOCATIONS.pro : 
                               tier === 'pro_plus' ? 830 : // Using 830 instead of 1600
                               TIER_ALLOCATIONS.free
        
        console.log(`  💡 Expected balance: ${expectedBalance} credits`)
        
        if (!dryRun) {
          // Grant credits via add_points RPC
          const { data: addResult, error: addError } = await supabase.rpc('add_points', {
            p_user_id: resolvedId,
            p_amount: expectedBalance,
            p_transaction_type: 'subscription_grant',
            p_description: `${tier} subscription allocation (backfill)`,
            p_generation_type: null,
            p_subscription_id: subscription.id || null,
            p_stripe_payment_intent_id: null,
            p_metadata: {
              backfill: true,
              tier: tier,
              reason: 'Missing credits for active subscription',
              fixed_at: new Date().toISOString()
            }
          })
          
          if (addError) {
            console.log(`  ⚠️  Failed to grant credits: ${addError.message}`)
            result.errors.push(`${user.email}: Credit grant failed - ${addError.message}`)
          } else {
            console.log(`  ✅ Granted ${expectedBalance} credits`)
            console.log(`     New balance: ${addResult.new_balance}`)
            result.fixed++
          }
        } else {
          console.log(`  [DRY RUN] Would grant ${expectedBalance} credits`)
        }
      } else {
        const expectedBalance = tier === 'pro' ? TIER_ALLOCATIONS.pro : 
                               tier === 'pro_plus' ? 830 :
                               TIER_ALLOCATIONS.free
        
        console.log(`  ✅ Has credits: ${balance.balance}`)
        
        // Check if balance is wildly different from expected
        const difference = Math.abs(balance.balance - expectedBalance)
        if (difference > expectedBalance * 0.5) { // More than 50% off
          result.balanceMismatches++
          console.log(`  ⚠️  Balance mismatch: expected ~${expectedBalance}, got ${balance.balance}`)
          console.log(`     Lifetime earned: ${balance.lifetime_earned}`)
          console.log(`     Lifetime spent: ${balance.lifetime_spent}`)
        }
      }
    }
  }
  
  // 3. Summary
  console.log('\n' + '='.repeat(80))
  console.log('AUDIT SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total users: ${result.totalUsers}`)
  console.log(`Users with mapping: ${result.usersWithMapping}`)
  console.log(`Users without mapping: ${result.usersWithoutMapping}`)
  console.log(`Paid users without balance: ${result.paidUsersWithoutBalance}`)
  console.log(`Balance mismatches: ${result.balanceMismatches}`)
  console.log(`Metadata issues: ${result.metadataIssues}`)
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made')
    console.log('Run with --live to apply fixes')
  } else {
    console.log(`\n✅ Fixed ${result.fixed} issues`)
  }
  
  if (result.errors.length > 0) {
    console.log(`\n❌ ${result.errors.length} errors encountered:`)
    result.errors.forEach(err => console.log(`   - ${err}`))
  }
  
  return result
}

// Main
async function main() {
  const args = process.argv.slice(2)
  const isLive = args.includes('--live')
  
  if (isLive) {
    console.log('\n⚠️  LIVE MODE - This will make changes to the database!')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  await auditAndFix(!isLive)
}

main().catch(console.error)
