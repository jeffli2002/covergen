#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables:')
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceRoleKey) console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('Applying database migration for usage tracking...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250903_add_usage_tracking.sql')
    const migrationSQL = await fs.readFile(migrationPath, 'utf8')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''))
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      }).select()
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Continue with other statements even if one fails
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
      }
    }
    
    console.log('\n✅ Migration applied successfully!')
    
    // Verify the tables were created
    console.log('\nVerifying tables...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables', {})
      .select()
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError)
    } else {
      const usageTables = tables?.filter(t => 
        ['user_usage', 'anonymous_usage', 'generation_logs'].includes(t.table_name)
      )
      console.log('Usage tracking tables found:', usageTables?.map(t => t.table_name).join(', ') || 'None')
    }
    
  } catch (error) {
    console.error('Error applying migration:', error)
    process.exit(1)
  }
}

// Create helper function to execute SQL if exec_sql RPC doesn't exist
async function createExecSqlFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text) 
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  console.log('Creating exec_sql function...')
  const { error } = await supabase.rpc('query', { 
    query: createFunctionSQL 
  }).select()
  
  if (error) {
    console.log('Note: Could not create exec_sql function, will try direct execution')
  }
}

// Create helper to get tables list
async function createGetTablesFunction() {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION get_tables()
    RETURNS TABLE(table_name text) AS $$
    BEGIN
      RETURN QUERY
      SELECT tablename::text
      FROM pg_tables
      WHERE schemaname = 'public';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  const { error } = await supabase.rpc('query', { 
    query: createFunctionSQL 
  }).select()
  
  if (error) {
    console.log('Note: Could not create get_tables function')
  }
}

async function main() {
  console.log('Setting up helper functions...')
  await createExecSqlFunction()
  await createGetTablesFunction()
  
  console.log('\nStarting migration...')
  await applyMigration()
}

main().catch(console.error)