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
      
      // Get monthly video usage
      const videoUsageThisMonth = await (async () => {
        try {
          const db = (await import('@/lib/bestauth/db')).db
          return await db.usage.getMonthlyUsageByType(user.id, 'video')
        } catch (error) {
          console.error('Error getting monthly video usage:', error)
          return 0
        }
      })()
      
      if (!canGenerate) {
        const limits = subscription 
          ? bestAuthSubscriptionService.getSubscriptionLimits(subscription.tier as 'free' | 'pro' | 'pro_plus', subscription.is_trialing)
          : { videos: { daily: 1, monthly: 5 } }
        
        const tier = subscription?.tier || 'free'
        const isTrialing = subscription?.is_trialing || false
        const isPaidUser = tier === 'pro' || tier === 'pro_plus'
        
        let errorMessage = ''
        let limitType = ''
        
        if (isTrialing) {
          // Trial users - check both daily and total trial limits
          const dailyLimitHit = videoUsageToday >= limits.videos.daily
          errorMessage = dailyLimitHit
            ? `Daily trial video limit reached (${videoUsageToday}/${limits.videos.daily} videos today). Try again tomorrow or upgrade to Pro plan!`
            : `Trial video limit reached (${videoUsageThisMonth}/${limits.videos.monthly} videos used). Upgrade to Pro plan to continue!`
          limitType = dailyLimitHit ? 'daily' : 'trial'
        } else if (isPaidUser) {
          // Paid users (Pro/Pro+) - ONLY check monthly limit
          const { getSubscriptionPlans } = require('@/lib/subscription-plans')
          const plans = getSubscriptionPlans()
          const proPlusPlan = plans.find((p: any) => p.id === 'pro_plus')
          const upgradeMessage = tier === 'pro' && proPlusPlan
            ? `Upgrade to Pro+ for ${proPlusPlan.limits.videos.monthly} videos/month.` 
            : 'Try again next month.'
          errorMessage = `Monthly video limit reached (${videoUsageThisMonth}/${limits.videos.monthly} videos this month). ${upgradeMessage}`
          limitType = 'monthly'
        } else {
          // Free users - check both daily and monthly
          const { getSubscriptionPlans } = require('@/lib/subscription-plans')
          const plans = getSubscriptionPlans()
          const proPlan = plans.find((p: any) => p.id === 'pro')
          const proVideoLimit = proPlan?.limits.videos.monthly || 30
          
          const dailyLimitHit = videoUsageToday >= limits.videos.daily
          const monthlyLimitHit = videoUsageThisMonth >= limits.videos.monthly
          
          if (dailyLimitHit && monthlyLimitHit) {
            errorMessage = `Both daily (${videoUsageToday}/${limits.videos.daily}) and monthly (${videoUsageThisMonth}/${limits.videos.monthly}) video limits reached. Upgrade to Pro for ${proVideoLimit} videos/month or try again tomorrow.`
            limitType = 'both'
          } else if (dailyLimitHit) {
            errorMessage = `Daily video limit reached (${videoUsageToday}/${limits.videos.daily} videos today). Upgrade to Pro for ${proVideoLimit} videos/month or try again tomorrow.`
            limitType = 'daily'
          } else if (monthlyLimitHit) {
            errorMessage = `Monthly video limit reached (${videoUsageThisMonth}/${limits.videos.monthly} videos this month). Upgrade to Pro for ${proVideoLimit} videos/month or try again next month.`
            limitType = 'monthly'
          } else {
            errorMessage = `Video generation limit reached. Upgrade to Pro for more videos.`
            limitType = 'unknown'
          }
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            limitReached: true,
            limitType: limitType,
            currentTier: tier,
            dailyUsage: videoUsageToday,
            dailyLimit: limits.videos.daily,
            monthlyUsage: videoUsageThisMonth,
            monthlyLimit: limits.videos.monthly
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
      
      // Note: Usage tracking moved to query endpoint on successful completion
      // This ensures users are only charged for successful video generations

      return NextResponse.json({ taskId, userId: user.id })

    } else if (generationMode === 'image-to-video') {
      // Image-to-video validation
      if (!image_url || typeof image_url !== 'string') {
        console.error('[Sora API] image-to-video validation failed:', { image_url, type: typeof image_url })
        return NextResponse.json(
          { error: 'image_url is required for image-to-video generation' },
          { status: 400 }
        )
      }
      
      // Clean and normalize the image URL
      const cleanImageUrl = image_url.trim()
      
      console.log('[Sora API] Received image URL:', {
        original: image_url,
        cleaned: cleanImageUrl,
        length: cleanImageUrl.length,
        hasWhitespace: cleanImageUrl !== image_url,
        protocol: cleanImageUrl.substring(0, 8),
        domain: new URL(cleanImageUrl).hostname,
        fullParsedUrl: new URL(cleanImageUrl)
      })
      
      // Validate image URL is accessible before sending to Sora API
      // This prevents generic "policy violation" errors when image is not accessible
      // Use retry logic to handle transient Cloudinary issues
      let validationSuccess = false
      let lastError: Error | null = null
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[Sora API] Validating image URL (attempt ${attempt}/3):`, cleanImageUrl)
          
          // Use GET with range to actually fetch some bytes (more reliable than HEAD)
          const imageCheckResponse = await fetch(cleanImageUrl, { 
            method: 'GET',
            headers: {
              'Range': 'bytes=0-1023' // Fetch first 1KB to verify it's really accessible
            },
            signal: AbortSignal.timeout(15000) // 15 second timeout
          })
          
          if (!imageCheckResponse.ok && imageCheckResponse.status !== 206) {
            throw new Error(`HTTP ${imageCheckResponse.status}`)
          }
          
          const contentType = imageCheckResponse.headers.get('content-type')
          if (contentType && !contentType.startsWith('image/')) {
            throw new Error(`Invalid content type: ${contentType}`)
          }
          
          // Verify we got actual data
          const buffer = await imageCheckResponse.arrayBuffer()
          if (buffer.byteLength === 0) {
            throw new Error('Empty response')
          }
          
          console.log(`[Sora API] Image URL validation passed (${buffer.byteLength} bytes verified)`)
          validationSuccess = true
          break
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))
          console.error(`[Sora API] Validation attempt ${attempt} failed:`, lastError.message)
          
          if (attempt < 3) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 1000))
          }
        }
      }
      
      if (!validationSuccess) {
        console.error('[Sora API] Image URL validation failed after 3 attempts:', lastError)
        
        if (lastError?.name === 'TimeoutError' || lastError?.message.includes('timeout')) {
          return NextResponse.json(
            { 
              error: 'Image URL validation timeout after 3 attempts. The image hosting service is too slow or unreliable. Please try uploading the image again or use a different image.',
              details: 'Image must be accessible and respond within 15 seconds'
            },
            { status: 400 }
          )
        }
        
        return NextResponse.json(
          { 
            error: `Image URL is not accessible: ${lastError?.message || 'Unknown error'}. Please ensure the image is publicly available and try again.`,
            details: 'The Sora API requires images to be hosted at publicly accessible URLs'
          },
          { status: 400 }
        )
      }

      // COPYRIGHT VALIDATION - Prevent API charges for doomed-to-fail requests
      // This is critical because Sora/OpenAI blocks images with faces, logos, watermarks
      console.log('[Sora API] Running copyright validation to prevent API failures')
      
      try {
        const { validateCopyright } = await import('@/lib/validation/validators/copyright-validator')
        const { getValidationConfig } = await import('@/lib/validation/config')
        
        // Get validation config based on user's subscription tier
        const subscription = await bestAuthSubscriptionService.getUserSubscription(user.id)
        const validationConfig = getValidationConfig(subscription?.tier || 'free')
        
        // Only run if copyright validation is enabled
        if (validationConfig.enabled && validationConfig.layers.copyright) {
          const copyrightResult = await validateCopyright(cleanImageUrl, validationConfig)
          
          if (!copyrightResult.valid) {
            console.error('[Sora API] Copyright validation FAILED:', copyrightResult.code)
            return NextResponse.json(
              { 
                error: copyrightResult.error,
                details: copyrightResult.details,
                suggestion: copyrightResult.suggestion,
                code: copyrightResult.code,
                validationFailed: true, // Flag for analytics
              },
              { status: 400 }
            )
          }
          
          console.log('[Sora API] ✅ Copyright validation passed')
        } else {
          console.log('[Sora API] Copyright validation disabled, skipping')
        }
      } catch (validationError) {
        console.error('[Sora API] Validation error (allowing request to proceed):', validationError)
        // On validation error, allow request to proceed (fail-safe)
      }

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

      console.log('[Sora API] Waiting 2 seconds for global CDN propagation...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      const taskId = await createSoraTask(
        {
          prompt,
          image_urls: [cleanImageUrl],
          aspect_ratio: aspect_ratio || 'landscape',
          quality: quality || 'standard'
        },
        'image-to-video'
      )
      
      // Note: Usage tracking moved to query endpoint on successful completion
      // This ensures users are only charged for successful video generations

      return NextResponse.json({ taskId, userId: user.id })

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
