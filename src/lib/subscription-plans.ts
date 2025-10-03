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
  popular?: boolean
}

const plans: Record<PlanType, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceDisplay: '$0',
    features: [
      '10 images/month',
      '5 videos/month',
      '3 images/day',
      '1 video/day',
      'Basic templates',
      'Standard resolution'
    ],
    limits: {
      images: {
        monthly: 10,
        daily: 3
      },
      videos: {
        monthly: 5,
        daily: 1
      }
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 16.99,
    priceDisplay: '$16.99/mo',
    features: [
      '100 images/month',
      '30 videos/month',
      'All templates',
      'High resolution exports',
      'Priority support',
      'Advanced editing tools'
    ],
    limits: {
      images: {
        monthly: 100,
        daily: 100
      },
      videos: {
        monthly: 30,
        daily: 30
      }
    },
    popular: true
  },
  pro_plus: {
    id: 'pro_plus',
    name: 'Pro+',
    price: 29.99,
    priceDisplay: '$29.99/mo',
    features: [
      '200 images/month',
      '60 videos/month',
      'Everything in Pro',
      'Bulk generation',
      'Custom templates',
      'Dedicated support',
      'Commercial license'
    ],
    limits: {
      images: {
        monthly: 200,
        daily: 200
      },
      videos: {
        monthly: 60,
        daily: 60
      }
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