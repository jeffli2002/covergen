import { NextResponse } from 'next/server'

// Simple in-memory storage for debug logs (resets on server restart)
const debugLogs: any[] = []

export async function GET() {
  return NextResponse.json({
    logs: debugLogs.slice(-50), // Return last 50 logs
    count: debugLogs.length
  })
}

export async function POST(request: Request) {
  try {
    const log = await request.json()
    debugLogs.push({
      ...log,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 100 logs to prevent memory issues
    if (debugLogs.length > 100) {
      debugLogs.splice(0, debugLogs.length - 100)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 })
  }
}