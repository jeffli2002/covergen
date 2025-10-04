import { NextRequest, NextResponse } from 'next/server'
import { createSoraTask, SoraApiError } from '@/lib/sora-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, prompt, image_url, aspect_ratio, quality } = body

    const generationMode = mode || 'text-to-video'

    if (generationMode === 'text-to-video') {
      // Text-to-video validation
      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Prompt is required for text-to-video' },
          { status: 400 }
        )
      }

      if (prompt.length > 5000) {
        return NextResponse.json(
          { error: 'Prompt must be 5000 characters or less' },
          { status: 400 }
        )
      }

      const taskId = await createSoraTask(
        {
          prompt,
          aspect_ratio: aspect_ratio || 'landscape',
          quality: quality || 'standard'
        },
        'text-to-video'
      )

      return NextResponse.json({ taskId })

    } else if (generationMode === 'image-to-video') {
      // Image-to-video validation
      if (!image_url || typeof image_url !== 'string') {
        console.error('[Sora API] image-to-video validation failed:', { image_url, type: typeof image_url })
        return NextResponse.json(
          { error: 'image_url is required for image-to-video generation' },
          { status: 400 }
        )
      }

      if (prompt && prompt.length > 5000) {
        return NextResponse.json(
          { error: 'Prompt must be 5000 characters or less' },
          { status: 400 }
        )
      }

      const taskId = await createSoraTask(
        {
          image_url,
          ...(prompt && { prompt }),
          aspect_ratio: aspect_ratio || 'landscape',
          quality: quality || 'standard'
        },
        'image-to-video'
      )

      return NextResponse.json({ taskId })

    } else {
      return NextResponse.json(
        { error: 'Invalid mode. Must be text-to-video or image-to-video' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('[Sora API] Create task error:', error)
    
    if (error instanceof SoraApiError) {
      console.error('[Sora API] SoraApiError details:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.code >= 500 ? 500 : 400 }
      )
    }

    // Log full error for debugging
    console.error('[Sora API] Unexpected error:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    })

    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    )
  }
}
