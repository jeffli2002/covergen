import { NextRequest, NextResponse } from 'next/server'
import { createSoraTask, SoraApiError } from '@/lib/sora-api'
import { withAuth, AuthenticatedRequest } from '@/app/api/middleware/withAuth'
import { authConfig } from '@/config/auth.config'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { mode, prompt, image_url, aspect_ratio, quality } = body

    const generationMode = mode || 'text-to-video'
    
    // Get authenticated user
    const user = request.user
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for video generation' },
        { status: 401 }
      )
    }

    // Check video generation limits
    if (authConfig.USE_BESTAUTH) {
      const canGenerate = await bestAuthSubscriptionService.canUserGenerateVideo(user.id)
      const subscription = await bestAuthSubscriptionService.getUserSubscription(user.id)
      const videoUsageToday = await bestAuthSubscriptionService.getUserVideoUsageToday(user.id)
      
      if (!canGenerate) {
        const limits = subscription 
          ? bestAuthSubscriptionService.getSubscriptionLimits(subscription.tier as 'free' | 'pro' | 'pro_plus', subscription.is_trialing)
          : { videos: { daily: 1, monthly: 30 } }
        
        const tier = subscription?.tier || 'free'
        const upgradeMessage = tier === 'free' 
          ? 'Upgrade to Pro for 3 videos/day or Pro+ for 10 videos/day.'
          : tier === 'pro'
          ? 'Upgrade to Pro+ for 10 videos/day.'
          : 'You have reached your daily video limit.'
        
        return NextResponse.json(
          { 
            error: `Daily video generation limit reached (${videoUsageToday}/${limits.videos.daily} today). ${upgradeMessage} Or try again tomorrow.`,
            limitReached: true,
            currentTier: tier,
            usage: videoUsageToday,
            limit: limits.videos.daily
          },
          { status: 429 }
        )
      }
    }

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
      
      // Increment video usage count
      if (authConfig.USE_BESTAUTH && user) {
        await bestAuthSubscriptionService.incrementUserVideoUsage(user.id)
      }

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
      
      // Trim whitespace from URL
      const cleanImageUrl = image_url.trim()

      // Prompt is required for image-to-video according to API docs
      if (!prompt || typeof prompt !== 'string') {
        return NextResponse.json(
          { error: 'Prompt is required for image-to-video generation' },
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
          prompt,  // Required field comes first
          image_urls: [cleanImageUrl],
          aspect_ratio: aspect_ratio || 'landscape',
          quality: quality || 'standard'
        },
        'image-to-video'
      )
      
      // Increment video usage count
      if (authConfig.USE_BESTAUTH && user) {
        await bestAuthSubscriptionService.incrementUserVideoUsage(user.id)
      }

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

export const POST = withAuth(handler)
