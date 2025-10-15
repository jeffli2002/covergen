/**
 * Points Management Service
 * 
 * Handles all points-related operations including:
 * - Adding/deducting points
 * - Checking balances
 * - Transaction history
 * - Generation cost validation
 */

import { SUBSCRIPTION_CONFIG, type GenerationType } from '@/config/subscription'

export type TransactionType =
  | 'signup_bonus'
  | 'subscription_grant'
  | 'purchase'
  | 'generation_cost'
  | 'refund'
  | 'admin_adjustment'

export interface PointsBalance {
  balance: number
  lifetime_earned: number
  lifetime_spent: number
  tier: string
  user_id: string
}

export interface PointsTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  transaction_type: TransactionType
  generation_type?: GenerationType
  description?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AddPointsParams {
  userId: string
  amount: number
  transactionType: TransactionType
  description?: string
  generationType?: GenerationType
  subscriptionId?: string
  stripePaymentIntentId?: string
  metadata?: Record<string, any>
}

export interface DeductPointsResult {
  success: boolean
  used_points: boolean
  error?: string
  message?: string
  current_balance?: number
  required?: number
  shortfall?: number
  transaction?: any
}

export class PointsService {
  private supabase

  constructor(supabase: any) {
    if (!supabase) {
      throw new Error('PointsService requires a Supabase client. Pass it via constructor.')
    }
    this.supabase = supabase
  }

  private async getClient() {
    return this.supabase
  }

  async getBalance(userId: string): Promise<PointsBalance | null> {
    const supabase = await this.getClient()

    const { data, error } = await supabase.rpc('get_points_balance', {
      p_user_id: userId,
    })

    if (error) {
      console.error('[PointsService] Error getting balance:', error)
      throw new Error(`Failed to get points balance: ${error.message}`)
    }

    return data as PointsBalance
  }

  async addPoints(params: AddPointsParams): Promise<{
    success: boolean
    transaction_id: string
    previous_balance: number
    amount: number
    new_balance: number
    user_id: string
  }> {
    const supabase = await this.getClient()

    const { data, error } = await supabase.rpc('add_points', {
      p_user_id: params.userId,
      p_amount: params.amount,
      p_transaction_type: params.transactionType,
      p_description: params.description || null,
      p_generation_type: params.generationType || null,
      p_subscription_id: params.subscriptionId || null,
      p_stripe_payment_intent_id: params.stripePaymentIntentId || null,
      p_metadata: params.metadata || {},
    })

    if (error) {
      console.error('[PointsService] Error adding points:', error)
      throw new Error(`Failed to add points: ${error.message}`)
    }

    return data
  }

  async deductPointsForGeneration(
    userId: string,
    generationType: GenerationType,
    metadata?: Record<string, any>
  ): Promise<DeductPointsResult> {
    const pointsCost = SUBSCRIPTION_CONFIG.generationCosts[generationType]
    const supabase = await this.getClient()

    const { data, error } = await supabase.rpc('deduct_generation_points', {
      p_user_id: userId,
      p_generation_type: generationType,
      p_points_cost: pointsCost,
      p_metadata: metadata || {},
    })

    if (error) {
      console.error('[PointsService] Error deducting points:', error)
      throw new Error(`Failed to deduct points: ${error.message}`)
    }

    return data as DeductPointsResult
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PointsTransaction[]> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[PointsService] Error getting transaction history:', error)
      throw new Error(`Failed to get transaction history: ${error.message}`)
    }

    return data as PointsTransaction[]
  }

  async grantSignupBonus(userId: string): Promise<void> {
    const bonusPoints = SUBSCRIPTION_CONFIG.free.signupBonusPoints

    if (bonusPoints <= 0) {
      return
    }

    try {
      await this.addPoints({
        userId,
        amount: bonusPoints,
        transactionType: 'signup_bonus',
        description: `Welcome bonus: ${bonusPoints} points`,
        metadata: {
          source: 'signup',
          bonus_type: 'welcome',
        },
      })

      console.log(`[PointsService] Granted ${bonusPoints} signup bonus points to user ${userId}`)
    } catch (error) {
      console.error('[PointsService] Error granting signup bonus:', error)
      throw error
    }
  }

  async grantSubscriptionPoints(
    userId: string,
    tier: 'pro' | 'pro_plus',
    cycle: 'monthly' | 'yearly',
    subscriptionId: string
  ): Promise<void> {
    const config = tier === 'pro' ? SUBSCRIPTION_CONFIG.pro : SUBSCRIPTION_CONFIG.proPlus
    const points = config.points[cycle]

    try {
      await this.addPoints({
        userId,
        amount: points,
        transactionType: 'subscription_grant',
        description: `${config.name} ${cycle} subscription: ${points} points`,
        subscriptionId,
        metadata: {
          tier,
          cycle,
          source: 'subscription',
        },
      })

      console.log(
        `[PointsService] Granted ${points} subscription points to user ${userId} (${tier} ${cycle})`
      )
    } catch (error) {
      console.error('[PointsService] Error granting subscription points:', error)
      throw error
    }
  }

  async purchasePointsPack(
    userId: string,
    packId: string,
    stripePaymentIntentId: string
  ): Promise<void> {
    const pack = SUBSCRIPTION_CONFIG.pointsPacks.find((p) => p.id === packId)

    if (!pack) {
      throw new Error(`Invalid points pack ID: ${packId}`)
    }

    const totalPoints = pack.points + pack.bonus

    try {
      await this.addPoints({
        userId,
        amount: totalPoints,
        transactionType: 'purchase',
        description: `Purchased ${pack.name}: ${pack.points} points${pack.bonus > 0 ? ` + ${pack.bonus} bonus` : ''}`,
        stripePaymentIntentId,
        metadata: {
          pack_id: packId,
          base_points: pack.points,
          bonus_points: pack.bonus,
          price_paid: pack.price,
          source: 'purchase',
        },
      })

      console.log(
        `[PointsService] User ${userId} purchased ${totalPoints} points (${pack.name})`
      )
    } catch (error) {
      console.error('[PointsService] Error purchasing points pack:', error)
      throw error
    }
  }

  async canAffordGeneration(userId: string, generationType: GenerationType): Promise<{
    canAfford: boolean
    currentBalance: number
    requiredPoints: number
    shortfall: number
  }> {
    const balance = await this.getBalance(userId)
    const requiredPoints = SUBSCRIPTION_CONFIG.generationCosts[generationType]

    if (!balance) {
      return {
        canAfford: false,
        currentBalance: 0,
        requiredPoints,
        shortfall: requiredPoints,
      }
    }

    const canAfford = balance.balance >= requiredPoints
    const shortfall = canAfford ? 0 : requiredPoints - balance.balance

    return {
      canAfford,
      currentBalance: balance.balance,
      requiredPoints,
      shortfall,
    }
  }

  async refundPoints(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.addPoints({
        userId,
        amount,
        transactionType: 'refund',
        description: `Refund: ${reason}`,
        metadata: {
          ...metadata,
          reason,
          source: 'refund',
        },
      })

      console.log(`[PointsService] Refunded ${amount} points to user ${userId}: ${reason}`)
    } catch (error) {
      console.error('[PointsService] Error refunding points:', error)
      throw error
    }
  }
}

export const createPointsService = (supabase: any) => new PointsService(supabase)
