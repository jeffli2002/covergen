/**
 * Points Check Middleware
 * 
 * Validates that users have sufficient points before generation
 * Handles both rate-limited free users and points-based paid users
 */

import { createPointsService } from '@/lib/services/points-service'
import type { GenerationType } from '@/config/subscription'
import { SUBSCRIPTION_CONFIG } from '@/config/subscription'

export interface PointsCheckResult {
  canProceed: boolean
  usesPoints: boolean
  error?: string
  details?: {
    currentBalance: number
    requiredPoints: number
    shortfall: number
  }
}

export async function checkPointsForGeneration(
  userId: string,
  generationType: GenerationType,
  supabase: any
): Promise<PointsCheckResult> {
  try {
    // PRIORITY 1: Check BestAuth subscriptions table first
    const { data: subscription } = await supabase
      .from('bestauth_subscriptions')
      .select('points_balance, tier')
      .eq('user_id', userId)
      .maybeSingle()

    if (subscription && typeof subscription.points_balance === 'number') {
      // User has credits in BestAuth system
      const creditCost = SUBSCRIPTION_CONFIG.generationCosts[generationType]
      const currentBalance = subscription.points_balance

      console.log(`[PointsCheck] BestAuth user:`, {
        userId,
        generationType,
        creditCost,
        currentBalance,
        tier: subscription.tier,
        canAfford: currentBalance >= creditCost
      })

      if (currentBalance < creditCost) {
        return {
          canProceed: false,
          usesPoints: true,
          error: `Insufficient credits. You need ${creditCost} credits but only have ${currentBalance} credits.`,
          details: {
            currentBalance,
            requiredPoints: creditCost,
            shortfall: creditCost - currentBalance,
          },
        }
      }

      return {
        canProceed: true,
        usesPoints: true,
        details: {
          currentBalance,
          requiredPoints: creditCost,
          shortfall: 0,
        },
      }
    }

    // FALLBACK: Check legacy points system for Supabase users
    console.log('[PointsCheck] No BestAuth subscription found, trying legacy points system')
    const pointsService = createPointsService(supabase)
    const balance = await pointsService.getBalance(userId)

    if (!balance || balance.balance === 0) {
      return {
        canProceed: true,
        usesPoints: false,
      }
    }

    const affordCheck = await pointsService.canAffordGeneration(userId, generationType)

    if (!affordCheck.canAfford) {
      const pointsCost = SUBSCRIPTION_CONFIG.generationCosts[generationType]
      
      return {
        canProceed: false,
        usesPoints: true,
        error: `Insufficient points. You need ${pointsCost} points but only have ${affordCheck.currentBalance} points.`,
        details: {
          currentBalance: affordCheck.currentBalance,
          requiredPoints: affordCheck.requiredPoints,
          shortfall: affordCheck.shortfall,
        },
      }
    }

    return {
      canProceed: true,
      usesPoints: true,
      details: {
        currentBalance: affordCheck.currentBalance,
        requiredPoints: affordCheck.requiredPoints,
        shortfall: 0,
      },
    }
  } catch (error) {
    console.error('[PointsCheck] Error checking points:', error)
    return {
      canProceed: true,
      usesPoints: false,
    }
  }
}

export async function deductPointsForGeneration(
  userId: string,
  generationType: GenerationType,
  supabase: any,
  metadata?: Record<string, any>
): Promise<{
  success: boolean
  error?: string
  transaction?: any
}> {
  try {
    // PRIORITY 1: Try BestAuth subscriptions table first
    const { data: subscription } = await supabase
      .from('bestauth_subscriptions')
      .select('points_balance, points_lifetime_spent, tier')
      .eq('user_id', userId)
      .maybeSingle()

    if (subscription && typeof subscription.points_balance === 'number') {
      // User has credits in BestAuth system - deduct directly
      const creditCost = SUBSCRIPTION_CONFIG.generationCosts[generationType]
      const currentBalance = subscription.points_balance
      const currentSpent = subscription.points_lifetime_spent ?? 0

      console.log(`[PointsDeduct] BestAuth user credit check:`, {
        userId,
        generationType,
        creditCost,
        currentBalance,
        tier: subscription.tier
      })

      // Check if user has enough credits
      if (currentBalance < creditCost) {
        console.error(`[PointsDeduct] Insufficient credits: need ${creditCost}, have ${currentBalance}`)
        return {
          success: false,
          error: `Insufficient credits. You need ${creditCost} credits but only have ${currentBalance} credits.`,
        }
      }

      // Create human-readable description
      const getGenerationDescription = (type: string, meta?: Record<string, any>) => {
        const typeNames: Record<string, string> = {
          nanoBananaImage: 'Image generation',
          sora2Video: 'Sora 2 video generation',
          sora2ProVideo: 'Sora 2 Pro video generation',
        }
        
        const baseName = typeNames[type] || type
        
        if (meta?.prompt) {
          const truncatedPrompt = meta.prompt.substring(0, 50)
          return `${baseName}: "${truncatedPrompt}${meta.prompt.length > 50 ? '...' : ''}"`
        }
        
        return baseName
      }

      // CRITICAL FIX: Use atomic database function to ensure transaction record is created
      // This ensures that credit deduction and transaction recording happen atomically
      // If transaction record creation fails, the entire operation is rolled back
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'deduct_points_for_generation',
          {
            p_user_id: userId,
            p_generation_type: generationType,
            p_credit_cost: creditCost,
            p_metadata: metadata || {},
            p_description: getGenerationDescription(generationType, metadata),
          }
        )

        if (rpcError) {
          console.error('[PointsDeduct] ❌ RPC call failed:', rpcError)
          return {
            success: false,
            error: `Failed to deduct credits atomically: ${rpcError.message}`,
          }
        }

        if (rpcResult && rpcResult.success) {
          console.log('[PointsDeduct] ✅ Atomic deduction successful via RPC')
          console.log('[PointsDeduct]    Transaction ID:', rpcResult.transaction_id)
          console.log('[PointsDeduct]    Previous balance:', rpcResult.previous_balance)
          console.log('[PointsDeduct]    New balance:', rpcResult.new_balance)
          
          return {
            success: true,
            transaction: {
              id: rpcResult.transaction_id,
              user_id: userId,
              amount: -creditCost,
              balance_before: rpcResult.previous_balance,
              balance_after: rpcResult.new_balance,
              transaction_type: 'generation_deduction',
              generation_type: generationType,
              description: getGenerationDescription(generationType, metadata),
              metadata,
            },
          }
        } else {
          // RPC returned but success is false
          console.error('[PointsDeduct] ❌ RPC returned failure:', rpcResult)
          return {
            success: false,
            error: rpcResult?.error || 'RPC call returned failure',
          }
        }
      } catch (rpcException: any) {
        console.error('[PointsDeduct] ❌ Exception during RPC call:', rpcException)
        return {
          success: false,
          error: `RPC exception: ${rpcException.message}`,
        }
      }
    }

    // FALLBACK: Try legacy points system for Supabase users
    console.log('[PointsDeduct] No BestAuth subscription found, trying legacy points system')
    const pointsService = createPointsService(supabase)
    const result = await pointsService.deductPointsForGeneration(userId, generationType, metadata)

    if (!result.success && result.error === 'insufficient_points') {
      return {
        success: false,
        error: result.message || 'Insufficient points',
      }
    }

    if (result.used_points && result.transaction) {
      return {
        success: true,
        transaction: result.transaction,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('[PointsDeduct] Error deducting points:', error)
    return {
      success: false,
      error: 'Failed to deduct points',
    }
  }
}
