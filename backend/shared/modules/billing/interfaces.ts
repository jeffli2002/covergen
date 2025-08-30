/**
 * Billing and subscription module interfaces
 */

import { IRepository, ICache, IQueue, ILogger } from '../../core/interfaces';

// Main billing service interface
export interface IBillingService {
  // Customer management
  createCustomer(data: CreateCustomerData): Promise<Customer>;
  updateCustomer(customerId: string, data: UpdateCustomerData): Promise<Customer>;
  getCustomer(customerId: string): Promise<Customer>;
  deleteCustomer(customerId: string): Promise<void>;
  
  // Subscription management
  createSubscription(data: CreateSubscriptionData): Promise<Subscription>;
  updateSubscription(subscriptionId: string, data: UpdateSubscriptionData): Promise<Subscription>;
  cancelSubscription(subscriptionId: string, options?: CancelOptions): Promise<Subscription>;
  reactivateSubscription(subscriptionId: string): Promise<Subscription>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  getCustomerSubscriptions(customerId: string): Promise<Subscription[]>;
  
  // Plan management
  getPlans(): Promise<Plan[]>;
  getPlan(planId: string): Promise<Plan>;
  
  // Payment method management
  addPaymentMethod(customerId: string, data: PaymentMethodData): Promise<PaymentMethod>;
  updatePaymentMethod(methodId: string, data: UpdatePaymentMethodData): Promise<PaymentMethod>;
  deletePaymentMethod(methodId: string): Promise<void>;
  setDefaultPaymentMethod(customerId: string, methodId: string): Promise<void>;
  getPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  
  // One-time payments
  createPayment(data: CreatePaymentData): Promise<Payment>;
  refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Refund>;
  getPayment(paymentId: string): Promise<Payment>;
  
  // Usage tracking
  recordUsage(customerId: string, data: UsageData): Promise<void>;
  getUsage(customerId: string, period: UsagePeriod): Promise<UsageRecord[]>;
  
  // Invoicing
  getInvoices(customerId: string, options?: InvoiceQueryOptions): Promise<Invoice[]>;
  getInvoice(invoiceId: string): Promise<Invoice>;
  downloadInvoice(invoiceId: string): Promise<Buffer>;
  
  // Webhooks
  handleWebhook(provider: PaymentProvider, headers: any, body: any): Promise<void>;
  
  // Trials
  startTrial(customerId: string, planId: string, days: number): Promise<Subscription>;
  
  // Coupons/Discounts
  applyCoupon(customerId: string, couponCode: string): Promise<Discount>;
  removeCoupon(customerId: string, couponId: string): Promise<void>;
}

// Customer interfaces
export interface Customer {
  id: string;
  userId: string;
  email: string;
  name?: string;
  currency: string;
  billingAddress?: BillingAddress;
  taxInfo?: TaxInfo;
  metadata?: Record<string, any>;
  providers: CustomerProvider[];
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerProvider {
  provider: PaymentProvider;
  customerId: string;
  metadata?: Record<string, any>;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface TaxInfo {
  type: 'individual' | 'company';
  taxId?: string; // VAT number, GST, etc.
  companyName?: string;
  exemptionCertificate?: string;
}

// Subscription interfaces
export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  items: SubscriptionItem[];
  discount?: Discount;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'
  | 'paused';

export interface SubscriptionItem {
  id: string;
  priceId: string;
  quantity: number;
  metadata?: Record<string, any>;
}

// Plan interfaces
export interface Plan {
  id: string;
  name: string;
  description?: string;
  prices: Price[];
  features: PlanFeature[];
  metadata?: Record<string, any>;
  active: boolean;
  trial?: {
    days: number;
    features?: string[];
  };
}

export interface Price {
  id: string;
  currency: string;
  amount: number; // in cents
  interval: PriceInterval;
  intervalCount: number;
  usageType: 'licensed' | 'metered';
  tiers?: PriceTier[];
  metadata?: Record<string, any>;
}

export type PriceInterval = 'day' | 'week' | 'month' | 'year';

export interface PriceTier {
  upTo: number | null; // null means infinity
  unitAmount: number;
  flatAmount?: number;
}

export interface PlanFeature {
  key: string;
  name: string;
  value: string | number | boolean;
  type: 'boolean' | 'limit' | 'feature';
}

// Payment method interfaces
export interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  isDefault: boolean;
  details: PaymentMethodDetails;
  billingAddress?: BillingAddress;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type PaymentMethodType = 
  | 'card'
  | 'bank_account'
  | 'paypal'
  | 'alipay'
  | 'wechat_pay'
  | 'sepa_debit'
  | 'apple_pay'
  | 'google_pay';

export type PaymentProvider = 'stripe' | 'paypal' | 'alipay' | 'wechat';

export type PaymentMethodDetails = 
  | CardDetails
  | BankAccountDetails
  | WalletDetails;

export interface CardDetails {
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unionpay' | string;
  last4: string;
  expMonth: number;
  expYear: number;
  funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
}

export interface BankAccountDetails {
  bankName?: string;
  last4: string;
  accountType?: 'checking' | 'savings';
  currency: string;
}

export interface WalletDetails {
  email?: string;
  phone?: string;
  walletType: 'paypal' | 'alipay' | 'wechat_pay' | 'apple_pay' | 'google_pay';
}

// Payment interfaces
export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
  refunded: boolean;
  refunds: Refund[];
  failureReason?: string;
  receiptUrl?: string;
  createdAt: Date;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'requires_action'
  | 'requires_confirmation';

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

// Usage tracking interfaces
export interface UsageData {
  metricId: string;
  quantity: number;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface UsagePeriod {
  start: Date;
  end: Date;
  subscriptionId?: string;
}

export interface UsageRecord {
  id: string;
  customerId: string;
  subscriptionId?: string;
  metricId: string;
  quantity: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Invoice interfaces
export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  number: string;
  status: InvoiceStatus;
  currency: string;
  amount: number;
  amountDue: number;
  amountPaid: number;
  tax?: number;
  lineItems: InvoiceLineItem[];
  discount?: Discount;
  billingAddress?: BillingAddress;
  paymentMethod?: string;
  dueDate?: Date;
  paidAt?: Date;
  voidedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  currency: string;
  quantity: number;
  unitAmount: number;
  tax?: number;
  period?: {
    start: Date;
    end: Date;
  };
}

// Discount interfaces
export interface Discount {
  id: string;
  coupon: Coupon;
  start: Date;
  end?: Date;
  timesRedeemed: number;
}

export interface Coupon {
  id: string;
  code: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
  maxRedemptions?: number;
  redeemBy?: Date;
  metadata?: Record<string, any>;
}

// Data transfer objects
export interface CreateCustomerData {
  userId: string;
  email: string;
  name?: string;
  currency?: string;
  billingAddress?: BillingAddress;
  taxInfo?: TaxInfo;
  paymentMethod?: PaymentMethodData;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerData {
  email?: string;
  name?: string;
  billingAddress?: BillingAddress;
  taxInfo?: TaxInfo;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionData {
  customerId: string;
  planId: string;
  priceId?: string;
  quantity?: number;
  trial?: boolean;
  coupon?: string;
  paymentMethodId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSubscriptionData {
  planId?: string;
  quantity?: number;
  coupon?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, any>;
}

export interface CancelOptions {
  immediately?: boolean;
  reason?: string;
  feedback?: string;
}

export interface PaymentMethodData {
  type: PaymentMethodType;
  provider: PaymentProvider;
  token?: string; // Provider-specific token
  details?: any; // Provider-specific details
}

export interface UpdatePaymentMethodData {
  billingAddress?: BillingAddress;
  metadata?: Record<string, any>;
}

export interface CreatePaymentData {
  customerId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
  capture?: boolean; // false for auth-only
}

export interface InvoiceQueryOptions {
  status?: InvoiceStatus[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Webhook interfaces
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  previousAttributes?: any;
  createdAt: Date;
}

export type WebhookEventType = 
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.deleted'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.payment_failed';

// Billing events
export interface BillingEvents {
  'billing.customer.created': { customerId: string; userId: string };
  'billing.subscription.created': { subscriptionId: string; customerId: string; planId: string };
  'billing.subscription.updated': { subscriptionId: string; changes: string[] };
  'billing.subscription.canceled': { subscriptionId: string; reason?: string };
  'billing.payment.succeeded': { paymentId: string; amount: number; customerId: string };
  'billing.payment.failed': { customerId: string; amount: number; reason: string };
  'billing.invoice.paid': { invoiceId: string; customerId: string };
  'billing.usage.recorded': { customerId: string; metric: string; quantity: number };
}

// Billing configuration
export interface BillingConfig {
  providers: {
    [K in PaymentProvider]?: {
      apiKey: string;
      webhookSecret?: string;
      publicKey?: string;
      sandbox?: boolean;
    };
  };
  currency: {
    default: string;
    supported: string[];
  };
  invoice: {
    prefix: string;
    startNumber: number;
    footer?: string;
    logo?: string;
    companyInfo?: {
      name: string;
      address: BillingAddress;
      taxId?: string;
    };
  };
  trial: {
    enabled: boolean;
    defaultDays: number;
    requirePaymentMethod: boolean;
  };
  tax: {
    enabled: boolean;
    inclusive: boolean;
    rates?: TaxRate[];
  };
  webhooks: {
    retries: number;
    timeout: number;
  };
}

export interface TaxRate {
  country: string;
  state?: string;
  rate: number;
  name: string;
}