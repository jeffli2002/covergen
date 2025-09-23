import { NextRequest, NextResponse } from 'next/server'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you can enhance this
    const authHeader = request.headers.get('x-admin-key')
    if (authHeader !== 'apply-session-migration-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getBestAuthSupabaseClient()
    if (!client) {
      return NextResponse.json({ error: 'Database client not available' }, { status: 500 })
    }

    const results = []

    // Step 1: Check current structure
    console.log('Checking current table structure...')
    const { data: checkData, error: checkError } = await client
      .from('bestauth_usage_tracking')
      .select('*')
      .limit(1)

    if (checkError) {
      results.push({ step: 'check_table', status: 'error', message: checkError.message })
    } else {
      results.push({ step: 'check_table', status: 'success', columns: Object.keys(checkData[0] || {}) })
    }

    // Step 2: Test if session_id column exists by trying to insert
    const testSessionId = 'migration-test-' + Date.now()
    const today = new Date().toISOString().split('T')[0]

    console.log('Testing session_id column...')
    const { error: insertError } = await client
      .from('bestauth_usage_tracking')
      .insert({
        session_id: testSessionId,
        date: today,
        generation_count: 0
      })

    if (insertError) {
      if (insertError.message.includes('session_id')) {
        results.push({ 
          step: 'check_session_column', 
          status: 'error', 
          message: 'session_id column does not exist',
          action: 'Please add it manually via Supabase dashboard'
        })
      } else if (insertError.message.includes('user_id')) {
        results.push({ 
          step: 'check_session_column', 
          status: 'error', 
          message: 'user_id is still required (not nullable)',
          action: 'Please make user_id nullable via Supabase dashboard'
        })
      } else {
        results.push({ 
          step: 'check_session_column', 
          status: 'error', 
          message: insertError.message 
        })
      }
    } else {
      results.push({ 
        step: 'check_session_column', 
        status: 'success', 
        message: 'Session tracking is working!' 
      })

      // Cleanup test record
      await client
        .from('bestauth_usage_tracking')
        .delete()
        .eq('session_id', testSessionId)
        .eq('date', today)
    }

    // Step 3: Test incrementing session usage
    if (results[results.length - 1].status === 'success') {
      console.log('Testing session usage increment...')
      const testSessionId2 = 'increment-test-' + Date.now()
      
      // Insert initial record
      const { error: insertErr } = await client
        .from('bestauth_usage_tracking')
        .insert({
          session_id: testSessionId2,
          date: today,
          generation_count: 1
        })

      if (!insertErr) {
        // Try to update
        const { data: updateData, error: updateErr } = await client
          .from('bestauth_usage_tracking')
          .update({ generation_count: 2 })
          .eq('session_id', testSessionId2)
          .eq('date', today)
          .select()

        if (!updateErr && updateData && updateData[0]?.generation_count === 2) {
          results.push({ 
            step: 'test_increment', 
            status: 'success', 
            message: 'Session increment working correctly' 
          })
        } else {
          results.push({ 
            step: 'test_increment', 
            status: 'error', 
            message: 'Failed to increment session usage' 
          })
        }

        // Cleanup
        await client
          .from('bestauth_usage_tracking')
          .delete()
          .eq('session_id', testSessionId2)
          .eq('date', today)
      }
    }

    // Provide migration SQL if needed
    const needsMigration = results.some(r => r.status === 'error')
    if (needsMigration) {
      results.push({
        step: 'migration_sql',
        status: 'info',
        message: 'Please run this SQL in a PostgreSQL client:',
        sql: `
-- Add session_id column
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Make user_id nullable
ALTER TABLE bestauth_usage_tracking 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_session_date 
ON bestauth_usage_tracking(session_id, date) 
WHERE session_id IS NOT NULL;
        `.trim()
      })
    }

    return NextResponse.json({
      success: !needsMigration,
      needsMigration,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'POST to this endpoint with header x-admin-key: apply-session-migration-2025',
    purpose: 'This endpoint checks if session tracking migration has been applied'
  })
}