// BestAuth Session Check API Route
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/bestauth/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
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