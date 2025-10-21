/**
 * Test Account API Directly
 * 
 * Simulates what happens when user loads account page
 * Shows exactly what the API returns
 * 
 * Usage: npx tsx scripts/test-account-api-direct.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/bestauth/db'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import { createPointsService } from '@/lib/services/points-service'

config({ path: resolve(process.cwd(), '.env.local') })

const BESTAUTH_USER_ID = '57c1c563-4cdd-4471-baa0-f49064b997c9'

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function extractSupabaseIdFromMetadata(metadata: any): string | null {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const candidates = [
    metadata.resolved_supabase_user_id,
    metadata.supabase_user_id,
    metadata.original_payload_user_id,
    metadata.original_userId
  ]

  return candidates.find(isUuid) ?? null
}

async function testAccountAPI() {
  console.log('=' .repeat(80))
  console.log('Testing Account API Logic')
  console.log('=' .repeat(80))
  console.log(`BestAuth User ID: ${BESTAUTH_USER_ID}`)
  console.log('=' .repeat(80))

  try {
    const userId = BESTAUTH_USER_ID
    const supabaseAdmin = getBestAuthSupabaseClient()

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client unavailable')
      return
    }

    // STEP 1: Initial state
    console.log('\n📋 STEP 1: Starting with BestAuth user ID')
    let supabaseUserId = userId
    console.log(`   supabaseUserId = ${supabaseUserId}`)

    // STEP 2: Try user_id_mapping
    console.log('\n📋 STEP 2: Checking user_id_mapping table...')
    const { data: mapping, error: mappingError } = await supabaseAdmin
      .from('user_id_mapping')
      .select('supabase_user_id')
      .eq('bestauth_user_id', userId)
      .maybeSingle()

    if (mappingError && mappingError.code !== 'PGRST116') {
      console.error('   ❌ Error fetching user mapping:', mappingError)
    }

    if (mapping?.supabase_user_id && isUuid(mapping.supabase_user_id)) {
      supabaseUserId = mapping.supabase_user_id
      console.log(`   ✅ Mapping found: ${supabaseUserId}`)
    } else {
      console.log('   ⚠️  No mapping found, trying subscription metadata...')

      // STEP 3: Try subscription metadata
      console.log('\n📋 STEP 3: Checking subscription metadata...')
      const { data: subscriptionData } = await supabaseAdmin
        .from('bestauth_subscriptions')
        .select('metadata')
        .eq('user_id', userId)
        .maybeSingle()

      console.log('   Subscription metadata:', JSON.stringify(subscriptionData?.metadata, null, 2))

      const metadataSupabaseId = extractSupabaseIdFromMetadata(subscriptionData?.metadata)

      if (metadataSupabaseId) {
        supabaseUserId = metadataSupabaseId
        console.log(`   ✅ Found in metadata: ${supabaseUserId}`)
      } else {
        console.log('   ❌ CRITICAL: Unable to resolve Supabase user id')
        console.log(`   Will use BestAuth ID: ${supabaseUserId}`)
      }
    }

    // STEP 4: Fetch points balance
    console.log(`\n💰 STEP 4: Fetching points balance for: ${supabaseUserId}`)
    
    try {
      const pointsService = createPointsService(supabaseAdmin)
      const pointsBalance = await pointsService.getBalance(supabaseUserId)
      
      if (pointsBalance) {
        console.log('   ✅ Points balance retrieved:')
        console.log(`      Balance: ${pointsBalance.balance}`)
        console.log(`      Lifetime Earned: ${pointsBalance.lifetime_earned}`)
        console.log(`      Lifetime Spent: ${pointsBalance.lifetime_spent}`)
        console.log(`      Tier: ${pointsBalance.tier}`)
      } else {
        console.log('   ⚠️  No balance returned')
      }

      // STEP 5: Simulate API response
      console.log('\n📤 STEP 5: API would return to frontend:')
      console.log(JSON.stringify({
        usage: {
          credits_balance: pointsBalance?.balance || 0,
          credits_monthly_allowance: 800,
          credits_used_this_month: 0,
          credits_lifetime_earned: pointsBalance?.lifetime_earned || 0,
          credits_lifetime_spent: pointsBalance?.lifetime_spent || 0
        }
      }, null, 2))

    } catch (pointsError) {
      console.error('   ❌ Error fetching points balance:', pointsError)
    }

    console.log('\n' + '=' .repeat(80))
    console.log('Test Complete')
    console.log('=' .repeat(80))

  } catch (error) {
    console.error('\n❌ Error:', error)
  }
}

testAccountAPI().catch(console.error)
