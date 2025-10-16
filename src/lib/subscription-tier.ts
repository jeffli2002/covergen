export type SubscriptionTier = 'free' | 'pro' | 'pro_plus'
export type SubscriptionBillingCycle = 'monthly' | 'yearly'

export interface NormalizedSubscriptionTier {
  tier: SubscriptionTier | null
  billingCycle?: SubscriptionBillingCycle
  original?: string | null | undefined
  wasNormalized: boolean
}

const normalizeString = (value?: string | null): string => {
  if (!value) {
    return ''
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

const pullCycleFromValue = (
  normalizedValue: string,
  fallback?: SubscriptionBillingCycle
): { value: string; cycle?: SubscriptionBillingCycle } => {
  let value = normalizedValue
  let cycle = fallback

  if (/(?:_|)(annual|yearly)$/.test(value)) {
    value = value.replace(/(?:_|)(annual|yearly)$/g, '')
    cycle = cycle ?? 'yearly'
  } else if (/(?:_|)(monthly|month)$/.test(value)) {
    value = value.replace(/(?:_|)(monthly|month)$/g, '')
    cycle = cycle ?? 'monthly'
  }

  return { value, cycle }
}

/**
 * Normalize subscription tiers coming from Creem, database records, or legacy flows.
 * Examples:
 *  - "Pro_Monthly"      -> { tier: "pro", billingCycle: "monthly" }
 *  - "pro-plus-yearly"  -> { tier: "pro_plus", billingCycle: "yearly" }
 *  - "PROPLUS"          -> { tier: "pro_plus" }
 *  - "free_trial"       -> { tier: "free" }
 */
export const normalizeSubscriptionTier = (
  rawTier?: string | null,
  rawCycle?: SubscriptionBillingCycle | null | undefined
): NormalizedSubscriptionTier => {
  const normalizedInput = normalizeString(rawTier)
  if (!normalizedInput) {
    return {
      tier: null,
      billingCycle: rawCycle ?? undefined,
      original: rawTier,
      wasNormalized: false
    }
  }

  const { value, cycle } = pullCycleFromValue(normalizedInput, rawCycle ?? undefined)

  if (value === 'free' || value.startsWith('free')) {
    return {
      tier: 'free',
      billingCycle: cycle,
      original: rawTier,
      wasNormalized: value !== normalizedInput || rawTier !== 'free'
    }
  }

  if (value === 'pro_plus' || value === 'proplus') {
    return {
      tier: 'pro_plus',
      billingCycle: cycle,
      original: rawTier,
      wasNormalized: value !== normalizedInput || rawTier !== 'pro_plus'
    }
  }

  if (value.includes('pro_plus') || value.includes('proplus')) {
    return {
      tier: 'pro_plus',
      billingCycle: cycle,
      original: rawTier,
      wasNormalized: true
    }
  }

  if (value === 'pro') {
    return {
      tier: 'pro',
      billingCycle: cycle,
      original: rawTier,
      wasNormalized: value !== normalizedInput || rawTier !== 'pro'
    }
  }

  if (value.startsWith('pro')) {
    return {
      tier: 'pro',
      billingCycle: cycle,
      original: rawTier,
      wasNormalized: true
    }
  }

  // Unknown tiers fallback to free when caller needs a tier value.
  return {
    tier: null,
    billingCycle: cycle,
    original: rawTier,
    wasNormalized: false
  }
}

export const normalizeTierWithFallback = (
  rawTier?: string | null,
  rawCycle?: SubscriptionBillingCycle | null | undefined,
  fallback: SubscriptionTier = 'free'
): { tier: SubscriptionTier; billingCycle?: SubscriptionBillingCycle } => {
  const normalized = normalizeSubscriptionTier(rawTier, rawCycle)

  return {
    tier: normalized.tier ?? fallback,
    billingCycle: normalized.billingCycle
  }
}
