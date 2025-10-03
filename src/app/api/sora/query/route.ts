import { NextRequest, NextResponse } from 'next/server'
import { querySoraTask, SoraApiError } from '@/lib/sora-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      )
    }

    const taskInfo = await querySoraTask(taskId)

    return NextResponse.json(taskInfo)

  } catch (error) {
    console.error('Sora query task error:', error)

    if (error instanceof SoraApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code >= 500 ? 500 : 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
