'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Check, Crown, Sparkles, Zap, X } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import { PRICING_CONFIG, type PricingPlan } from '@/config/pricing.config'
import { CreditsPacks } from './CreditsPacks'
import { PricingFAQ } from './PricingFAQ'
import { UpgradeConfirmationDialog } from './UpgradeConfirmationDialog'
import { toast } from '@/components/ui/use-toast'

interface SubscriptionInfo {
  status: string
  plan: string
  tier: string
  isActive: boolean
  isTrialing: boolean
  cancelAtPeriodEnd: boolean
  billing_cycle?: 'monthly' | 'yearly'
}

interface PricingPageProps {
  locale?: string
}

export default function PricingPage({ locale = 'en' }: PricingPageProps = {}) {
  const { user, session } = useBestAuth()
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(true) // Default to yearly to show savings
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    planId: string
    billingCycle: 'monthly' | 'yearly'
  } | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Fetch subscription info on mount
  useEffect(() => {
    if (user && session) {
      fetchSubscriptionInfo()
    }
  }, [user, session])

  const fetchSubscriptionInfo = async () => {
    setLoadingSubscription(true)
    try {
      if (!session?.token) return

      const response = await fetch('/api/bestauth/subscription/status', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo({
          ...data,
          plan: data.plan || data.tier,
          tier: data.tier || data.plan
        })
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      router.push('/#generator')
      return
    }

    if (!user) {
      router.push(`/sign-in?redirect=/pricing&plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`)
      return
    }

    const billingCycle = isYearly ? 'yearly' : 'monthly'
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'

    // Check if this is an upgrade scenario (requires confirmation)
    const currentTier = subscriptionInfo?.tier || subscriptionInfo?.plan || 'free'
    const isUpgrade = subscriptionInfo && currentTier !== 'free' && (
      // Tier upgrade (Pro -> Pro+)
      (currentTier === 'pro' && planId === 'pro_plus') ||
      // Billing cycle change
      (currentTier === planId && currentBillingCycle !== billingCycle)
    )

    if (isUpgrade) {
      // Show confirmation dialog for upgrades
      setPendingUpgrade({ planId, billingCycle })
      setShowUpgradeDialog(true)
    } else {
      // Direct to payment page for new subscriptions
      router.push(`/${locale}/payment?plan=${planId}&billing=${billingCycle}`)
    }
  }

  const handleConfirmUpgrade = async () => {
    if (!pendingUpgrade || !session?.token) return

    setIsUpgrading(true)
    try {
      const response = await fetch('/api/bestauth/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          targetTier: pendingUpgrade.planId,
          billingCycle: pendingUpgrade.billingCycle
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowUpgradeDialog(false)
        
        // Show success toast
        const planName = pendingUpgrade.planId === 'pro' ? 'Pro' : 'Pro+'
        toast({
          title: 'Upgrade Successful!',
          description: `Successfully upgraded to ${planName}. Redirecting to your account...`,
        })

        // Wait a moment for user to see the success message
        setTimeout(() => {
          const redirectUrl = data.redirectUrl || `/${locale}/account?upgraded=true`
          window.location.href = redirectUrl
        }, 2000)
      } else if (data.checkoutUrl) {
        // Need to complete checkout
        window.location.href = data.checkoutUrl
      } else {
        throw new Error(data.error || 'Failed to upgrade subscription')
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Something went wrong. Please try again.',
      })
      setIsUpgrading(false)
    }
  }

  const getButtonText = (plan: PricingPlan) => {
    if (loadingSubscription) return 'Loading...'
    
    // Check if this is the EXACT current plan (tier + billing cycle)
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
    const selectedBillingCycle = isYearly ? 'yearly' : 'monthly'
    const currentTier = subscriptionInfo?.tier || subscriptionInfo?.plan || 'free'
    const isExactCurrentPlan = currentTier === plan.id && currentBillingCycle === selectedBillingCycle
    const isSameTierDifferentCycle = currentTier === plan.id && currentBillingCycle !== selectedBillingCycle
    
    if (isExactCurrentPlan) {
      if (subscriptionInfo?.isTrialing) return 'Activate Plan'
      return 'Current Plan'
    }
    
    if (isSameTierDifferentCycle) {
      return selectedBillingCycle === 'yearly' ? 'Switch to Yearly' : 'Switch to Monthly'
    }

    if (plan.id === 'free') return 'Get Started Free'
    
    if (subscriptionInfo && currentTier !== 'free') {
      if (plan.id === 'pro_plus' && currentTier === 'pro') {
        return 'Upgrade to Pro+'
      }
      if (plan.id === 'pro' && currentTier === 'pro_plus') {
        return 'Not Available'
      }
    }

    return `Start ${plan.name}`
  }

  const isButtonDisabled = (plan: PricingPlan) => {
    if (loadingSubscription) return true
    if (plan.comingSoon) return true
    
    // PREVENT DUPLICATE: Check both tier AND billing cycle
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
    const selectedBillingCycle = isYearly ? 'yearly' : 'monthly'
    const currentTier = subscriptionInfo?.tier || subscriptionInfo?.plan || 'free'
    const isExactCurrentPlan = currentTier === plan.id && currentBillingCycle === selectedBillingCycle
    
    // Disable button if this is the exact current plan (same tier + same billing cycle)
    if (isExactCurrentPlan && !subscriptionInfo?.isTrialing) return true

    // Disable downgrade to free for paid users
    if (plan.id === 'free' && subscriptionInfo && currentTier !== 'free') {
      return true
    }

    // Disable downgrade from Pro+ to Pro
    if (plan.id === 'pro' && currentTier === 'pro_plus') {
      return true
    }

    // Note: Allow switching billing cycles (Pro Monthly -> Pro Yearly)
    // This is handled by showing "Switch to Yearly/Monthly" button text

    return false
  }

  const getCreditsAmount = (plan: PricingPlan) => {
    return isYearly ? plan.credits.yearly : plan.credits.monthly
  }

  const getMonthlyEquivalent = (plan: PricingPlan) => {
    return isYearly ? (plan.price.yearly / 12).toFixed(1) : plan.price.monthly.toFixed(1)
  }

  const planIcons = {
    free: Sparkles,
    pro: Zap,
    pro_plus: Crown,
  }

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Simple, Credits-Based Pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Pay only for what you need. Credits never expire with one-time packs.
          </p>

          {/* Yearly/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
              <span className={`px-4 py-2 rounded-xl transition-all ${
                !isYearly ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
              }`}>
                Monthly
              </span>
              <Switch 
                checked={isYearly} 
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-orange-500"
              />
              <span className={`px-4 py-2 rounded-xl transition-all ${
                isYearly ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
              }`}>
                Yearly
              </span>
            </div>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 text-sm font-medium">
                {PRICING_CONFIG.discount.message}
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {PRICING_CONFIG.plans.map((plan, index) => {
            const Icon = planIcons[plan.id]
            const currentTier = subscriptionInfo?.tier || subscriptionInfo?.plan || 'free'
            const isCurrentPlan = currentTier === plan.id
            const credits = getCreditsAmount(plan)

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular ? 'border-orange-500 shadow-xl scale-105 ring-2 ring-orange-200' : 'border-gray-200'
                } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-blue-500 text-white px-3 py-1 shadow-lg">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-2xl ${
                      plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                  </div>

                  <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                  <CardDescription className="text-base text-gray-600 min-h-[3rem] flex items-center justify-center">
                    {plan.description}
                  </CardDescription>

                  {/* Credits Display */}
                  {credits > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                        {credits.toLocaleString()} credits{isYearly ? '/year' : '/mo'}
                      </Badge>
                      {plan.credits.onSubscribe > 0 && (
                        <Badge variant="outline" className="border-green-200 text-green-700 px-3 py-1">
                          +{plan.credits.onSubscribe} bonus
                        </Badge>
                      )}
                    </div>
                  )}

                  {plan.credits.onSignup && plan.credits.onSignup > 0 && (
                    <Badge variant="outline" className="border-purple-200 text-purple-700 px-3 py-1 mt-2">
                      {plan.credits.onSignup} free credits on signup
                    </Badge>
                  )}

                  {/* Price Display */}
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ${plan.price.monthly === 0 ? '0' : getMonthlyEquivalent(plan)}
                      </span>
                      <span className="text-2xl text-gray-600">/mo</span>
                      {plan.price.monthly > 0 && isYearly && (
                        <span className="text-xl text-gray-400 line-through ml-2">
                          ${plan.price.monthly.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {plan.price.monthly > 0 && isYearly && (
                      <p className="text-sm text-gray-500 mt-2">
                        ${plan.price.yearly.toFixed(2)} billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="border-t pt-6 mb-6"></div>

                  {/* Key Features */}
                  <ul className="space-y-3 mb-6">
                    {/* Credits Info */}
                    {credits > 0 ? (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {credits.toLocaleString()} credits{isYearly ? '/year' : '/month'}
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900">
                          {plan.credits.onSignup} credits on signup
                        </span>
                      </li>
                    )}

                    {/* Generation Capacity */}
                    {credits > 0 && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-700">
                            Up to {Math.floor(credits / PRICING_CONFIG.generationCosts.nanoBananaImage)} Nano Banana images
                          </span>
                        </li>
                        {plan.id !== 'free' && (
                          <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                            <span className="text-sm text-gray-700">
                              Up to {Math.floor(credits / PRICING_CONFIG.generationCosts.sora2Video)} Sora 2 videos
                            </span>
                          </li>
                        )}
                      </>
                    )}

                    {plan.id === 'free' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Up to {PRICING_CONFIG.plans[0].features.find(f => f.text.includes('images per day'))?.text.split(' ')[0]} images per day
                        </span>
                      </li>
                    )}

                    {/* Watermark-free */}
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        Watermark-free images
                      </span>
                    </li>
                    {plan.id !== 'free' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Watermark-free <span className="font-semibold">Sora 2</span> videos
                        </span>
                      </li>
                    )}

                    {/* AI Tools */}
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI thumbnail maker
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI event poster maker
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI anime poster maker
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI album cover maker
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI game cover maker
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-700">
                        AI book cover maker
                      </span>
                    </li>

                    {/* Usage Rights */}
                    {plan.id === 'free' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Personal use only
                        </span>
                      </li>
                    )}
                    {plan.id !== 'free' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Commercial usage rights
                        </span>
                      </li>
                    )}

                    {/* No Ads */}
                    {plan.id !== 'free' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          No ads
                        </span>
                      </li>
                    )}

                    {/* Additional Features for Paid Plans */}
                    {plan.id === 'pro' && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">
                          Priority support
                        </span>
                      </li>
                    )}

                    {plan.id === 'pro_plus' && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-700">
                            Sora 2 Pro quality
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                          <span className="text-sm text-gray-700">
                            Dedicated support
                          </span>
                        </li>
                      </>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full mt-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                        : plan.id === 'free'
                        ? 'border-gray-300 hover:bg-gray-50'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    variant={plan.id === 'free' ? 'outline' : 'default'}
                    size="lg"
                    disabled={isButtonDisabled(plan)}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Credits Packs Section - Temporarily Hidden */}
        {/* <CreditsPacks locale={locale} /> */}

        {/* Trust Indicators */}
        <div className="text-center mt-12 mb-16 space-y-4">
          <p className="text-sm text-gray-600">
            All plans include watermark-free content for professional use
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              14-day money back
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              No setup fees
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              24/7 support
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <PricingFAQ />
      </div>

      {/* Upgrade Confirmation Dialog */}
      {pendingUpgrade && subscriptionInfo && (
        <UpgradeConfirmationDialog
          open={showUpgradeDialog}
          onClose={() => {
            setShowUpgradeDialog(false)
            setPendingUpgrade(null)
          }}
          onConfirm={handleConfirmUpgrade}
          currentTier={subscriptionInfo.tier as 'free' | 'pro' | 'pro_plus'}
          targetTier={pendingUpgrade.planId as 'pro' | 'pro_plus'}
          currentBillingCycle={subscriptionInfo.billing_cycle}
          targetBillingCycle={pendingUpgrade.billingCycle}
          isUpgrading={isUpgrading}
        />
      )}
    </div>
  )
}
