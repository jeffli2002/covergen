'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Check, Crown, Sparkles, Zap, X } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { useAppStore } from '@/lib/store'
import { PRICING_CONFIG } from '@/config/pricing.config'
import Link from 'next/link'
import { UpgradeConfirmationDialog } from '@/components/pricing/UpgradeConfirmationDialog'
import { toast } from '@/components/ui/use-toast'

interface SubscriptionInfo {
  status: string
  plan: string
  tier: string
  isActive: boolean
  isTrialing: boolean
  trialDaysRemaining: number | null
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  canUpgrade: boolean
  canDowngrade: boolean
  stripeSubscriptionId: string | null
  requiresPaymentSetup?: boolean
  isManualTrial?: boolean
  billing_cycle?: 'monthly' | 'yearly'
}

interface PricingSectionProps {
  locale?: string
  showToggle?: boolean
  showViewAllLink?: boolean
}

const PENDING_PLAN_KEY = 'covergen_pending_plan'

const planIcons = {
  free: Sparkles,
  pro: Zap,
  pro_plus: Crown,
}

export default function PricingSection({ 
  locale = 'en', 
  showToggle = true,
  showViewAllLink = true 
}: PricingSectionProps = {}) {
  const { user: authUser, session } = useBestAuth()
  const router = useRouter()
  const { subscriptionRefreshTrigger } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [isYearly, setIsYearly] = useState(true) // Default to yearly to show savings
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    planId: string
    billingCycle: 'monthly' | 'yearly'
  } | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  
  // Fetch subscription info when component mounts or auth changes
  useEffect(() => {
    if (authUser && session) {
      fetchSubscriptionInfo()
    } else {
      setSubscriptionInfo(null)
    }
  }, [authUser, session, subscriptionRefreshTrigger])
  
  const fetchSubscriptionInfo = async () => {
    setLoadingSubscription(true)
    try {
      if (!session?.token) {
        setLoadingSubscription(false)
        return
      }
      
      const response = await fetch('/api/bestauth/subscription/status', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const normalizedData = {
          ...data,
          plan: data.plan || data.tier,
          tier: data.tier || data.plan
        }
        setSubscriptionInfo(normalizedData)
        
        // Update store
        const tier = normalizedData.tier || normalizedData.plan || 'free'
        const currentStoreUser = useAppStore.getState().user
        if (authUser && (!currentStoreUser || currentStoreUser.tier !== tier)) {
          useAppStore.getState().setUser({
            id: authUser.id,
            email: authUser.email,
            tier: tier as 'free' | 'pro' | 'pro_plus',
            quotaLimit: 10,
            quotaUsed: currentStoreUser?.quotaUsed || 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }
  
  // Check for pending plan on mount
  useEffect(() => {
    if (authUser) {
      const storedPlan = localStorage.getItem(PENDING_PLAN_KEY)
      if (storedPlan && storedPlan !== 'free') {
        localStorage.removeItem(PENDING_PLAN_KEY)
        router.push(`/${locale}/payment?plan=${storedPlan}`)
      }
    }
  }, [authUser, router, locale])

  const handleSubscribe = (planId: string) => {
    // For free tier, scroll to generator
    if (planId === 'free') {
      const generatorSection = document.getElementById('generator')
      if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: 'smooth' })
      } else if (window.location.pathname !== '/') {
        window.location.href = '/#generator'
      }
      return
    }

    // For paid tiers, check authentication
    if (!authUser) {
      setPendingPlan(planId)
      localStorage.setItem(PENDING_PLAN_KEY, planId)
      setShowAuthModal(true)
      return
    }

    const billingCycle = isYearly ? 'yearly' : 'monthly'
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
    const currentTier = subscriptionInfo?.plan || 'free'

    // Check if this is an upgrade scenario (requires confirmation)
    const isUpgrade = subscriptionInfo && currentTier !== 'free' && (
      // Tier upgrade (Pro -> Pro+)
      (currentTier === 'pro' && planId === 'pro_plus') ||
      // Billing cycle change on same tier
      (currentTier === planId && currentBillingCycle !== billingCycle)
    )

    if (isUpgrade) {
      // Show confirmation dialog for upgrades
      setPendingUpgrade({ planId, billingCycle })
      setShowUpgradeDialog(true)
      return
    }

    // Navigate to payment page for new subscriptions
    let paymentUrl = `/${locale}/payment?plan=${planId}&billing=${billingCycle}`
    
    if (subscriptionInfo) {
      // For trial activation
      if (subscriptionInfo.isTrialing && subscriptionInfo.requiresPaymentSetup && subscriptionInfo.plan === planId) {
        paymentUrl = `/${locale}/payment?plan=${planId}&activate=true&billing=${billingCycle}`
      }
    }
    
    router.push(paymentUrl)
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
        const cycleText = pendingUpgrade.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'
        toast({
          title: 'Upgrade Successful!',
          description: `Successfully upgraded to ${planName} ${cycleText}. Redirecting to your account...`,
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
        description: error.message || 'Something went wrong. Please try again.'
      })
      setIsUpgrading(false)
    }
  }

  const handleAuthSuccess = (authenticatedUser: any) => {
    setShowAuthModal(false)
    
    if (pendingPlan && pendingPlan !== 'free') {
      setTimeout(() => {
        router.push(`/${locale}/payment?plan=${pendingPlan}&billing=${isYearly ? 'yearly' : 'monthly'}`)
        setPendingPlan(null)
      }, 100)
    }
  }

  const getCredits = (plan: typeof PRICING_CONFIG.plans[0]) => {
    return isYearly ? plan.credits.yearly : plan.credits.monthly
  }

  const getPrice = (plan: typeof PRICING_CONFIG.plans[0]) => {
    const price = isYearly ? plan.price.yearly : plan.price.monthly
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const getMonthlyEquivalent = (plan: typeof PRICING_CONFIG.plans[0]) => {
    return isYearly ? (plan.price.yearly / 12).toFixed(1) : plan.price.monthly.toFixed(1)
  }

  const getButtonText = (plan: typeof PRICING_CONFIG.plans[0]) => {
    if (loadingSubscription) return 'Loading...'
    
    // Check if this is the EXACT current plan (tier + billing cycle)
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
    const selectedBillingCycle = isYearly ? 'yearly' : 'monthly'
    const currentTier = subscriptionInfo?.plan || 'free'
    const isExactCurrentPlan = currentTier === plan.id && currentBillingCycle === selectedBillingCycle
    const isSameTierDifferentCycle = currentTier === plan.id && currentBillingCycle !== selectedBillingCycle
    
    if (isExactCurrentPlan) {
      if (subscriptionInfo?.isTrialing && subscriptionInfo?.requiresPaymentSetup) {
        return 'Activate Plan'
      }
      return 'Current Plan'
    }
    
    if (isSameTierDifferentCycle && plan.id !== 'free') {
      return selectedBillingCycle === 'yearly' ? 'Switch to Yearly' : 'Switch to Monthly'
    }

    if (plan.id === 'free') return 'Get Started Free'
    
    if (subscriptionInfo && subscriptionInfo.plan !== 'free') {
      if (plan.id === 'pro_plus' && subscriptionInfo.plan === 'pro') {
        return 'Upgrade to Pro+'
      }
    }

    return `Start ${plan.name}`
  }

  const isButtonDisabled = (plan: typeof PRICING_CONFIG.plans[0]) => {
    if (loadingSubscription || plan.comingSoon) return true
    
    // Check both tier AND billing cycle to determine if this is the exact current plan
    const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
    const selectedBillingCycle = isYearly ? 'yearly' : 'monthly'
    const currentTier = subscriptionInfo?.plan || 'free'
    const isExactCurrentPlan = currentTier === plan.id && currentBillingCycle === selectedBillingCycle
    
    // Only disable if this is the exact current plan (same tier + same billing cycle)
    if (isExactCurrentPlan && !subscriptionInfo?.isTrialing) return true

    // Disable downgrade to free
    if (plan.id === 'free' && subscriptionInfo && subscriptionInfo.plan !== 'free') {
      return true
    }

    // Disable downgrade from Pro+ to Pro
    if (plan.id === 'pro' && currentTier === 'pro_plus') {
      return true
    }

    // Note: Allow switching billing cycles (Pro+ Monthly -> Pro+ Yearly)
    // This is handled by showing "Switch to Yearly/Monthly" button text

    return false
  }

  return (
    <>
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Simple, Credits-Based Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Flexible pricing with credits that give you full control over your usage
            </p>
          </div>

          {/* Yearly/Monthly Toggle */}
          {showToggle && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
                <span className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !isYearly ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
                }`} onClick={() => setIsYearly(false)}>
                  Monthly
                </span>
                <Switch 
                  checked={isYearly} 
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-orange-500"
                />
                <span className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  isYearly ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-500'
                }`} onClick={() => setIsYearly(true)}>
                  Yearly
                </span>
              </div>
              {isYearly && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3 py-1 text-sm font-medium">
                  Save 20%
                </Badge>
              )}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {PRICING_CONFIG.plans.map((plan) => {
              const Icon = planIcons[plan.id]
              const currentBillingCycle = subscriptionInfo?.billing_cycle || 'monthly'
              const selectedBillingCycle = isYearly ? 'yearly' : 'monthly'
              const currentTier = subscriptionInfo?.plan || 'free'
              const isCurrentPlan = currentTier === plan.id && currentBillingCycle === selectedBillingCycle
              const credits = getCredits(plan)

              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                    plan.popular ? 'border-orange-500 shadow-xl scale-105 ring-2 ring-orange-200' : 'border-gray-200'
                  } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''} bg-white hover:shadow-2xl`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
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
                      </div>
                    )}

                    {plan.credits.onSignup && plan.credits.onSignup > 0 && (
                      <Badge variant="outline" className="border-purple-200 text-purple-700 px-3 py-1 mt-2">
                        {plan.credits.onSignup} free credits on signup
                      </Badge>
                    )}

                    {/* Price Display */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price.monthly === 0 ? '0' : getMonthlyEquivalent(plan)}
                        </span>
                        <span className="text-xl text-gray-600">/mo</span>
                        {plan.price.monthly > 0 && isYearly && (
                          <span className="text-lg text-gray-400 line-through ml-2">
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
                    <div className="border-t pt-4 mb-4"></div>

                    {/* Key Features */}
                    <ul className="space-y-2.5 mb-6">
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
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                          : plan.id === 'free'
                          ? 'border-gray-300 hover:bg-gray-50'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                      size="lg"
                      disabled={isButtonDisabled(plan)}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {getButtonText(plan)}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* View All Plans Link */}
          {showViewAllLink && (
            <div className="text-center mt-12">
              <Link href={`/${locale}/pricing`}>
                <Button variant="outline" size="lg" className="group">
                  View All Features & FAQ
                  <Sparkles className="w-4 h-4 ml-2 group-hover:text-orange-500 transition-colors" />
                </Button>
              </Link>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="text-center mt-8 space-y-4">
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
                No setup fees
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => {
            setShowAuthModal(false)
            setPendingPlan(null)
            localStorage.removeItem(PENDING_PLAN_KEY)
          }}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

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
    </>
  )
}
