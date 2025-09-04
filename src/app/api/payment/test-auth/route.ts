import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    // Log all headers
    const headers: any = {}
    req.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log('All headers:', headers)
    
    // Check auth header
    const authHeader = req.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (!authHeader) {
      return NextResponse.json({
        error: 'No authorization header',
        headers: headers
      }, { status: 401 })
    }
    
    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment check:', {
      hasSupabaseUrl,
      hasServiceKey,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
    
    // Try to verify token
    if (hasSupabaseUrl && hasServiceKey) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const token = authHeader.replace('Bearer ', '')
      const { data, error } = await supabaseAdmin.auth.getUser(token)
      
      return NextResponse.json({
        success: true,
        hasAuth: true,
        hasUser: !!data.user,
        userId: data.user?.id,
        error: error?.message,
        environment: {
          hasSupabaseUrl,
          hasServiceKey
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Missing environment configuration'
    })
    
  } catch (error: any) {
    console.error('Test auth error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}