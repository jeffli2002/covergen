/**
 * Subscription and Points Configuration
 * 
 * This file contains all configurable values for the credits-based subscription system.
 * All prices are in USD, all points are integers.
 */

export const SUBSCRIPTION_CONFIG = {
  // Free Tier Configuration
  free: {
    tier: 'free' as const,
    name: 'Free',
    dailyImageLimit: 3,
    monthlyImageLimit: 10,
    videoQuota: 0,
    signupBonusPoints: 30,
    price: {
      monthly: 0,
      yearly: 0,
    },
    points: {
      monthly: 0,
      yearly: 0,
    },
  },

  // Pro Plan Configuration
  plans: {
    pro: {
      monthly: {
        price: 14.9,
        points: 800,
      },
      yearly: {
        price: 143.04, // 20% off (14.9 * 12 * 0.8)
        points: 9600, // 12 months worth
      },
    },
    pro_plus: {
      monthly: {
        price: 26.9,
        points: 1600,
      },
      yearly: {
        price: 258.24, // 20% off (26.9 * 12 * 0.8)
        points: 19200, // 12 months worth
      },
    },
  },

  // Legacy format for backward compatibility
  pro: {
    tier: 'pro' as const,
    name: 'Pro',
    price: {
      monthly: 14.9,
      yearly: 143.04,
    },
    points: {
      monthly: 800,
      yearly: 9600,
    },
  },

  // Pro+ Plan Configuration
  proPlus: {
    tier: 'pro_plus' as const,
    name: 'Pro+',
    price: {
      monthly: 26.9,
      yearly: 258.24,
    },
    points: {
      monthly: 1600,
      yearly: 19200,
    },
  },
  
  // Signup bonus
  signupBonus: {
    free: 30,
    pro: 0,
    pro_plus: 0,
  },

  // Points Packs (One-time purchases)
  pointsPacks: [
    {
      id: 'pack_100',
      name: '100 Points Pack',
      points: 100,
      price: 3.0,
      bonus: 0, // No bonus points
    },
    {
      id: 'pack_200',
      name: '200 Points Pack',
      points: 200,
      price: 6.0,
      bonus: 0, // No bonus points
    },
  ],

  // Generation Costs (in points)
  generationCosts: {
    nanoBananaImage: 5,
    sora2Video: 20,
    sora2ProVideo: 80,
  },

  // Yearly discount percentage
  yearlyDiscountPercent: 20,
} as const

// Type exports for TypeScript support
export type SubscriptionTier = 'free' | 'pro' | 'pro_plus'
export type BillingCycle = 'monthly' | 'yearly'
export type GenerationType = 'nanoBananaImage' | 'sora2Video' | 'sora2ProVideo'

// Helper functions
export function getSubscriptionConfig(tier: SubscriptionTier) {
  switch (tier) {
    case 'free':
      return SUBSCRIPTION_CONFIG.free
    case 'pro':
      return SUBSCRIPTION_CONFIG.pro
    case 'pro_plus':
      return SUBSCRIPTION_CONFIG.proPlus
    default:
      return SUBSCRIPTION_CONFIG.free
  }
}

export function getGenerationCost(type: GenerationType): number {
  return SUBSCRIPTION_CONFIG.generationCosts[type]
}

export function getPointsPack(packId: string) {
  return SUBSCRIPTION_CONFIG.pointsPacks.find((pack) => pack.id === packId)
}

export function calculateYearlyPrice(monthlyPrice: number): number {
  return monthlyPrice * 12 * (1 - SUBSCRIPTION_CONFIG.yearlyDiscountPercent / 100)
}

// Stripe Price IDs (to be populated after creating products in Stripe)
export const STRIPE_PRICE_IDS = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
  proPlus: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_MONTHLY_PRICE_ID || '',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_YEARLY_PRICE_ID || '',
  },
  pointsPacks: {
    pack_100: process.env.NEXT_PUBLIC_STRIPE_PACK_100_PRICE_ID || '',
    pack_200: process.env.NEXT_PUBLIC_STRIPE_PACK_200_PRICE_ID || '',
  },
} as const

// Environment variable validation
export function validateSubscriptionConfig() {
  const missingVars: string[] = []

  if (!STRIPE_PRICE_IDS.pro.monthly) missingVars.push('NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID')
  if (!STRIPE_PRICE_IDS.pro.yearly) missingVars.push('NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID')
  if (!STRIPE_PRICE_IDS.proPlus.monthly) missingVars.push('NEXT_PUBLIC_STRIPE_PRO_PLUS_MONTHLY_PRICE_ID')
  if (!STRIPE_PRICE_IDS.proPlus.yearly) missingVars.push('NEXT_PUBLIC_STRIPE_PRO_PLUS_YEARLY_PRICE_ID')

  if (missingVars.length > 0) {
    console.warn(
      `[Subscription Config] Missing Stripe price IDs for: ${missingVars.join(', ')}`
    )
  }

  return missingVars.length === 0
}
