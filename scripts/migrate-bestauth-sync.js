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
    console.log('Running BestAuth sync schema migration...')
    
    // Read the sync schema SQL file
    const syncSchemaPath = path.join(__dirname, '..', 'src', 'lib', 'bestauth', 'sync-schema.sql')
    const syncSchema = fs.readFileSync(syncSchemaPath, 'utf8')
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: syncSchema
    })
    
    if (error) {
      // If RPC doesn't exist, try a different approach
      console.log('Note: exec_sql RPC not available. Please run the sync-schema.sql file manually in Supabase SQL editor.')
      console.log('Path:', syncSchemaPath)
      return
    }
    
    console.log('✅ BestAuth sync schema migration completed successfully!')
    
    // Verify tables were created
    console.log('\nVerifying tables...')
    
    const tables = [
      'user_id_mapping',
      'unified_sessions',
      'sync_operations',
      'migration_status'
    ]
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0)
      
      if (error) {
        console.log(`❌ Table ${table} verification failed:`, error.message)
      } else {
        console.log(`✅ Table ${table} exists`)
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()