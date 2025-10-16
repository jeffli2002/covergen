// Payment system types (matching im2prompt architecture)

// Payment type
export type PaymentType = 'one_time' | 'subscription';

// Payment status (Creem-compatible statuses)
export type PaymentStatus = 
  | 'active'       // Subscription is active
  | 'canceled'     // Subscription was canceled
  | 'past_due'     // Payment failed, retry in progress
  | 'trialing'     // In trial period
  | 'incomplete'   // Payment incomplete
  | 'incomplete_expired' // Incomplete payment expired
  | 'unpaid'       // Payment failed
  | 'paused';      // Subscription paused

// Payment interval
export type PaymentInterval = 'month' | 'year' | null;

// Payment provider
export type PaymentProvider = 'stripe' | 'creem';

// Credit transaction type
export type CreditTransactionType = 
  | 'earn'          // User earned credits (subscription, bonus)
  | 'spend'         // User spent credits (API call)
  | 'refund'        // Credits refunded
  | 'admin_adjust'  // Admin adjustment
  | 'freeze'        // Credits frozen (dispute)
  | 'unfreeze';     // Credits unfrozen

// Credit source
export type CreditSource = 
  | 'subscription'      // Credits from subscription
  | 'one_time_payment'  // Credits from one-time purchase
  | 'api_call'          // Spent on API call
  | 'admin'             // Admin adjustment
  | 'storage'           // Spent on storage
  | 'bonus';            // Promotional bonus

// Quota service type
export type QuotaService = 
  | 'api_call'
  | 'storage'
  | 'custom'
  | 'image_generation'
  | 'video_generation'
  | 'image_extraction';

// Payment record (database model)
export interface PaymentRecord {
  id: string;
  provider: PaymentProvider;
  priceId: string;
  productId?: string;
  type: PaymentType;
  interval: PaymentInterval;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  status: PaymentStatus;
  periodStart?: Date;
  periodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Payment event record (for webhook deduplication)
export interface PaymentEventRecord {
  id: string;
  paymentId: string;
  eventType: string;
  stripeEventId?: string;
  creemEventId?: string;
  eventData?: string; // JSON string
  createdAt: Date;
}

// User credits record
export interface UserCreditsRecord {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  frozenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Credit transaction record
export interface CreditTransactionRecord {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  source: CreditSource;
  description?: string;
  referenceId?: string; // For idempotency
  metadata?: string; // JSON string
  createdAt: Date;
}

// User quota usage record
export interface UserQuotaUsageRecord {
  id: string;
  userId: string;
  service: QuotaService;
  period: string; // Format: YYYY-MM
  usedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Creem webhook event types
export type CreemWebhookEventType = 
  | 'checkout.completed'
  | 'subscription.created'
  | 'subscription.active'
  | 'subscription.update'
  | 'subscription.canceled'
  | 'subscription.expired'
  | 'subscription.paid'
  | 'subscription.trial_will_end'
  | 'subscription.trial_ended'
  | 'subscription.paused'
  | 'refund.created'
  | 'dispute.created'
  | 'payment.failed';

// Creem webhook event
export interface CreemWebhookEvent {
  id: string;
  eventType: CreemWebhookEventType;
  object: any;
  data?: {
    object: any;
  };
  created: number;
}

// API Response types
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
