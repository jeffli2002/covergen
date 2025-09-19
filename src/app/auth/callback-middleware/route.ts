import { NextResponse } from 'next/server'

// This route is handled by middleware, so this should never be reached
export async function GET() {
  return NextResponse.json({ 
    error: 'This route is handled by middleware',
    message: 'If you see this, the middleware OAuth handling is not working'
  })
}