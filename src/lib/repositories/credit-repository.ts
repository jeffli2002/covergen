import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type {
  UserCreditsRecord,
  CreditTransactionRecord,
  CreditTransactionType,
  CreditSource,
} from '@/types/payment';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role client for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface GrantCreditsParams {
  userId: string;
  amount: number;
  source: CreditSource;
  description: string;
  referenceId: string; // For idempotency
  metadata?: Record<string, any>;
}

export interface SpendCreditsParams {
  userId: string;
  amount: number;
  source: CreditSource;
  description: string;
  referenceId?: string;
  metadata?: Record<string, any>;
}

export class CreditRepository {
  /**
   * Get user credits balance
   */
  async getUserCredits(userId: string): Promise<UserCreditsRecord | null> {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - return default
        return null;
      }
      console.error('[CreditRepository] Error getting user credits:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      balance: data.balance,
      totalEarned: data.total_earned,
      totalSpent: data.total_spent,
      frozenBalance: data.frozen_balance,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Grant credits to user with idempotency
   * Returns true if credits were granted, false if already granted (duplicate referenceId)
   */
  async grantCredits(params: GrantCreditsParams): Promise<boolean> {
    try {
      // Check for duplicate transaction (idempotency)
      const { data: existingTransaction } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', params.userId)
        .eq('reference_id', params.referenceId)
        .limit(1)
        .single();

      if (existingTransaction) {
        console.log(`[CreditRepository] Credits already granted for reference ${params.referenceId}`);
        return false;
      }

      // Get or create user credits record
      let userCredits = await this.getUserCredits(params.userId);

      if (!userCredits) {
        // Create new user credits record
        const { data: newCredits, error: createError } = await supabase
          .from('user_credits')
          .insert({
            id: uuidv4(),
            user_id: params.userId,
            balance: params.amount,
            total_earned: params.amount,
            total_spent: 0,
            frozen_balance: 0,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create user credits: ${createError.message}`);
        }

        userCredits = {
          id: newCredits.id,
          userId: newCredits.user_id,
          balance: newCredits.balance,
          totalEarned: newCredits.total_earned,
          totalSpent: newCredits.total_spent,
          frozenBalance: newCredits.frozen_balance,
          createdAt: new Date(newCredits.created_at),
          updatedAt: new Date(newCredits.updated_at),
        };
      } else {
        // Update existing record
        const newBalance = userCredits.balance + params.amount;
        const newTotalEarned = userCredits.totalEarned + params.amount;

        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            balance: newBalance,
            total_earned: newTotalEarned,
          })
          .eq('user_id', params.userId);

        if (updateError) {
          throw new Error(`Failed to update user credits: ${updateError.message}`);
        }

        userCredits.balance = newBalance;
        userCredits.totalEarned = newTotalEarned;
      }

      // Record transaction
      await this.createTransaction({
        userId: params.userId,
        type: 'earn',
        amount: params.amount,
        balanceAfter: userCredits.balance,
        source: params.source,
        description: params.description,
        referenceId: params.referenceId,
        metadata: params.metadata,
      });

      console.log(
        `[CreditRepository] Granted ${params.amount} credits to user ${params.userId} (balance: ${userCredits.balance})`
      );

      return true;
    } catch (error) {
      console.error('[CreditRepository] Error granting credits:', error);
      throw error;
    }
  }

  /**
   * Spend credits from user balance
   * Returns true if successful, false if insufficient balance
   */
  async spendCredits(params: SpendCreditsParams): Promise<boolean> {
    try {
      const userCredits = await this.getUserCredits(params.userId);

      if (!userCredits) {
        console.error(`[CreditRepository] No credits found for user ${params.userId}`);
        return false;
      }

      if (userCredits.balance < params.amount) {
        console.error(
          `[CreditRepository] Insufficient credits for user ${params.userId}: ${userCredits.balance} < ${params.amount}`
        );
        return false;
      }

      const newBalance = userCredits.balance - params.amount;
      const newTotalSpent = userCredits.totalSpent + params.amount;

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          total_spent: newTotalSpent,
        })
        .eq('user_id', params.userId);

      if (updateError) {
        throw new Error(`Failed to update user credits: ${updateError.message}`);
      }

      // Record transaction
      await this.createTransaction({
        userId: params.userId,
        type: 'spend',
        amount: params.amount,
        balanceAfter: newBalance,
        source: params.source,
        description: params.description,
        referenceId: params.referenceId,
        metadata: params.metadata,
      });

      console.log(
        `[CreditRepository] Spent ${params.amount} credits for user ${params.userId} (balance: ${newBalance})`
      );

      return true;
    } catch (error) {
      console.error('[CreditRepository] Error spending credits:', error);
      throw error;
    }
  }

  /**
   * Create credit transaction record
   */
  private async createTransaction(params: {
    userId: string;
    type: CreditTransactionType;
    amount: number;
    balanceAfter: number;
    source: CreditSource;
    description: string;
    referenceId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const { error } = await supabase
      .from('credit_transactions')
      .insert({
        id: uuidv4(),
        user_id: params.userId,
        type: params.type,
        amount: params.amount,
        balance_after: params.balanceAfter,
        source: params.source,
        description: params.description,
        reference_id: params.referenceId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      });

    if (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(
    userId: string,
    limit: number = 50
  ): Promise<CreditTransactionRecord[]> {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[CreditRepository] Error getting transactions:', error);
      return [];
    }

    return (data || []).map((record) => ({
      id: record.id,
      userId: record.user_id,
      type: record.type as CreditTransactionType,
      amount: record.amount,
      balanceAfter: record.balance_after,
      source: record.source as CreditSource,
      description: record.description,
      referenceId: record.reference_id,
      metadata: record.metadata,
      createdAt: new Date(record.created_at),
    }));
  }

  /**
   * Freeze credits (for dispute handling)
   */
  async freezeCredits(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const userCredits = await this.getUserCredits(userId);

      if (!userCredits || userCredits.balance < amount) {
        return false;
      }

      const newBalance = userCredits.balance - amount;
      const newFrozenBalance = userCredits.frozenBalance + amount;

      const { error } = await supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          frozen_balance: newFrozenBalance,
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to freeze credits: ${error.message}`);
      }

      await this.createTransaction({
        userId,
        type: 'freeze',
        amount,
        balanceAfter: newBalance,
        source: 'admin',
        description: `Credits frozen: ${reason}`,
      });

      return true;
    } catch (error) {
      console.error('[CreditRepository] Error freezing credits:', error);
      return false;
    }
  }

  /**
   * Unfreeze credits (after dispute resolution)
   */
  async unfreezeCredits(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const userCredits = await this.getUserCredits(userId);

      if (!userCredits || userCredits.frozenBalance < amount) {
        return false;
      }

      const newBalance = userCredits.balance + amount;
      const newFrozenBalance = userCredits.frozenBalance - amount;

      const { error } = await supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          frozen_balance: newFrozenBalance,
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to unfreeze credits: ${error.message}`);
      }

      await this.createTransaction({
        userId,
        type: 'unfreeze',
        amount,
        balanceAfter: newBalance,
        source: 'admin',
        description: `Credits unfrozen: ${reason}`,
      });

      return true;
    } catch (error) {
      console.error('[CreditRepository] Error unfreezing credits:', error);
      return false;
    }
  }
}

// Export singleton instance
export const creditRepository = new CreditRepository();
