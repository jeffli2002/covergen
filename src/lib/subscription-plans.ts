export type PlanType = 'free' | 'pro' | 'pro_plus'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  priceDisplay: string
  features: string[]
  limits: {
    monthly: number
    daily: number
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
      'Basic cover generation',
      'Limited templates',
      'Standard resolution',
      'Community support'
    ],
    limits: {
      monthly: Number(process.env.NEXT_PUBLIC_LIMIT_FREE_MONTHLY) || 10,
      daily: Number(process.env.NEXT_PUBLIC_LIMIT_FREE_DAILY) || 3
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    priceDisplay: '$9.99/mo',
    features: [
      'Unlimited cover generation',
      'All templates',
      'High resolution exports',
      'Priority support',
      'Advanced editing tools'
    ],
    limits: {
      monthly: Number(process.env.NEXT_PUBLIC_LIMIT_PRO_MONTHLY) || 500,
      daily: Number(process.env.NEXT_PUBLIC_LIMIT_PRO_DAILY) || 50
    },
    popular: true
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro+',
    price: 19.99,
    priceDisplay: '$19.99/mo',
    features: [
      'Everything in Pro',
      'Bulk generation',
      'API access',
      'Custom templates',
      'Dedicated support',
      'Commercial license'
    ],
    limits: {
      monthly: Number(process.env.NEXT_PUBLIC_LIMIT_PRO_PLUS_MONTHLY) || 2000,
      daily: Number(process.env.NEXT_PUBLIC_LIMIT_PRO_PLUS_DAILY) || 200
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