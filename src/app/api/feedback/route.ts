import { NextRequest, NextResponse } from 'next/server'

interface FeedbackData {
  context: 'generation' | 'result' | 'general'
  rating: number
  feedback?: string
  email?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const data: FeedbackData = await request.json()

    // Validate required fields
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Save to database
    // 2. Send to analytics service
    // 3. Trigger notifications if needed
    
    // For now, we'll log it and return success
    console.log('Feedback received:', {
      ...data,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
}