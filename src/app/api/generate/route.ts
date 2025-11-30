import { NextRequest, NextResponse } from 'next/server'
import { getKieApiService } from '@/lib/kie-api'
import { createClient } from '@/lib/supabase/server'
import { checkGenerationLimit, incrementGenerationCount, getUserSubscriptionInfo } from '@/lib/generation-limits'
import { getSubscriptionConfig } from '@/lib/subscription-config'
import { withAuth, AuthenticatedRequest, getAuthenticatedUser } from '@/app/api/middleware/withAuth'
import { authConfig } from '@/config/auth.config'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'
import { getOrCreateSessionId } from '@/lib/session-utils'
import { checkPointsForGeneration, deductPointsForGeneration } from '@/lib/middleware/points-check'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'

// Image generation endpoint handler
async function handler(request: AuthenticatedRequest) {
  // Create Supabase client for legacy user_usage table queries (requires user context)
  const supabase = await createClient()
  
  try {
    // Check request size before parsing
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) { // 4MB limit
      return NextResponse.json(
        { error: 'Request too large. Please use smaller images or reduce the number of reference images.' },
        { status: 413 }
      )
    }
    
    const body = await request.json()
    const { prompt, referenceImages, mode, style, platform, dimensions } = body

    // Log the received parameters for debugging
    console.log('API Generate called with:', {
      prompt: prompt?.substring(0, 50) + '...',
      mode,
      style,
      platform,
      dimensions
    })

    // Validate required fields
    if (!prompt || !mode) {
      return NextResponse.json(
        { error: 'Prompt and mode are required' },
        { status: 400 }
      )
    }

    // Get authenticated user from request (BestAuth middleware adds it)
    const user = request.user
    
    // REQUIRE AUTHENTICATION: All generation requires authentication
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to generate images.' },
        { status: 401 }
      )
    }
    
    // Check generation limits - REMOVED: Free quota checks, now credit-based only
    // All users must have sufficient credits before generation
      // Check current generation limit for authenticated users
      
    // REMOVED: All free quota checks - now pure credit-based system
    // Credit check happens below before generation starts

    if (mode === 'image' && (!referenceImages || referenceImages.length === 0)) {
      return NextResponse.json(
        { error: 'Reference images are required for image-to-image mode' },
        { status: 400 }
      )
    }
    
    // Validate image sizes
    if (referenceImages && referenceImages.length > 0) {
      for (let i = 0; i < referenceImages.length; i++) {
        const imageSize = referenceImages[i].length
        console.log(`Reference image ${i + 1} size: ${(imageSize / 1024 / 1024).toFixed(2)}MB`)
        
        if (imageSize > 5 * 1024 * 1024) { // 5MB per image
          return NextResponse.json(
            { error: `Reference image ${i + 1} is too large (${(imageSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB per image.` },
            { status: 413 }
          )
        }
      }
    }

    // CREDIT CHECK: All users must have sufficient credits before generation starts
    const supabaseAdmin = getBestAuthSupabaseClient()
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Internal server error - database connection unavailable' },
        { status: 500 }
      )
    }
    
    // Check credits for authenticated user (required)
    console.log('[Generate API] Checking credits for authenticated user:', user.id)
    const pointsCheck = await checkPointsForGeneration(user.id, 'nanoBananaImage', supabaseAdmin)
    
    if (pointsCheck.usesPoints && !pointsCheck.canProceed) {
      return NextResponse.json(
        {
          error: pointsCheck.error || 'Insufficient credits. Please purchase credits to generate images.',
          insufficientPoints: true,
          currentBalance: pointsCheck.details?.currentBalance,
          requiredPoints: pointsCheck.details?.requiredPoints,
          shortfall: pointsCheck.details?.shortfall,
        },
        { status: 402 }
      )
    }
    
    // If user doesn't use points system, they must have a subscription with credits
    if (!pointsCheck.usesPoints) {
      return NextResponse.json(
        {
          error: 'No credits available. Please purchase a subscription or credits pack to generate images.',
          insufficientPoints: true,
        },
        { status: 402 }
      )
    }

    // Generate image using KIE API with nano-banana
    const kieApi = getKieApiService()
    
    // Map aspect ratio from dimensions
    let imageSize: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | undefined
    if (dimensions) {
      const aspectRatio = (dimensions.width / dimensions.height).toFixed(2)
      if (aspectRatio === '1.00') imageSize = '1:1'
      else if (aspectRatio === '0.56') imageSize = '9:16'
      else if (aspectRatio === '1.78') imageSize = '16:9'
      else if (aspectRatio === '0.75') imageSize = '3:4'
      else if (aspectRatio === '1.33') imageSize = '4:3'
    }
    
    // Create image generation task
    const taskResponse = await kieApi.generateImage({
      prompt,
      imageUrls: mode === 'image' && referenceImages?.length > 0 ? referenceImages : undefined,
      imageSize,
      outputFormat: 'png',
    })
    
    console.log('[Generate API] KIE task created:', taskResponse.data.taskId)
    
    // Poll for task completion
    const pollResult = await kieApi.pollTaskStatus(taskResponse.data.taskId)
    
    console.log('[Generate API] Image generated:', pollResult.imageUrl)
    
    // Use the generated image
    const generatedImages = [pollResult.imageUrl]

    // Deduct credits after successful generation (user is authenticated)
    try {
      // CRITICAL: Use service role client for deducting credits from bestauth_subscriptions
      const supabaseAdmin = getBestAuthSupabaseClient()
      
      if (!supabaseAdmin) {
        console.error('[Generate API] CRITICAL: Cannot deduct credits - no admin client available')
        // Return error - we should not allow generation without deducting credits
        return NextResponse.json(
          { error: 'Failed to process payment. Credits were not deducted. Please try again.' },
          { status: 500 }
        )
      }
      
      // Deduct credits for authenticated user
      console.log('[Generate API] Deducting credits for user:', user.id)
      
      const pointsDeduction = await deductPointsForGeneration(user.id, 'nanoBananaImage', supabaseAdmin, {
        taskId: taskResponse.data.taskId, // Include taskId in metadata for tracking
        prompt: prompt?.substring(0, 100),
        mode,
        platform,
      })
      
      if (pointsDeduction.success && pointsDeduction.transaction) {
        console.log('[Generate API] ✅ Deducted points for image generation:', {
          transactionId: pointsDeduction.transaction.id,
          amount: pointsDeduction.transaction.amount,
          balanceAfter: pointsDeduction.transaction.balance_after,
        })
      } else if (!pointsDeduction.success) {
        console.error('[Generate API] ❌ CRITICAL: Failed to deduct points:', pointsDeduction.error)
        // CRITICAL: Generation succeeded but payment failed - this should not happen
        // Return error to prevent free generation
        return NextResponse.json(
          { 
            error: pointsDeduction.error || 'Failed to deduct credits. Please contact support.',
            generationSucceeded: true,
            paymentFailed: true,
            warning: 'Image was generated but credits were not deducted. Please contact support immediately.'
          },
          { status: 402 }
        )
      } else {
        // This should not happen - success is true but no transaction
        console.error('[Generate API] ❌ CRITICAL: Deduction reported success but no transaction record:', pointsDeduction)
        return NextResponse.json(
          { 
            error: 'Credit deduction completed but transaction record is missing. Please contact support.',
            generationSucceeded: true,
            paymentFailed: true,
            warning: 'Image was generated but transaction record was not created.'
          },
          { status: 500 }
        )
      }

      // Track usage for analytics (optional, doesn't block response)
      if (authConfig.USE_BESTAUTH) {
        try {
          console.log('[Generate API] Tracking usage for user:', user.id)
          const result = await bestAuthSubscriptionService.incrementUsage(user.id, 1)
          if (result.success) {
            console.log('[Generate API] Usage tracked successfully')
          }
        } catch (usageError) {
          console.error('[Generate API] Failed to track usage (non-critical):', usageError)
          // Don't fail the request if usage tracking fails
        }
      }
    } catch (error) {
      console.error('[Generate API] Failed to deduct credits:', error)
      // Return error - we cannot allow generation without payment
      return NextResponse.json(
        { 
          error: 'Failed to process payment. Please try again or contact support.',
          generationSucceeded: false,
          paymentFailed: true
        },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      images: generatedImages,
      metadata: {
        model: 'nano-banana',
        prompt,
        mode,
        timestamp: new Date().toISOString(),
        taskId: taskResponse.data.taskId,
      },
    })
    
    return response
  } catch (error) {
    console.error('Generation error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate images'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      // Check for rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.'
      } else if (error.message.includes('API key') || error.message.includes('401')) {
        errorMessage = 'API authentication failed. Please check your API key.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Image generation timed out. Please try again.'
      }
      
      // Log full error details
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause,
        response: (error as any).response,
      })
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}

// Export POST handler with authentication required
export async function POST(request: NextRequest) {
  // REQUIRE AUTHENTICATION: All generation requires authentication
  if (authConfig.USE_BESTAUTH) {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to generate images.' },
        { status: 401 }
      )
    }
    // User is authenticated, add user to request and call handler
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = user
    return handler(authenticatedRequest)
  }
  
  // If BestAuth is disabled, still require authentication via middleware
  return NextResponse.json(
    { error: 'Authentication required. Please sign in to generate images.' },
    { status: 401 }
  )
}