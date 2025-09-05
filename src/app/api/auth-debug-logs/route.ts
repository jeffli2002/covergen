import { NextResponse } from 'next/server'
import { debugLogStore } from '@/lib/oauth-debug-store'

export async function GET() {
  // Return the debug logs from memory
  const logs = debugLogStore.getLogs()
  return NextResponse.json({
    logs,
    count: logs.length,
    message: 'These are the most recent OAuth callback debug logs'
  })
}

// Clear logs endpoint
export async function DELETE() {
  debugLogStore.clear()
  return NextResponse.json({ message: 'Debug logs cleared' })
}