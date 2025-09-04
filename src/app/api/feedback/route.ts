import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
// import rateLimit from '@/lib/rate-limit' // TODO: Fix rate limiting implementation
import type { Database } from '@/types/supabase'

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: ReturnType<typeof createClient<Database>> | null = null

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials not configured. Feedback feature will be disabled.')
} else {
  supabase = createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

// Rate limiter: 5 feedback submissions per IP per minute
// TODO: Implement proper rate limiting
// const limiter = rateLimit({
//   interval: 60 * 1000, // 60 seconds
//   uniqueTokenPerInterval: 500, // Max number of users during interval
// })

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
    if (!supabase) {
      console.error('Supabase client is not initialized')
      return NextResponse.json(
        { error: 'Feedback service is not configured' },
        { status: 503 }
      )
    }
    
    console.log('Supabase URL:', supabaseUrl)
    console.log('Service key exists:', !!supabaseServiceKey)

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
    const typeMap: Record<string, 'bug' | 'feature' | 'improvement' | 'other'> = {
      'generation': 'feature',
      'result': 'improvement',
      'general': 'other'
    }

    // Prepare feedback data
    const feedbackData = {
      user_id: userId,
      email: data.email?.trim() || null,
      message: data.feedback?.trim() || `Rating: ${data.rating}/5 for ${data.context}`,
      type: typeMap[data.context] || 'other',
      rating: data.rating,
      page_url: request.headers.get('referer') || null,
      user_agent: request.headers.get('user-agent') || null,
    }
    
    console.log('Attempting to insert feedback:', feedbackData)
    
    // First, test if we can access the feedback table
    const { data: testQuery, error: testError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1)
    
    console.log('Test query result:', { testQuery, testError })
    
    if (testError) {
      console.error('Cannot access feedback table:', testError)
      
      // Return a more specific error message
      if (testError.code === '42P01') {
        return NextResponse.json({
          success: false,
          error: 'Feedback table does not exist. Please run the Supabase migration.',
          details: 'See supabase/README.md for setup instructions'
        }, { status: 500 })
      } else if (testError.code === 'PGRST301') {
        return NextResponse.json({
          success: false,
          error: 'Authentication error. Please check your Supabase service role key.',
          details: testError.message
        }, { status: 500 })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Database error',
          details: testError.message
        }, { status: 500 })
      }
    }

    // Insert feedback into Supabase
    const { data: feedbackResult, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()

    console.log('Supabase insert result:', { feedbackResult, error })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to save feedback: ${error.message}`)
    }

    if (!feedbackResult || !feedbackResult.id) {
      console.error('No feedback ID returned from Supabase insert')
      return NextResponse.json({
        success: false,
        error: 'Feedback was submitted but no ID was returned',
        details: 'This might indicate a database configuration issue'
      }, { status: 500 })
    }
    
    console.log('Returning feedbackId:', feedbackResult.id)

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