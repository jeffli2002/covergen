// BestAuth Schema Verification API Route
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Check if service role key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables'
      }, { status: 500 })
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check all required tables
    const tables = [
      'bestauth_users',
      'bestauth_credentials',
      'bestauth_oauth_accounts',
      'bestauth_sessions',
      'bestauth_magic_links',
      'bestauth_password_resets',
      'bestauth_activity_logs'
    ]

    const results: any = {
      schema_exists: false,
      tables: {},
      rls_status: {},
      test_operations: {}
    }

    // For public schema tables, we just check if tables exist
    results.schema_exists = true // Using public schema

    // Check each table
    for (const table of tables) {
      const tableName = table
      
      // Check if table exists
      const { data: tableExists, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (!tableError) {
        results.tables[table] = 'exists'
        
        // Check RLS status
        const { data: rlsData } = await supabase
          .from('pg_tables')
          .select('tablename, rowsecurity')
          .eq('schemaname', 'public')
          .eq('tablename', tableName)
          .single()
        
        if (rlsData) {
          results.rls_status[table] = rlsData.rowsecurity ? 'enabled' : 'disabled'
        }
      } else {
        results.tables[table] = `error: ${tableError.message}`
      }
    }

    // Test basic operations
    try {
      // Test insert into users
      const testEmail = `test-verify-${Date.now()}@example.com`
      const { data: insertData, error: insertError } = await supabase
        .from('bestauth_users')
        .insert({
          email: testEmail,
          email_verified: false
        })
        .select()
        .single()

      if (insertError) {
        results.test_operations.insert = `failed: ${insertError.message}`
      } else {
        results.test_operations.insert = 'success'
        
        // Test select
        const { data: selectData, error: selectError } = await supabase
          .from('bestauth_users')
          .select('*')
          .eq('email', testEmail)
          .single()

        results.test_operations.select = selectError ? `failed: ${selectError.message}` : 'success'
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('bestauth_users')
          .delete()
          .eq('id', insertData.id)

        results.test_operations.delete = deleteError ? `failed: ${deleteError.message}` : 'success'
      }
    } catch (error) {
      results.test_operations.error = error.message
    }

    // Check if JWT secret is configured
    results.jwt_secret_configured = !!process.env.BESTAUTH_JWT_SECRET

    // Summary
    const allTablesExist = Object.values(results.tables).every(status => status === 'exists')
    const rlsDisabled = Object.values(results.rls_status).every(status => status === 'disabled')
    const testsPass = results.test_operations.insert === 'success' && 
                     results.test_operations.select === 'success' &&
                     results.test_operations.delete === 'success'

    results.summary = {
      schema_ready: results.schema_exists && allTablesExist,
      rls_properly_disabled: rlsDisabled,
      operations_working: testsPass,
      jwt_configured: results.jwt_secret_configured,
      overall_status: results.schema_exists && allTablesExist && rlsDisabled && testsPass ? 'ready' : 'issues_found'
    }

    // Recommendations
    results.recommendations = []
    
    if (!results.schema_exists) {
      results.recommendations.push('Run the schema creation script in Supabase SQL editor')
    }
    
    if (!allTablesExist) {
      results.recommendations.push('Some tables are missing - check schema creation')
    }
    
    if (!rlsDisabled) {
      results.recommendations.push('Disable RLS on all BestAuth tables (see SUPABASE_DB_SETTINGS.md)')
    }
    
    if (!results.jwt_secret_configured) {
      results.recommendations.push('Add BESTAUTH_JWT_SECRET to your .env.local')
    }
    
    if (!testsPass) {
      results.recommendations.push('Database operations are failing - check permissions')
    }

    return NextResponse.json({
      success: true,
      results,
      ready_for_use: results.summary.overall_status === 'ready'
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local'
    }, { status: 500 })
  }
}