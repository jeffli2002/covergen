import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const tests = {
      environment: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlFormat: supabaseUrl?.includes('supabase.co') || false
      },
      client: {
        canConnect: false,
        authEnabled: false
      },
      session: {
        currentSession: null,
        error: null
      }
    }
    
    // Test 2: Try to create client
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        tests.client.canConnect = true
        
        // Test 3: Check auth status
        const { data: { session }, error } = await supabase.auth.getSession()
        tests.client.authEnabled = !error
        tests.session.currentSession = session ? {
          user: session.user.email,
          provider: session.user.app_metadata?.provider,
          expiresAt: new Date(session.expires_at! * 1000).toISOString()
        } : null
        tests.session.error = error?.message || null
      } catch (error) {
        tests.client.canConnect = false
      }
    }
    
    return NextResponse.json({
      status: 'OAuth Test Results',
      timestamp: new Date().toISOString(),
      tests,
      recommendations: getRecommendations(tests)
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getRecommendations(tests: any): string[] {
  const recommendations = []
  
  if (!tests.environment.hasUrl || !tests.environment.hasKey) {
    recommendations.push('Missing Supabase environment variables. Check .env.local file.')
  }
  
  if (!tests.environment.urlFormat) {
    recommendations.push('Supabase URL format seems incorrect. It should include "supabase.co".')
  }
  
  if (!tests.client.canConnect) {
    recommendations.push('Cannot connect to Supabase. Check your project settings.')
  }
  
  if (!tests.client.authEnabled) {
    recommendations.push('Auth might be disabled or misconfigured in Supabase project.')
  }
  
  return recommendations
}