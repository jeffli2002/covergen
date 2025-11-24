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
    
    // Get session ID for unauthenticated users
    const sessionInfo = user ? null : await getOrCreateSessionId()
    const sessionId = sessionInfo?.sessionId || null
    
    // Check generation limits
    let limitStatus = null
    
    if (user) {
      // Check current generation limit for authenticated users
      
      // Use BestAuth if enabled
      if (authConfig.USE_BESTAUTH) {
        console.log('[Generate API] Checking BestAuth limits for user:', user.id)
        
        // Check if user can generate (checks BOTH daily AND monthly limits)
        const canGenerate = await bestAuthSubscriptionService.canUserGenerateImage(user.id)
        const subscription = await bestAuthSubscriptionService.getUserSubscription(user.id)
        const usageToday = await bestAuthSubscriptionService.getUserUsageToday(user.id)
        const usageThisMonth = await bestAuthSubscriptionService.getUserUsageThisMonth(user.id)
        
        if (subscription) {
          const config = getSubscriptionConfig()
          const tier = subscription.tier as 'free' | 'pro' | 'pro_plus'
          const limits = bestAuthSubscriptionService.getSubscriptionLimits(tier, subscription.is_trialing)
          
          limitStatus = {
            can_generate: canGenerate,
            daily_usage: usageToday,
            daily_limit: limits.daily,
            monthly_usage: usageThisMonth,
            monthly_limit: limits.monthly,
            is_trial: subscription.is_trialing,
            subscription_tier: subscription.tier,
            trial_ends_at: subscription.trial_days_remaining > 0 ? new Date(Date.now() + subscription.trial_days_remaining * 24 * 60 * 60 * 1000).toISOString() : null,
            remaining_daily: Math.max(0, limits.daily - usageToday),
            remaining_monthly: Math.max(0, limits.monthly - usageThisMonth),
            trial_usage: subscription.is_trialing ? usageThisMonth : 0,
            trial_limit: subscription.is_trialing ? limits.monthly : null,
            remaining_trial: subscription.is_trialing ? Math.max(0, limits.monthly - usageThisMonth) : null
          }
          
          console.log('[Generate API] BestAuth limit status:', limitStatus)
        }
      } else {
        // Fallback to Supabase
        limitStatus = await checkGenerationLimit(user.id)
      }
      
      if (!limitStatus) {
        console.error('[Generate API] Failed to check generation limit for user:', user.id)
        
        // Try to get subscription info as fallback
        try {
          const subInfo = await getUserSubscriptionInfo(user.id)
          console.log('[Generate API] Subscription info fallback:', subInfo)
          
          // If user has a trial/paid subscription, allow generation with warning
          if (subInfo.subscription_tier !== 'free' && (subInfo.is_trial || subInfo.subscription_tier === 'pro' || subInfo.subscription_tier === 'pro_plus')) {
            console.warn('[Generate API] Allowing generation for trial/paid user despite limit check failure')
            // Create a temporary limit status to allow generation
            limitStatus = {
              monthly_usage: 0,
              monthly_limit: 120,
              daily_usage: 0,
              daily_limit: 4,
              trial_usage: 0,
              trial_limit: 12, // 3-day trial with 4/day
              can_generate: true,
              is_trial: subInfo.is_trial,
              trial_ends_at: subInfo.trial_ends_at,
              subscription_tier: subInfo.subscription_tier,
              remaining_monthly: 120,
              remaining_trial: 12,
              remaining_daily: 4
            }
          } else {
            // For free users, check their actual usage
            console.log('[Generate API] Checking usage for free user manually')
            
            try {
              // Get current date info
              const today = new Date()
              const dateKey = today.toISOString().split('T')[0]
              const monthKey = today.toISOString().substring(0, 7)
              
              // Try to get usage data directly
              const { data: usageData, error: usageError } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', user.id)
                .eq('date_key', dateKey)
                .single()
              
              // Get subscription config for limits
              const config = getSubscriptionConfig()
              const dailyLimit = config.limits.free.daily
              
              if (!usageError && usageData) {
                // Check if they've exceeded daily limit
                if (usageData.daily_count >= dailyLimit) {
                  return NextResponse.json(
                    { 
                      error: `Daily generation limit reached (${usageData.daily_count}/${dailyLimit} today). Please try it tomorrow or upgrade to Pro plan.`,
                      limit_reached: true,
                      daily_usage: usageData.daily_count,
                      daily_limit: dailyLimit,
                      subscription_tier: 'free',
                      is_trial: false,
                      remaining_daily: 0
                    },
                    { status: 429 }
                  )
                }
                
                // If they haven't exceeded but we're here, allow generation with current usage
                return NextResponse.json(
                  { 
                    error: `Generation limit check failed. You have used ${usageData.daily_count}/${dailyLimit} today.`,
                    limit_reached: false,
                    daily_usage: usageData.daily_count,
                    daily_limit: dailyLimit,
                    subscription_tier: 'free',
                    is_trial: false,
                    remaining_daily: Math.max(0, dailyLimit - usageData.daily_count)
                  },
                  { status: 200 } // Allow generation to proceed
                )
              }
              
              // If we can't determine usage at all, allow generation but warn
              console.warn('[Generate API] Could not determine usage, allowing generation as fallback for free user')
              // Create a temporary limit status to allow generation
              limitStatus = {
                monthly_usage: 0,
                monthly_limit: config.limits.free.monthly,
                daily_usage: 0,
                daily_limit: dailyLimit,
                trial_usage: 0,
                trial_limit: null,
                can_generate: true,
                is_trial: false,
                trial_ends_at: null,
                subscription_tier: 'free',
                remaining_monthly: config.limits.free.monthly,
                remaining_trial: null,
                remaining_daily: dailyLimit
              }
            } catch (err) {
              console.error('[Generate API] Error checking free user usage:', err)
              // Get config for daily limit
              const config = getSubscriptionConfig()
              const dailyLimit = config.limits.free.daily
              // Allow generation but log the error for debugging
              console.warn('[Generate API] Usage check failed, allowing generation as fallback for free user')
              limitStatus = {
                monthly_usage: 0,
                monthly_limit: config.limits.free.monthly,
                daily_usage: 0,
                daily_limit: dailyLimit,
                trial_usage: 0,
                trial_limit: null,
                can_generate: true,
                is_trial: false,
                trial_ends_at: null,
                subscription_tier: 'free',
                remaining_monthly: config.limits.free.monthly,
                remaining_trial: null,
                remaining_daily: dailyLimit
              }
            }
          }
        } catch (fallbackError) {
          console.error('[Generate API] Fallback subscription check failed:', fallbackError)
          const config = getSubscriptionConfig()
          const dailyLimit = config.limits.free.daily
          // Allow generation as ultimate fallback
          console.warn('[Generate API] All checks failed, allowing generation as ultimate fallback')
          limitStatus = {
            monthly_usage: 0,
            monthly_limit: config.limits.free.monthly,
            daily_usage: 0,
            daily_limit: dailyLimit,
            trial_usage: 0,
            trial_limit: null,
            can_generate: true,
            is_trial: false,
            trial_ends_at: null,
            subscription_tier: 'free',
            remaining_monthly: config.limits.free.monthly,
            remaining_trial: null,
            remaining_daily: dailyLimit
          }
        }
      }
      
      // If user has reached their limit, return error
      if (!limitStatus.can_generate) {
        let errorMessage = ''
        let limitType = ''
        
        const tier = limitStatus.subscription_tier
        const isPaidUser = tier === 'pro' || tier === 'pro_plus'
        
        if (limitStatus.is_trial) {
          // Trial users
          const dailyLimitHit = limitStatus.daily_usage >= limitStatus.daily_limit
          const trialLimitHit = limitStatus.trial_usage >= limitStatus.trial_limit
          
          if (dailyLimitHit) {
            errorMessage = `Daily trial limit reached (${limitStatus.daily_usage}/${limitStatus.daily_limit} images today). Try again tomorrow or upgrade to Pro plan!`
            limitType = 'daily'
          } else if (trialLimitHit) {
            errorMessage = `Trial limit reached (${limitStatus.trial_usage}/${limitStatus.trial_limit} images used). Upgrade to Pro plan to continue!`
            limitType = 'trial'
          } else {
            errorMessage = `Trial limit reached. Upgrade to Pro plan to continue!`
            limitType = 'trial'
          }
        } else if (isPaidUser) {
          // Paid users (Pro/Pro+) - Use credit system (this shouldn't happen if credits are properly checked)
          const upgradeMessage = tier === 'pro' 
            ? 'Upgrade to Pro+ for more credits or purchase a credits pack.' 
            : 'Purchase a credits pack to continue generating images.'
          errorMessage = `You've run out of credits. ${upgradeMessage}`
          limitType = 'credits'
        } else {
          // Free users - check both daily and monthly
          const config = getSubscriptionConfig()
          const dailyLimitHit = limitStatus.daily_usage >= limitStatus.daily_limit
          const monthlyLimitHit = limitStatus.monthly_usage >= limitStatus.monthly_limit
          
          if (dailyLimitHit && monthlyLimitHit) {
            errorMessage = `Both daily (${limitStatus.daily_usage}/${limitStatus.daily_limit}) and monthly (${limitStatus.monthly_usage}/${limitStatus.monthly_limit}) limits reached. Upgrade to Pro for ${config.limits.pro.monthly} images/month or try again tomorrow.`
            limitType = 'both'
          } else if (dailyLimitHit) {
            errorMessage = `Daily limit reached (${limitStatus.daily_usage}/${limitStatus.daily_limit} images today). Upgrade to Pro for ${config.limits.pro.monthly} images/month or try again tomorrow.`
            limitType = 'daily'
          } else if (monthlyLimitHit) {
            errorMessage = `Monthly limit reached (${limitStatus.monthly_usage}/${limitStatus.monthly_limit} images this month). Upgrade to Pro for ${config.limits.pro.monthly} images/month or try again next month.`
            limitType = 'monthly'
          } else {
            errorMessage = `Generation limit reached. Upgrade to Pro for more images.`
            limitType = 'unknown'
          }
        }
          
        return NextResponse.json(
          { 
            error: errorMessage,
            limit_reached: true,
            limit_type: limitType,
            daily_usage: limitStatus.daily_usage,
            daily_limit: limitStatus.daily_limit,
            monthly_usage: limitStatus.monthly_usage,
            monthly_limit: limitStatus.monthly_limit,
            trial_usage: limitStatus.trial_usage,
            trial_limit: limitStatus.trial_limit,
            subscription_tier: limitStatus.subscription_tier,
            is_trial: limitStatus.is_trial,
            trial_ends_at: limitStatus.trial_ends_at,
            remaining_daily: limitStatus.remaining_daily,
            remaining_monthly: limitStatus.remaining_monthly
          },
          { status: 429 }
        )
      }
    } else if (sessionId) {
      // Check limits for unauthenticated users by session
      console.log('[Generate API] Checking limits for session:', sessionId)
      
      if (authConfig.USE_BESTAUTH) {
        const canGenerate = await bestAuthSubscriptionService.canSessionGenerate(sessionId)
        const usageToday = await bestAuthSubscriptionService.getSessionUsageToday(sessionId)
        const config = getSubscriptionConfig()
        const dailyLimit = config.limits.free.daily
        
        limitStatus = {
          can_generate: canGenerate,
          daily_usage: usageToday,
          daily_limit: dailyLimit,
          monthly_usage: usageToday, // For free tier, we only track daily
          monthly_limit: config.limits.free.monthly,
          is_trial: false,
          subscription_tier: 'free',
          trial_ends_at: null,
          remaining_daily: Math.max(0, dailyLimit - usageToday),
          remaining_monthly: Math.max(0, config.limits.free.monthly - usageToday),
          trial_usage: 0,
          trial_limit: null,
          remaining_trial: null
        }
        
        console.log('[Generate API] Session limit status:', limitStatus)
        
        // If session has reached their limit, return error
        if (!limitStatus.can_generate) {
          return NextResponse.json(
            { 
              error: `Daily generation limit reached (${limitStatus.daily_usage}/${limitStatus.daily_limit} today). Please try again tomorrow or sign in to get more generations.`,
              limit_reached: true,
              daily_usage: limitStatus.daily_usage,
              daily_limit: limitStatus.daily_limit,
              subscription_tier: 'free',
              is_trial: false,
              remaining_daily: 0
            },
            { status: 429 }
          )
        }
      } else {
        // For non-BestAuth, allow generation (no tracking)
        const config = getSubscriptionConfig()
        limitStatus = {
          can_generate: true,
          daily_usage: 0,
          daily_limit: config.limits.free.daily,
          monthly_usage: 0,
          monthly_limit: config.limits.free.monthly,
          is_trial: false,
          subscription_tier: 'free',
          trial_ends_at: null,
          remaining_daily: config.limits.free.daily,
          remaining_monthly: config.limits.free.monthly,
          trial_usage: 0,
          trial_limit: null,
          remaining_trial: null
        }
      }
    }

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

    if (user) {
      // CRITICAL FIX: Use service role client for checking credits in bestauth_subscriptions
      const supabaseAdmin = getBestAuthSupabaseClient()
      
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Internal server error - database connection unavailable' },
          { status: 500 }
        )
      }
      
      // For BestAuth users, use the BestAuth user ID directly (no need to resolve to Supabase ID)
      console.log('[Generate API] Checking credits for BestAuth user:', user.id)
      const pointsCheck = await checkPointsForGeneration(user.id, 'nanoBananaImage', supabaseAdmin)
      
      if (pointsCheck.usesPoints && !pointsCheck.canProceed) {
        return NextResponse.json(
          {
            error: pointsCheck.error,
            insufficientPoints: true,
            currentBalance: pointsCheck.details?.currentBalance,
            requiredPoints: pointsCheck.details?.requiredPoints,
            shortfall: pointsCheck.details?.shortfall,
          },
          { status: 402 }
        )
      }
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

    // Increment generation count after successful generation
    if (user) {
      // Increment for authenticated users
      try {
        // CRITICAL FIX: Use service role client for deducting credits from bestauth_subscriptions
        const supabaseAdmin = getBestAuthSupabaseClient()
        
        if (!supabaseAdmin) {
          console.error('[Generate API] CRITICAL: Cannot deduct credits - no admin client available')
        } else {
          // For BestAuth users, use the BestAuth user ID directly (no need to resolve to Supabase ID)
          console.log('[Generate API] Deducting credits for BestAuth user:', user.id)
          
          const pointsDeduction = await deductPointsForGeneration(user.id, 'nanoBananaImage', supabaseAdmin, {
            prompt: prompt?.substring(0, 100),
            mode,
            platform,
          })
          
          if (pointsDeduction.success && pointsDeduction.transaction) {
            console.log('[Generate API] Deducted points for image generation:', pointsDeduction.transaction)
          } else if (!pointsDeduction.success) {
            console.error('[Generate API] Failed to deduct points:', pointsDeduction.error)
          }
        }

        // Use BestAuth increment if enabled, otherwise fallback to Supabase
        if (authConfig.USE_BESTAUTH) {
          console.log('[Generate API] Incrementing usage for BestAuth user:', user.id)
          const result = await bestAuthSubscriptionService.incrementUsage(user.id, 1)
          if (result.success) {
            console.log('[Generate API] Usage incremented successfully, new count:', result.newCount)
          } else {
            console.error('[Generate API] Failed to increment BestAuth usage')
          }
        } else {
          // Fallback to Supabase increment
          const subInfo = await getUserSubscriptionInfo(user.id)
          await incrementGenerationCount(user.id, subInfo.subscription_tier)
        }
      } catch (error) {
        console.error('Failed to increment generation count:', error)
        // Continue with successful response even if counting fails
      }
    } else if (sessionId && authConfig.USE_BESTAUTH) {
      // Increment for unauthenticated users with session
      try {
        console.log('[Generate API] Incrementing usage for session:', sessionId)
        console.log('[Generate API] Session info:', sessionInfo)
        const result = await bestAuthSubscriptionService.incrementSessionUsage(sessionId, 1)
        console.log('[Generate API] Increment result:', result)
        if (result.success) {
          console.log('[Generate API] Session usage incremented successfully, new count:', result.newCount)
        } else {
          console.error('[Generate API] Failed to increment session usage - result:', result)
        }
      } catch (error) {
        console.error('Failed to increment session generation count:', error)
        // Continue with successful response even if counting fails
      }
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
    
    // If a new session was created, ensure the cookie is set in the response
    if (sessionInfo?.isNew && sessionId) {
      const { getSessionCookieOptions } = await import('@/lib/session-utils')
      const cookieOptions = getSessionCookieOptions()
      response.cookies.set(cookieOptions.name, sessionId, {
        ...cookieOptions,
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path
      })
    }
    
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

// Export POST handler
export async function POST(request: NextRequest) {
  // Check if BestAuth is enabled
  if (authConfig.USE_BESTAUTH) {
    // Try to get authenticated user
    const user = await getAuthenticatedUser(request)
    if (user) {
      // User is authenticated, add user to request and call handler
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = user
      return handler(authenticatedRequest)
    }
  }
  
  // For unauthenticated requests or when BestAuth is disabled
  // Create a dummy request with no user
  const unauthenticatedRequest = request as AuthenticatedRequest
  unauthenticatedRequest.user = null
  return handler(unauthenticatedRequest)
}