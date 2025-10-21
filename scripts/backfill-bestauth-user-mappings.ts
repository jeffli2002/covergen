/**
 * Backfill user_id_mapping for all existing BestAuth users
 * 
 * This script ensures every BestAuth user has:
 * 1. A Supabase auth.users record
 * 2. A user_id_mapping entry
 * 3. A points balance (created on first access)
 * 
 * Usage: npx tsx scripts/backfill-bestauth-user-mappings.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { userSyncService } from '@/services/sync/UserSyncService'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function backfillMappings() {
  console.log('=' .repeat(80))
  console.log('Backfilling user_id_mapping for all BestAuth users')
  console.log('=' .repeat(80))

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:')
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`)
    console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`)
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Step 1: Get all BestAuth users
    console.log('\n1. Fetching all BestAuth users...')
    const { data: bestAuthUsers, error: fetchError } = await supabase
      .from('bestauth_users')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching BestAuth users:', fetchError)
      return
    }

    console.log(`✅ Found ${bestAuthUsers.length} BestAuth users`)

    // Step 2: Process each user
    let created = 0
    let skipped = 0
    let failed = 0
    const errors: Array<{ email: string; error: string }> = []

    for (let i = 0; i < bestAuthUsers.length; i++) {
      const user = bestAuthUsers[i]
      const progress = `[${i + 1}/${bestAuthUsers.length}]`

      try {
        // Check if mapping already exists
        const { data: existingMapping } = await supabase
          .from('user_id_mapping')
          .select('supabase_user_id')
          .eq('bestauth_user_id', user.id)
          .maybeSingle()

        if (existingMapping) {
          console.log(`${progress} ✓ Mapping exists for ${user.email}`)
          skipped++
          continue
        }

        // Sync to Supabase using UserSyncService
        console.log(`${progress} Creating mapping for ${user.email}...`)
        const syncResult = await userSyncService.syncBestAuthUserToSupabase(user.id)

        if (syncResult.success) {
          console.log(`${progress} ✅ Created mapping for ${user.email}`)
          created++
        } else {
          console.error(`${progress} ❌ Failed for ${user.email}: ${syncResult.error}`)
          errors.push({ email: user.email, error: syncResult.error || 'Unknown error' })
          failed++
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`${progress} ❌ Error processing ${user.email}:`, errorMsg)
        errors.push({ email: user.email, error: errorMsg })
        failed++
      }

      // Add small delay to avoid rate limiting
      if (i < bestAuthUsers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Step 3: Summary
    console.log('\n' + '=' .repeat(80))
    console.log('Backfill Complete')
    console.log('=' .repeat(80))
    console.log(`Total Users: ${bestAuthUsers.length}`)
    console.log(`✅ Created: ${created}`)
    console.log(`⏭️  Skipped (already exists): ${skipped}`)
    console.log(`❌ Failed: ${failed}`)

    if (errors.length > 0) {
      console.log('\nFailed Users:')
      errors.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`)
      })
    }

    // Step 4: Verify total mappings
    console.log('\n' + '=' .repeat(80))
    console.log('Verification')
    console.log('=' .repeat(80))

    const { count: totalMappings } = await supabase
      .from('user_id_mapping')
      .select('*', { count: 'exact', head: true })

    const { count: totalBestAuthUsers } = await supabase
      .from('bestauth_users')
      .select('*', { count: 'exact', head: true })

    console.log(`Total BestAuth users: ${totalBestAuthUsers}`)
    console.log(`Total mappings: ${totalMappings}`)
    
    if (totalMappings === totalBestAuthUsers) {
      console.log('✅ All BestAuth users have mappings!')
    } else {
      console.log(`⚠️  ${(totalBestAuthUsers || 0) - (totalMappings || 0)} users still missing mappings`)
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

// Run the backfill
backfillMappings()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
