import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Create direct client with service role
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 1: Check what usage tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%usage%')
    
    // Test 2: Check what subscription tables exist
    const { data: subTables, error: subTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%subscription%')
    
    // Test 3: Check if check_generation_limit function exists
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_name', 'check_generation_limit')
    
    // Test 4: Try to call the function with a test user
    const testUserId = '00000000-0000-0000-0000-000000000000'
    let functionResult = null
    let functionError = null
    
    try {
      const { data, error } = await supabase
        .rpc('check_generation_limit', { 
          p_user_id: testUserId,
          p_subscription_tier: 'free'
        })
      functionResult = data
      functionError = error
    } catch (err) {
      functionError = err
    }
    
    // Test 5: Check user_usage table structure
    let userUsageColumns = null
    let userUsageError = null
    
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'user_usage')
        .eq('table_schema', 'public')
      userUsageColumns = data
      userUsageError = error
    } catch (err) {
      userUsageError = err
    }
    
    return NextResponse.json({
      success: true,
      diagnosis: {
        usage_tables: { data: tables, error: tablesError },
        subscription_tables: { data: subTables, error: subTablesError },
        functions: { data: functions, error: functionsError },
        function_test: { result: functionResult, error: functionError },
        user_usage_structure: { columns: userUsageColumns, error: userUsageError }
      }
    })
    
  } catch (err) {
    console.error('Diagnosis failed:', err)
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    })
  }
}