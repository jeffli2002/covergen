import { PRICING_CONFIG } from '@/config/pricing.config'

export type PlanType = 'free' | 'pro' | 'pro_plus'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  priceDisplay: string
  features: string[]
  limits: {
    images: {
      monthly: number
      daily: number
    }
    videos: {
      monthly: number
      daily: number
    }
  }
  credits?: {
    monthly: number
    onSignup?: number
  }
  popular?: boolean
}

const plans: Record<PlanType, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    features: [
      `${PRICING_CONFIG.plans[0].credits.onSignup} credits on signup`,
      `Up to ${Math.floor(PRICING_CONFIG.plans[0].credits.onSignup! / PRICING_CONFIG.generationCosts.nanoBananaImage)} images`,
      '6 images per day max',
      'No video access',
      'Basic templates',
      'Personal use only'
    ],
    limits: {
      images: {
        monthly: Math.floor(PRICING_CONFIG.plans[0].credits.onSignup! / PRICING_CONFIG.generationCosts.nanoBananaImage),
        daily: 6
      },
      videos: {
        monthly: 0,
        daily: 0
      }
    },
    credits: {
      onSignup: PRICING_CONFIG.plans[0].credits.onSignup!,
      monthly: 0
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: PRICING_CONFIG.plans[1].price.monthly,
    priceDisplay: `$${PRICING_CONFIG.plans[1].price.monthly.toFixed(1)}/mo`,
    features: [
      `${PRICING_CONFIG.plans[1].credits.monthly} credits/month`,
      `Up to ${Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or ${Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} videos`,
      'All templates',
      'Watermark-free images & Sora 2 videos',
      'Priority support',
      'Commercial usage rights'
    ],
    limits: {
      images: {
        monthly: Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage),
        daily: 999
      },
      videos: {
        monthly: Math.floor(PRICING_CONFIG.plans[1].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video),
        daily: 999
      }
    },
    credits: {
      monthly: PRICING_CONFIG.plans[1].credits.monthly
    },
    popular: true
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro+',
    price: PRICING_CONFIG.plans[2].price.monthly,
    priceDisplay: `$${PRICING_CONFIG.plans[2].price.monthly.toFixed(1)}/mo`,
    features: [
      `${PRICING_CONFIG.plans[2].credits.monthly} credits/month`,
      `Up to ${Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage)} images or ${Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video)} videos`,
      'Everything in Pro',
      'Sora 2 Pro quality',
      'Bulk generation',
      'Priority generation',
      'Full commercial license'
    ],
    limits: {
      images: {
        monthly: Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.nanoBananaImage),
        daily: 999
      },
      videos: {
        monthly: Math.floor(PRICING_CONFIG.plans[2].credits.monthly / PRICING_CONFIG.generationCosts.sora2Video),
        daily: 999
      }
    },
    credits: {
      monthly: PRICING_CONFIG.plans[2].credits.monthly
    }
  }
}

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return Object.values(plans)
}

export function getPlanByType(type: PlanType): SubscriptionPlan | undefined {
  return plans[type]
}

export function getPlanPrice(type: PlanType): number {
  const plan = plans[type]
  return plan ? plan.price : 0
}

export function isPaidPlan(type: PlanType): boolean {
  return type !== 'free'
}

export function canUpgrade(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const planOrder: PlanType[] = ['free', 'pro', 'pro_plus']
  const currentIndex = planOrder.indexOf(currentPlan)
  const targetIndex = planOrder.indexOf(targetPlan)
  return targetIndex > currentIndex
}