import { NextRequest, NextResponse } from 'next/server'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'

export async function GET(request: NextRequest) {
  try {
    const client = getBestAuthSupabaseClient()
    if (!client) {
      return NextResponse.json({ error: 'No database client' }, { status: 500 })
    }

    // Test basic connection
    console.log('Testing basic connection...')
    
    // Test 1: Check if table exists
    const { data: tables, error: tablesError } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'bestauth_usage_tracking')
      .limit(1)

    console.log('Table check:', { tables, tablesError })

    // Test 2: Try to count rows
    const { count, error: countError } = await client
      .from('bestauth_usage_tracking')
      .select('*', { count: 'exact', head: true })

    console.log('Count check:', { count, countError })

    // Test 3: Try to insert a test record
    const testUserId = '00000000-0000-0000-0000-000000000000'
    const { data: insertData, error: insertError } = await client
      .from('bestauth_usage_tracking')
      .insert({
        user_id: testUserId,
        date: new Date().toISOString().split('T')[0],
        generation_count: 1
      })
      .select()

    console.log('Insert test:', { insertData, insertError })

    // Test 4: Try to query the test record
    const { data: queryData, error: queryError } = await client
      .from('bestauth_usage_tracking')
      .select('*')
      .eq('user_id', testUserId)
      .limit(1)

    console.log('Query test:', { queryData, queryError })

    return NextResponse.json({
      success: true,
      tests: {
        tableExists: { tables, error: tablesError },
        rowCount: { count, error: countError },
        insertTest: { data: insertData, error: insertError },
        queryTest: { data: queryData, error: queryError }
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}