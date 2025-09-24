const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  try {
    console.log('Running BestAuth Stripe Integration migration...')
    console.log('=====================================')
    
    // Step 1: Run the subscription migration script
    console.log('\n1. Running subscription migration...')
    const migrationPath = path.join(__dirname, '..', 'src', 'lib', 'bestauth', 'schema', 'migrate-subscriptions.sql')
    const migrationSql = fs.readFileSync(migrationPath, 'utf8')
    
    // Note: Since Supabase doesn't support running raw SQL via the client library,
    // we'll provide instructions for manual execution
    console.log('⚠️  Please run the following migration script manually in Supabase SQL editor:')
    console.log('Path:', migrationPath)
    
    // Step 2: Run the update subscription function script
    console.log('\n2. Updating subscription status function...')
    const updatePath = path.join(__dirname, '..', 'src', 'lib', 'bestauth', 'schema', 'update-subscription-stripe-fields.sql')
    const updateSql = fs.readFileSync(updatePath, 'utf8')
    
    console.log('⚠️  Please run the following update script manually in Supabase SQL editor:')
    console.log('Path:', updatePath)
    
    // Step 3: Verify the migration
    console.log('\n3. Verifying migration...')
    
    // Check if bestauth_subscriptions table exists and has stripe_customer_id
    const { data: tableInfo, error: tableError } = await supabase
      .from('bestauth_subscriptions')
      .select('*')
      .limit(0)
    
    if (tableError) {
      console.error('❌ BestAuth subscriptions table not found:', tableError.message)
      return
    }
    
    console.log('✅ BestAuth subscriptions table exists')
    
    // Check some sample data
    const { data: subscriptions, error: subError } = await supabase
      .from('bestauth_subscriptions')
      .select('user_id, tier, status, stripe_customer_id, stripe_subscription_id')
      .not('stripe_customer_id', 'is', null)
      .limit(5)
    
    if (!subError && subscriptions && subscriptions.length > 0) {
      console.log(`\n✅ Found ${subscriptions.length} subscriptions with Stripe customer IDs:`)
      subscriptions.forEach(sub => {
        console.log(`   - User: ${sub.user_id}, Tier: ${sub.tier}, Customer: ${sub.stripe_customer_id}`)
      })
    } else {
      console.log('\n⚠️  No subscriptions with Stripe customer IDs found')
      console.log('This might be normal if no payments have been processed yet')
    }
    
    // Check if any subscriptions exist without Stripe customer IDs
    const { data: missingSubs, error: missingError } = await supabase
      .from('bestauth_subscriptions')
      .select('user_id, tier, status')
      .is('stripe_customer_id', null)
      .neq('tier', 'free')
      .limit(5)
    
    if (!missingError && missingSubs && missingSubs.length > 0) {
      console.log(`\n⚠️  Found ${missingSubs.length} paid subscriptions without Stripe customer IDs:`)
      missingSubs.forEach(sub => {
        console.log(`   - User: ${sub.user_id}, Tier: ${sub.tier}, Status: ${sub.status}`)
      })
      console.log('These users may need to re-authenticate their payment methods')
    }
    
    console.log('\n=====================================')
    console.log('Migration verification complete!')
    console.log('\nNext steps:')
    console.log('1. Run the SQL scripts mentioned above in Supabase SQL editor')
    console.log('2. Test the Manage Billing button in the account page')
    console.log('3. Monitor webhook logs for proper Stripe customer ID storage')
    
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()