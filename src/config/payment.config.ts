import { SUBSCRIPTION_CONFIG } from './subscription'
import { PRICING_CONFIG } from './pricing.config'

export interface CreditPack {
  id: string
  name: string
  credits: number
  price: number
  originalPrice?: number
  discount?: string
  stripePriceId?: string
  creemProductKey?: string
  popular?: boolean
  badge?: string
}

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  yearlyPrice?: number
  interval: 'month' | 'year' | null
  stripePriceIds?: {
    monthly?: string
    yearly?: string
  }
  creemPriceIds?: {
    monthly?: string
    yearly?: string
  }
  credits: {
    monthly: number
    yearly?: number
    onSignup?: number
    onSubscribe?: number
  }
  features: string[]
  popular: boolean
  limits: {
    extractions?: number
    images?: number
    videos?: number
    dailyImages?: number
    dailyVideos?: number
    batchSize?: number
    quality?: string
    apiCalls?: number
  }
}

export interface PaymentConfig {
  provider: 'stripe' | 'creem'
  currency: string
  stripe: {
    secretKey: string
    webhookSecret: string
    apiVersion: string
  }
  creem: {
    apiKey: string
    webhookSecret: string
    proProductKeyMonthly: string
    proplusProductKeyMonthly: string
    proProductKeyYearly: string
    proplusProductKeyYearly: string
  }
  plans: Plan[]
  creditPacks: CreditPack[]
  trial: {
    enabled: boolean
    days: number
    plans: string[]
  }
  invoice: {
    footer: string
    logo: string
    supportEmail: string
  }
  billing: {
    collectTaxId: boolean
    allowPromotionCodes: boolean
    automaticTax: boolean
  }
  features: {
    subscriptions: boolean
    oneTimePayments: boolean
    invoices: boolean
    customerPortal: boolean
    webhooks: boolean
  }
}

// Helper function to get plan price by price ID
export function getPlanPriceByPriceId(priceId: string): number {
  // This is a placeholder - you'll need to implement based on your actual price IDs
  // For now, return 0 as default
  return 0
}

export const paymentConfig: PaymentConfig = {
  provider: 'creem',
  currency: 'usd',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2025-08-27.basil',
  },
  creem: {
    apiKey: process.env.CREEM_API_KEY || '',
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET || '',
    proProductKeyMonthly: process.env.CREEM_PRO_PLAN_ID || '',
    proplusProductKeyMonthly: process.env.CREEM_PRO_PLUS_PLAN_ID || '',
    proProductKeyYearly: process.env.CREEM_PRO_YEARLY_PLAN_ID || '',
    proplusProductKeyYearly: process.env.CREEM_PRO_PLUS_YEARLY_PLAN_ID || '',
  },
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out the platform',
      price: 0,
      interval: null,
      credits: {
        monthly: 0,
        onSignup: SUBSCRIPTION_CONFIG.signupBonus.free,
      },
      features: ['30 credits sign-up bonus (one-time)', 'All generation features'],
      popular: false,
      limits: {
        images: 0,
        videos: 0,
        dailyImages: 0,
        dailyVideos: 0,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Great for individual creators',
      price: SUBSCRIPTION_CONFIG.plans.pro.monthly.price,
      yearlyPrice: SUBSCRIPTION_CONFIG.plans.pro.yearly.price,
      interval: 'month',
      creemPriceIds: {
        monthly: process.env.CREEM_PRO_PLAN_ID || '',
        yearly: process.env.CREEM_PRO_YEARLY_PLAN_ID || '',
      },
      credits: {
        monthly: SUBSCRIPTION_CONFIG.plans.pro.monthly.points,
        yearly: SUBSCRIPTION_CONFIG.plans.pro.yearly.points,
      },
      features: [
        `${SUBSCRIPTION_CONFIG.plans.pro.monthly.points} credits/month`,
        'All generation features',
        'Commercial license',
      ],
      popular: true,
      limits: {
        images: -1,
        videos: -1,
        dailyImages: -1,
        dailyVideos: -1,
      },
    },
    {
      id: 'proplus',
      name: 'Pro+',
      description: 'For professional creators and businesses',
      price: SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.price,
      yearlyPrice: SUBSCRIPTION_CONFIG.plans.pro_plus.yearly.price,
      interval: 'month',
      creemPriceIds: {
        monthly: process.env.CREEM_PRO_PLUS_PLAN_ID || '',
        yearly: process.env.CREEM_PRO_PLUS_YEARLY_PLAN_ID || '',
      },
      credits: {
        monthly: SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points,
        yearly: SUBSCRIPTION_CONFIG.plans.pro_plus.yearly.points,
      },
      features: [
        `${SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points} credits/month`,
        'Everything in Pro',
        'Priority support',
      ],
      popular: false,
      limits: {
        images: -1,
        videos: -1,
        dailyImages: -1,
        dailyVideos: -1,
      },
    },
  ],
  creditPacks: PRICING_CONFIG.creditsPacks.map((pack) => ({
    id: pack.id,
    name: pack.points.toString(),
    credits: pack.points,
    price: pack.price,
    creemProductKey: pack.creemProductId,
    popular: pack.popular,
  })),
  trial: {
    enabled: false,
    days: 0,
    plans: [],
  },
  invoice: {
    footer: 'Thank you for your business! If you have any questions, please contact our support team.',
    logo: '/images/logo3.png',
    supportEmail: 'support@covergen.pro',
  },
  billing: {
    collectTaxId: true,
    allowPromotionCodes: true,
    automaticTax: true,
  },
  features: {
    subscriptions: true,
    oneTimePayments: true,
    invoices: true,
    customerPortal: true,
    webhooks: true,
  },
}

