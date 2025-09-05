import { NextResponse } from 'next/server'
import { debugLogs } from '@/app/auth/callback-debug/route'

export async function GET() {
  // Return the debug logs from memory
  return NextResponse.json({
    logs: debugLogs,
    count: debugLogs.length,
    message: 'These are the most recent OAuth callback debug logs'
  })
}

// Clear logs endpoint
export async function DELETE() {
  debugLogs.length = 0
  return NextResponse.json({ message: 'Debug logs cleared' })
}