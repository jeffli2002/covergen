// BestAuth Session Check API Route
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/bestauth/middleware'

export async function GET(request: NextRequest) {
  console.log('[Session API] Checking session')
  
  try {
    const user = await getUserFromRequest(request)
    
    console.log('[Session API] User from request:', user ? 'Found' : 'Not found', user?.email || 'N/A')
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}