import { NextResponse } from 'next/server'
import { signOut } from '@/app/auth-actions'

export async function POST() {
  try {
    const result = await signOut()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Sign out error:', error)
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}