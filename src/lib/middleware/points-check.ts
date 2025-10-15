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
  const pointsService = createPointsService(supabase)

  try {
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
  const pointsService = createPointsService(supabase)

  try {
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
