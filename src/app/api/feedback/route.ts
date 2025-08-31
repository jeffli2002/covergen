import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import rateLimit from '@/lib/rate-limit'

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not configured. Feedback feature will be disabled.')
  // In production, we should fail gracefully
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

// Rate limiter: 5 feedback submissions per IP per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max number of users during interval
})

interface FeedbackData {
  context: 'generation' | 'result' | 'general'
  rating: number
  feedback?: string
  email?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Feedback service is not configured' },
        { status: 503 }
      )
    }

    // Rate limiting in production
    if (process.env.NODE_ENV === 'production') {
      const ip = request.headers.get('x-forwarded-for') || 'anonymous'
      try {
        await limiter.check(5, ip) // 5 requests per minute per IP
      } catch {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    const data: FeedbackData = await request.json()

    // Validate required fields
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be between 1 and 5.' },
        { status: 400 }
      )
    }

    // Get user session if available
    const cookieStore = cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    let userId = null
    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (!error && user) {
        userId = user.id
      }
    }

    // Map context to feedback type
    const typeMap = {
      'generation': 'feature',
      'result': 'improvement',
      'general': 'other'
    }

    // Insert feedback into Supabase
    const { data: feedbackResult, error } = await supabase
      .from('feedback')
      .insert([{
        user_id: userId,
        email: data.email?.trim() || null,
        message: data.feedback?.trim() || `Rating: ${data.rating}/5 for ${data.context}`,
        type: typeMap[data.context] || 'other',
        rating: data.rating,
        page_url: request.headers.get('referer') || '',
        user_agent: request.headers.get('user-agent') || '',
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to save feedback')
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: feedbackResult.id
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
}