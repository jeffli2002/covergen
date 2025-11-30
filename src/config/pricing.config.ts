import { SUBSCRIPTION_CONFIG } from './subscription'

export interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PlanCredits {
  monthly: number
  yearly: number
  onSubscribe: number
  onSignup?: number
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'pro_plus'
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  credits: PlanCredits
  features: PlanFeature[]
  popular?: boolean
  comingSoon?: boolean
  creemProductIds: {
    monthly: string
    yearly: string
  }
}

export interface CreditsPack {
  id: string
  points: number
  bonus: number
  price: number
  popular?: boolean
  creemProductId?: string
}

export const GENERATION_COSTS = {
  nanoBananaImage: SUBSCRIPTION_CONFIG.generationCosts.nanoBananaImage,
  sora2Video: SUBSCRIPTION_CONFIG.generationCosts.sora2Video,
  sora2ProVideo: SUBSCRIPTION_CONFIG.generationCosts.sora2ProVideo,
} as const

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out our AI tools',
    price: {
      monthly: 0,
      yearly: 0,
    },
    credits: {
      monthly: 0,
      yearly: 0,
      onSubscribe: 0,
      onSignup: SUBSCRIPTION_CONFIG.signupBonus.free,
    },
    features: [
      {
        text: `${SUBSCRIPTION_CONFIG.signupBonus.free} credits on signup (one-time bonus)`,
        included: true,
        highlight: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.signupBonus.free / GENERATION_COSTS.nanoBananaImage)} images with signup bonus`,
        included: true,
      },
      {
        text: 'Watermark-free images',
        included: true,
      },
      {
        text: 'Personal use only',
        included: true,
      },
      {
        text: 'All platform sizes',
        included: true,
      },
      {
        text: 'Authentication required for all generation',
        included: true,
      },
      {
        text: 'Sora 2 video generation',
        included: false,
      },
      {
        text: 'Watermark-free videos',
        included: false,
      },
      {
        text: 'Commercial usage rights',
        included: false,
      },
    ],
    creemProductIds: {
      monthly: '',
      yearly: '',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For content creators who need more',
    price: {
      monthly: SUBSCRIPTION_CONFIG.plans.pro.monthly.price,
      yearly: SUBSCRIPTION_CONFIG.plans.pro.yearly.price,
    },
    credits: {
      monthly: SUBSCRIPTION_CONFIG.plans.pro.monthly.points,
      yearly: SUBSCRIPTION_CONFIG.plans.pro.yearly.points,
      onSubscribe: 0,
    },
    features: [
      {
        text: `${SUBSCRIPTION_CONFIG.plans.pro.monthly.points.toLocaleString()} credits/month`,
        included: true,
        highlight: true,
      },
      {
        text: `${SUBSCRIPTION_CONFIG.plans.pro.yearly.points.toLocaleString()} credits/year (yearly)`,
        included: true,
        highlight: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.plans.pro.monthly.points / GENERATION_COSTS.nanoBananaImage)} images/mo`,
        included: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.plans.pro.monthly.points / GENERATION_COSTS.sora2Video)} Sora 2 videos/mo`,
        included: true,
      },
      {
        text: 'Watermark-free images',
        included: true,
      },
      {
        text: 'Watermark-free Sora 2 videos',
        included: true,
      },
      {
        text: 'Commercial usage rights',
        included: true,
      },
      {
        text: 'All platform sizes',
        included: true,
      },
      {
        text: 'Priority support',
        included: true,
      },
      {
        text: 'Sora 2 Pro video quality',
        included: false,
      },
    ],
    popular: true,
    creemProductIds: {
      monthly: process.env.CREEM_PRO_PLAN_ID || '',
      yearly: process.env.CREEM_PRO_YEARLY_PLAN_ID || '',
    },
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    description: 'Maximum power for professionals',
    price: {
      monthly: SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.price,
      yearly: SUBSCRIPTION_CONFIG.plans.pro_plus.yearly.price,
    },
    credits: {
      monthly: SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points,
      yearly: SUBSCRIPTION_CONFIG.plans.pro_plus.yearly.points,
      onSubscribe: 0,
    },
    features: [
      {
        text: `${SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points.toLocaleString()} credits/month`,
        included: true,
        highlight: true,
      },
      {
        text: `${SUBSCRIPTION_CONFIG.plans.pro_plus.yearly.points.toLocaleString()} credits/year (yearly)`,
        included: true,
        highlight: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points / GENERATION_COSTS.nanoBananaImage)} images/mo`,
        included: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points / GENERATION_COSTS.sora2Video)} Sora 2 videos/mo`,
        included: true,
      },
      {
        text: `Up to ${Math.floor(SUBSCRIPTION_CONFIG.plans.pro_plus.monthly.points / GENERATION_COSTS.sora2ProVideo)} Sora 2 Pro videos/mo`,
        included: true,
      },
      {
        text: 'Watermark-free images',
        included: true,
      },
      {
        text: 'Watermark-free Sora 2 videos',
        included: true,
      },
      {
        text: 'Sora 2 Pro quality',
        included: true,
      },
      {
        text: 'Commercial usage rights',
        included: true,
      },
      {
        text: 'All platform sizes',
        included: true,
      },
      {
        text: 'Advanced customization',
        included: true,
      },
      {
        text: 'Dedicated support',
        included: true,
      },
    ],
    creemProductIds: {
      monthly: process.env.CREEM_PRO_PLUS_PLAN_ID || '',
      yearly: process.env.CREEM_PRO_PLUS_YEARLY_PLAN_ID || '',
    },
  },
]

export const CREDITS_PACKS: CreditsPack[] = SUBSCRIPTION_CONFIG.pointsPacks.map(pack => ({
  id: pack.id,
  points: pack.points,
  bonus: pack.bonus,
  price: pack.price,
  popular: pack.id === 'pack_200',
  creemProductId: process.env[`CREEM_POINTS_PACK_${pack.points}_ID`],
}))

export const PRICING_FAQ = [
  {
    id: 'authentication-required',
    question: 'Do I need to sign up to generate content?',
    answer:
      'Yes, authentication is required for all content generation. You must create an account and sign in to generate images or videos. This ensures secure access and proper credit management. Free users receive 30 signup bonus credits that never expire.',
  },
  {
    id: 'credits-work',
    question: 'How do credits work?',
    answer:
      'Credits are used to generate content. Each generation type costs different amounts: Nano Banana images cost 5 credits, Sora 2 videos cost 20 credits, and Sora 2 Pro videos cost 80 credits. All generation requires sufficient credits before processing starts. Your credits refresh monthly with your subscription, and unused credits from one-time packs never expire.',
  },
  {
    id: 'yearly-savings',
    question: 'How much do I save with yearly billing?',
    answer:
      'Yearly plans save you 20% compared to monthly billing. For example, the Pro plan costs $14.9/month ($178.8/year) on monthly billing, but only $143.04/year on yearly billing - a savings of $35.76 per year! Plus, yearly plans give you 12 months of credits upfront (9,600 credits for Pro, 19,200 credits for Pro+).',
  },
  {
    id: 'credits-expire',
    question: 'Do credits expire?',
    answer:
      'Subscription credits refresh monthly and do not roll over. However, credits purchased through one-time credit packs never expire and can be used anytime. Your free signup bonus credits also never expire.',
  },
  {
    id: 'upgrade-downgrade',
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll get prorated credits immediately. When downgrading, the change takes effect at the end of your current billing period, and you keep access to your current plan until then.',
  },
  {
    id: 'refund-policy',
    question: 'What is your refund policy?',
    answer:
      'All subscription purchases are final and non-refundable. This includes first-time purchases, renewals, and upgrades. Credit packs are also non-refundable after purchase but never expire. We will correct billing errors (duplicate charges, incorrect amounts) and address technical issues that prevent service use. Please contact support if you experience any billing errors.',
  },
  {
    id: 'free-plan-limits',
    question: 'What are the limits for the free plan?',
    answer:
      'Free plan users receive 30 signup bonus credits (one-time) that never expire. This allows up to 6 images with the signup bonus. All generation requires authentication and sufficient credits. There are no daily or monthly quotas - generation is limited only by your available credits. To generate more content, you can purchase a subscription or credit packs.',
  },
  {
    id: 'commercial-use',
    question: 'Can I use generated content commercially?',
    answer:
      'Yes! Pro and Pro+ plans include commercial usage rights. You can use all generated images and videos in commercial projects, marketing materials, and client work. Free plan users can only use content for personal, non-commercial purposes.',
  },
  {
    id: 'watermark',
    question: 'Do Pro plans have watermarks?',
    answer:
      'All plans get watermark-free images! For videos, Pro and Pro+ plans generate completely watermark-free Sora 2 videos. Free plan users get watermark-free images but do not have access to video generation.',
  },
  {
    id: 'multiple-projects',
    question: 'Can I use credits across multiple projects?',
    answer:
      'Absolutely! Your credits can be used for any generation across all your projects. There are no project limits - create as many different covers, posters, or videos as you need until you run out of credits.',
  },
  {
    id: 'team-plan',
    question: 'Do you offer team plans?',
    answer:
      'Team plans are coming soon! We\'re working on multi-user accounts with shared credit pools and team management features. Join our waitlist to be notified when team plans launch.',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor Creem. For users in China, we also support Alipay and WeChat Pay.',
  },
]

export const PRICING_CONFIG = {
  plans: PRICING_PLANS,
  creditsPacks: CREDITS_PACKS,
  generationCosts: GENERATION_COSTS,
  faq: PRICING_FAQ,
  discount: {
    yearly: 20,
    message: 'Save 20%',
  },
} as const
