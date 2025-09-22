import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('Using URL:', supabaseUrl)
    console.log('Using service key (first 20 chars):', serviceKey.substring(0, 20))
    
    // Create direct client with service role
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 1: Simple select all from table
    console.log('Testing simple select...')
    const { data, error, count } = await supabase
      .from('bestauth_usage_tracking')
      .select('*', { count: 'exact' })
      .limit(5)
    
    console.log('Select result:', { data, error, count })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data, 
      count,
      message: 'Table access successful' 
    })
    
  } catch (err) {
    console.error('Test failed:', err)
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : String(err) 
    })
  }
}