import { NextRequest, NextResponse } from 'next/server'
import { signInWithOAuth } from '@/app/auth-actions'

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()
    
    if (!provider || !['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }
    
    const result = await signInWithOAuth(provider as 'google' | 'github')
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] OAuth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}