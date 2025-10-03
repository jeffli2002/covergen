import { NextRequest, NextResponse } from 'next/server'
import { createSoraTask, SoraApiError } from '@/lib/sora-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, aspect_ratio, quality } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (prompt.length > 5000) {
      return NextResponse.json(
        { error: 'Prompt must be 5000 characters or less' },
        { status: 400 }
      )
    }

    const taskId = await createSoraTask({
      prompt,
      aspect_ratio: aspect_ratio || 'landscape',
      quality: quality || 'standard'
    })

    return NextResponse.json({ taskId })

  } catch (error) {
    console.error('Sora create task error:', error)

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
