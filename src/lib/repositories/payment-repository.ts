import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type {
  PaymentRecord,
  PaymentStatus,
  PaymentType,
  PaymentInterval,
  PaymentProvider,
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

export interface CreatePaymentData {
  id?: string;
  provider?: PaymentProvider;
  priceId: string;
  productId?: string;
  type: PaymentType;
  interval?: PaymentInterval;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  status: PaymentStatus;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
}

export interface UpdatePaymentData {
  priceId?: string;
  status?: PaymentStatus;
  subscriptionId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
}

export interface CreatePaymentEventData {
  paymentId: string;
  eventType: string;
  stripeEventId?: string;
  creemEventId?: string;
  eventData?: string;
}

export class PaymentRepository {
  /**
   * Create payment record
   */
  async create(data: CreatePaymentData): Promise<PaymentRecord> {
    const paymentId = data.id || uuidv4();
    
    const { data: result, error } = await supabase
      .from('payment')
      .insert({
        id: paymentId,
        provider: data.provider || 'creem',
        price_id: data.priceId,
        product_id: data.productId || null,
        type: data.type,
        interval: data.interval || null,
        user_id: data.userId,
        customer_id: data.customerId,
        subscription_id: data.subscriptionId || null,
        status: data.status,
        period_start: data.periodStart || null,
        period_end: data.periodEnd || null,
        cancel_at_period_end: data.cancelAtPeriodEnd || false,
        trial_start: data.trialStart || null,
        trial_end: data.trialEnd || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment record: ${error.message}`);
    }

    return this.mapToPaymentRecord(result);
  }

  /**
   * Get payment record by ID
   */
  async findById(id: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToPaymentRecord(data);
  }

  /**
   * Get payment records by user ID
   */
  async findByUserId(userId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentRepository] Error finding by user ID:', error);
      return [];
    }

    return (data || []).map(this.mapToPaymentRecord);
  }

  /**
   * Get payment record by subscription ID
   */
  async findBySubscriptionId(subscriptionId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();

    if (error || !data) return null;
    return this.mapToPaymentRecord(data);
  }

  /**
   * Get payment records by customer ID
   */
  async findByCustomerId(customerId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentRepository] Error finding by customer ID:', error);
      return [];
    }

    return (data || []).map(this.mapToPaymentRecord);
  }

  /**
   * Get user's active subscription (excludes subscriptions set to cancel at period end)
   */
  async findActiveSubscriptionByUserId(userId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentRepository] Error finding active subscription:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`[PaymentRepository] No active subscriptions found for user ${userId}`);
      return null;
    }

    console.log(`[PaymentRepository] Found ${data.length} subscriptions for user ${userId}`);
    
    // Filter out subscriptions set to cancel at period end
    const activeSubscription = data.find(sub => !sub.cancel_at_period_end);
    
    if (activeSubscription) {
      console.log(`[PaymentRepository] Returning active subscription: ${activeSubscription.price_id}`);
      return this.mapToPaymentRecord(activeSubscription);
    }
    
    console.log(`[PaymentRepository] No truly active subscription (all have cancelAtPeriodEnd=true)`);
    return null;
  }

  /**
   * Update payment record
   */
  async update(id: string, data: UpdatePaymentData): Promise<PaymentRecord | null> {
    const updateData: any = {};

    if (data.priceId !== undefined) updateData.price_id = data.priceId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.subscriptionId !== undefined) updateData.subscription_id = data.subscriptionId;
    if (data.periodStart !== undefined) updateData.period_start = data.periodStart;
    if (data.periodEnd !== undefined) updateData.period_end = data.periodEnd;
    if (data.cancelAtPeriodEnd !== undefined) updateData.cancel_at_period_end = data.cancelAtPeriodEnd;
    if (data.trialStart !== undefined) updateData.trial_start = data.trialStart;
    if (data.trialEnd !== undefined) updateData.trial_end = data.trialEnd;

    const { data: result, error } = await supabase
      .from('payment')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[PaymentRepository] Error updating payment:', error);
      return null;
    }

    return result ? this.mapToPaymentRecord(result) : null;
  }

  /**
   * Delete payment record
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('payment')
      .delete()
      .eq('id', id);

    return !error;
  }

  /**
   * Create payment event record (for webhook deduplication)
   */
  async createEvent(data: CreatePaymentEventData): Promise<void> {
    const { error } = await supabase
      .from('payment_event')
      .insert({
        id: uuidv4(),
        payment_id: data.paymentId,
        event_type: data.eventType,
        stripe_event_id: data.stripeEventId || null,
        creem_event_id: data.creemEventId || null,
        event_data: data.eventData || null,
      });

    if (error) {
      throw new Error(`Failed to create payment event: ${error.message}`);
    }
  }

  /**
   * Check if Stripe event has been processed (for deduplication)
   */
  async isStripeEventProcessed(stripeEventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('payment_event')
      .select('id')
      .eq('stripe_event_id', stripeEventId)
      .limit(1);

    if (error) {
      console.error('[PaymentRepository] Error checking Stripe event:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  }

  /**
   * Check if Creem event has been processed (for deduplication)
   */
  async isCreemEventProcessed(creemEventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('payment_event')
      .select('id')
      .eq('creem_event_id', creemEventId)
      .limit(1);

    if (error) {
      console.error('[PaymentRepository] Error checking Creem event:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  }

  /**
   * Cancel all active subscriptions for a user
   */
  async cancelUserSubscriptions(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('payment')
      .update({
        status: 'canceled',
        cancel_at_period_end: false,
      })
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .select();

    if (error) {
      console.error('[PaymentRepository] Error canceling user subscriptions:', error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Find subscriptions by user and status
   */
  async findSubscriptionByUserAndStatus(
    userId: string,
    statuses: PaymentStatus[]
  ): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payment')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .in('status', statuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PaymentRepository] Error finding subscriptions:', error);
      return [];
    }

    return (data || []).map(this.mapToPaymentRecord);
  }

  /**
   * Update subscription status with state validation
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    newStatus: PaymentStatus,
    metadata?: Record<string, any>
  ): Promise<PaymentRecord | null> {
    const current = await this.findBySubscriptionId(subscriptionId);
    
    if (!current) {
      console.error(`[PaymentRepository] Subscription ${subscriptionId} not found`);
      return null;
    }
    
    // Validate state transition
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      'incomplete': ['active', 'canceled', 'incomplete_expired'],
      'incomplete_expired': ['active', 'canceled'],
      'trialing': ['active', 'canceled', 'past_due'],
      'active': ['canceled', 'past_due', 'unpaid', 'paused'],
      'past_due': ['active', 'canceled', 'unpaid'],
      'canceled': [], // Terminal state
      'unpaid': ['active', 'canceled'],
      'paused': ['active', 'canceled'],
    };
    
    const allowedTransitions = validTransitions[current.status] || [];
    
    if (!allowedTransitions.includes(newStatus) && current.status !== newStatus) {
      console.warn(
        `[PaymentRepository] Invalid status transition: ${current.status} → ${newStatus} for subscription ${subscriptionId}`
      );
    }
    
    return this.update(subscriptionId, {
      status: newStatus,
      ...metadata,
    });
  }

  /**
   * Check if user has any active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('payment')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'subscription')
      .in('status', ['active', 'trialing', 'past_due'])
      .limit(1);

    if (error) {
      console.error('[PaymentRepository] Error checking active subscription:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  }

  /**
   * Map database record to PaymentRecord
   */
  private mapToPaymentRecord(record: any): PaymentRecord {
    return {
      id: record.id,
      provider: record.provider as PaymentProvider,
      priceId: record.price_id,
      productId: record.product_id || undefined,
      type: record.type as PaymentType,
      interval: record.interval as PaymentInterval,
      userId: record.user_id,
      customerId: record.customer_id,
      subscriptionId: record.subscription_id || undefined,
      status: record.status as PaymentStatus,
      periodStart: record.period_start ? new Date(record.period_start) : undefined,
      periodEnd: record.period_end ? new Date(record.period_end) : undefined,
      cancelAtPeriodEnd: record.cancel_at_period_end || undefined,
      trialStart: record.trial_start ? new Date(record.trial_start) : undefined,
      trialEnd: record.trial_end ? new Date(record.trial_end) : undefined,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }
}

// Export singleton instance
export const paymentRepository = new PaymentRepository();
