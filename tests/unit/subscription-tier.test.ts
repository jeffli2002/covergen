import { describe, expect, it } from 'vitest'
import { normalizeSubscriptionTier } from '@/lib/subscription-tier'

describe('normalizeSubscriptionTier', () => {
  it('normalizes monthly pro variants', () => {
    expect(normalizeSubscriptionTier('pro_monthly')).toEqual(
      expect.objectContaining({ tier: 'pro', billingCycle: 'monthly' })
    )
    expect(normalizeSubscriptionTier('Pro-Month')).toEqual(
      expect.objectContaining({ tier: 'pro', billingCycle: 'monthly' })
    )
  })

  it('normalizes yearly pro variants', () => {
    expect(normalizeSubscriptionTier('pro_yearly')).toEqual(
      expect.objectContaining({ tier: 'pro', billingCycle: 'yearly' })
    )
    expect(normalizeSubscriptionTier('PRO-ANNUAL')).toEqual(
      expect.objectContaining({ tier: 'pro', billingCycle: 'yearly' })
    )
  })

  it('normalizes pro plus variants', () => {
    expect(normalizeSubscriptionTier('pro_plus_monthly')).toEqual(
      expect.objectContaining({ tier: 'pro_plus', billingCycle: 'monthly' })
    )
    expect(normalizeSubscriptionTier('pro+yearly')).toEqual(
      expect.objectContaining({ tier: 'pro_plus', billingCycle: 'yearly' })
    )
    expect(normalizeSubscriptionTier('ProPlus')).toEqual(
      expect.objectContaining({ tier: 'pro_plus' })
    )
  })

  it('normalizes free tiers', () => {
    expect(normalizeSubscriptionTier('free_trial')).toEqual(
      expect.objectContaining({ tier: 'free' })
    )
  })

  it('respects explicit billing cycle fallback', () => {
    const result = normalizeSubscriptionTier('pro', 'monthly')
    expect(result).toEqual(
      expect.objectContaining({ tier: 'pro', billingCycle: 'monthly' })
    )
  })

  it('returns null tier when value is unknown', () => {
    const result = normalizeSubscriptionTier('enterprise')
    expect(result.tier).toBeNull()
  })
})
