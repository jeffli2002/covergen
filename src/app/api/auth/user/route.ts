import { NextResponse } from 'next/server'
import { getUser } from '@/app/auth-actions'

export async function GET() {
  try {
    const user = await getUser()
    return NextResponse.json({ user })
  } catch (error) {
    console.error('[API] Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    )
  }
}