import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Sign out on server
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 400 })
    }
    
    // Create response that clears cookies
    const response = NextResponse.json({ success: true })
    
    // Clear all auth-related cookies
    const cookies = request.cookies.getAll()
    cookies.forEach(cookie => {
      if (cookie.name.includes('sb-') || cookie.name.includes('auth')) {
        response.cookies.set({
          name: cookie.name,
          value: '',
          maxAge: -1,
          path: '/'
        })
      }
    })
    
    return response
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed'
    }, { status: 500 })
  }
}