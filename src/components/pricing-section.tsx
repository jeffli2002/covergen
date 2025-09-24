'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import { useAppStore } from '@/lib/store'

interface SubscriptionInfo {
  status: string
  plan: string
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
}

// Get dynamic configuration
const config = getClientSubscriptionConfig()

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out our AI cover generator',
    icon: Sparkles,
    features: [
      `${config.limits.free.monthly} covers per month`,
      `${config.limits.free.daily} covers per day max`,
      'Basic tool usage',
      'No watermark',
      'All platform sizes',
      'Email support',
      'Personal use only'
    ],
    limitations: [
      `Daily limit: ${config.limits.free.daily} covers`,
      `Monthly limit: ${config.limits.free.monthly} covers`,
      'No commercial usage'
    ],
    cta: 'Get Started',
    popular: false,
    badge: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'Ideal for regular content creators',
    icon: Zap,
    features: [
      `${config.limits.pro.monthly} covers per month`,
      'All tool usage',
      'No watermark',
      'All platform sizes',
      'Priority support',
      'Commercial usage rights'
    ],
    limitations: [],
    cta: 'Get Started',
    popular: true,
    badge: null
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: '$19',
    period: 'per month',
    description: 'For professional creators and teams',
    icon: Crown,
    features: [
      `${config.limits.pro_plus.monthly} covers per month`,
      'All tool usage',
      'No watermark',
      'Full commercial license',
      'Custom brand templates',
      'Dedicated support'
    ],
    limitations: [],
    cta: 'Get Started',
    popular: false,
    badge: null
  }
]

interface PricingSectionProps {
  locale?: string
}

const PENDING_PLAN_KEY = 'covergen_pending_plan'

export default function PricingSection({ locale = 'en' }: PricingSectionProps = {}) {
  const { user: authUser, session } = useBestAuth()
  const router = useRouter()
  const { subscriptionRefreshTrigger } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  
  // Fetch subscription info when component mounts or auth changes
  useEffect(() => {
    if (authUser && session) {
      console.log('[PricingSection] User authenticated, fetching subscription info for:', authUser.email, 'trigger:', subscriptionRefreshTrigger)
      fetchSubscriptionInfo()
    } else {
      console.log('[PricingSection] No authenticated user, clearing subscription info')
      setSubscriptionInfo(null)
    }
  }, [authUser, session, subscriptionRefreshTrigger])
  
  const fetchSubscriptionInfo = async () => {
    setLoadingSubscription(true)
    try {
      if (!session?.token) {
        console.log('[PricingSection] No session token available')
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
        console.log('[PricingSection] Subscription data received:', {
          plan: data.plan,
          tier: data.tier,
          status: data.status,
          isTrialing: data.isTrialing,
          user: authUser?.email,
          fullData: data
        })
        // Ensure we have both plan and tier fields for compatibility
        const normalizedData = {
          ...data,
          plan: data.plan || data.tier, // Ensure plan field exists
          tier: data.tier || data.plan  // Ensure tier field exists
        }
        setSubscriptionInfo(normalizedData)
        
        // Update store's user object with the correct tier
        const tier = normalizedData.tier || normalizedData.plan || 'free'
        const currentStoreUser = useAppStore.getState().user
        if (authUser && (!currentStoreUser || currentStoreUser.tier !== tier)) {
          console.log('[PricingSection] Updating store user tier:', { 
            oldTier: currentStoreUser?.tier, 
            newTier: tier 
          })
          const quotaLimits = {
            free: 10,
            pro: 120,
            pro_plus: 300
          }
          useAppStore.getState().setUser({
            id: authUser.id,
            email: authUser.email,
            tier: tier as 'free' | 'pro' | 'pro_plus',
            quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
            quotaUsed: currentStoreUser?.quotaUsed || 0
          })
        }
      } else {
        console.error('[PricingSection] Subscription API error:', response.status)
        const errorText = await response.text()
        console.error('[PricingSection] Error details:', errorText)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }
  
  // Check for pending plan on mount and after auth
  useEffect(() => {
    if (authUser) {
      const storedPlan = localStorage.getItem(PENDING_PLAN_KEY)
      if (storedPlan && storedPlan !== 'free') {
        console.log('[PricingSection] Found pending plan after auth:', storedPlan)
        localStorage.removeItem(PENDING_PLAN_KEY)
        // Redirect to payment page with the plan
        router.push(`/${locale}/payment?plan=${storedPlan}`)
      }
    }
  }, [authUser, router, locale])

  const handleSubscribe = (tierKey: string) => {
    // For free tier, just navigate to generator
    if (tierKey === 'free') {
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
      // Store the plan they want to subscribe to
      setPendingPlan(tierKey)
      // Also store in localStorage for OAuth flow
      localStorage.setItem(PENDING_PLAN_KEY, tierKey)
      // Show sign-in modal
      setShowAuthModal(true)
      return
    }

    // If authenticated, navigate to payment page with appropriate params
    let paymentUrl = `/${locale}/payment?plan=${tierKey}`
    
    if (subscriptionInfo) {
      // For trial users clicking on their current plan (activation)
      const isActivating = subscriptionInfo.isTrialing && 
                          subscriptionInfo.requiresPaymentSetup && 
                          subscriptionInfo.plan === tierKey
      
      // For any user upgrading to a higher tier
      const isUpgrading = (subscriptionInfo.plan === 'free' && (tierKey === 'pro' || tierKey === 'pro_plus')) ||
                         (subscriptionInfo.plan === 'pro' && tierKey === 'pro_plus')
      
      // For paid users clicking on their current plan, go to account page instead
      if (subscriptionInfo.plan === tierKey && !subscriptionInfo.isTrialing) {
        router.push(`/${locale}/account`)
        return
      }
      
      if (isActivating) {
        paymentUrl = `/${locale}/payment?plan=${tierKey}&activate=true`
      } else if (isUpgrading) {
        paymentUrl = `/${locale}/payment?plan=${tierKey}&upgrade=true`
      }
    }
    
    router.push(paymentUrl)
  }

  const handleAuthSuccess = (authenticatedUser: any) => {
    console.log('[PricingSection] Auth success, pending plan:', pendingPlan)
    setShowAuthModal(false)
    
    // After successful sign-in, redirect to payment with the pending plan
    if (pendingPlan && pendingPlan !== 'free') {
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        console.log('[PricingSection] Redirecting to payment page for plan:', pendingPlan)
        router.push(`/${locale}/payment?plan=${pendingPlan}`)
        setPendingPlan(null)
      }, 100)
    }
  }

  return (
    <>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for you. All images are watermark-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-4">
          {tiers.map((tier) => {
            const Icon = tier.icon
            // Check if this is the user's current tier
            // Only show current tier when user is authenticated and has subscription info
            const isCurrentTier = !!(authUser && subscriptionInfo?.plan === tier.id)
            
            // Check if this is an upgrade option (Pro user viewing Pro+)
            const isUpgradeOption = subscriptionInfo?.plan === 'pro' && tier.id === 'pro_plus' && !subscriptionInfo?.isTrialing
            
            // Determine if plan is selectable
            const isPaidUser = subscriptionInfo && !subscriptionInfo.isTrialing && subscriptionInfo.plan !== 'free'
            const needsPaymentSetup = subscriptionInfo?.isTrialing && subscriptionInfo?.requiresPaymentSetup
            
            // Debug logging for all tiers when user is logged in
            if (authUser?.email) {
              console.log(`[PricingSection] Tier comparison for ${tier.id}:`, {
                tierId: tier.id,
                subscriptionPlan: subscriptionInfo?.plan,
                isCurrentTier,
                isUpgradeOption,
                isPaidUser,
                hasSubscriptionInfo: !!subscriptionInfo,
                subscriptionData: subscriptionInfo
              })
            }
            
            return (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-300 ${
                  // Only allow hover effects if it's selectable
                  (!isCurrentTier || needsPaymentSetup || isUpgradeOption) ? 'hover:scale-105 hover:-translate-y-2 hover:shadow-2xl' : ''
                } ${
                  tier.popular ? 'border-orange-500 shadow-xl scale-105' : 'border-gray-200'
                } ${
                  // Current plan styling
                  isCurrentTier && isPaidUser && !isUpgradeOption ? 'ring-2 ring-gray-400 bg-gray-50 opacity-90' : ''
                } ${
                  isCurrentTier && !isPaidUser ? 'ring-2 ring-green-500' : ''
                } ${
                  // Upgrade option highlighting
                  isUpgradeOption ? 'ring-2 ring-blue-500' : ''
                } bg-white`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {tier.badge && !tier.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}
                
                {/* Current plan badge */}
                {isCurrentTier && isPaidUser && !isUpgradeOption && (
                  <div className="absolute -top-3 left-4">
                    <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Your Current Plan
                    </span>
                  </div>
                )}
                
                {/* Upgrade recommendation badge */}
                {isUpgradeOption && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
                      Recommended Upgrade
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                      tier.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-gray-900">{tier.name}</CardTitle>
                  
                  <div className="text-3xl font-bold text-gray-900">
                    {tier.price}
                    <span className="text-sm font-normal text-gray-500">
                      /{tier.period}
                    </span>
                  </div>
                  
                  
                  <CardDescription className="text-base text-gray-600">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">Features included:</h4>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-500 text-sm">Limitations:</h4>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  {tier.id === 'free' ? (
                    <Button 
                      className="w-full transition-all duration-300 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                      variant="outline"
                      disabled={isCurrentTier}
                      onClick={() => handleSubscribe(tier.id)}
                    >
                      {isCurrentTier ? 'Current Plan' : tier.cta}
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full transition-all duration-300 ${
                        tier.popular 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-lg' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                      disabled={
                        loadingSubscription || 
                        // Disable current plan for paid users only
                        (isCurrentTier && isPaidUser && !isUpgradeOption) ||
                        // Disable downgrade options for paid users
                        (isPaidUser && 
                          ((subscriptionInfo.plan === 'pro_plus' && (tier.id === 'pro' || tier.id === 'free')) || 
                           (subscriptionInfo.plan === 'pro' && tier.id === 'free')))
                      }
                      onClick={() => handleSubscribe(tier.id)}
                    >
                      {(() => {
                        if (loadingSubscription) return 'Loading...'
                        
                        // For trial users on their current plan who need payment setup
                        if (isCurrentTier && subscriptionInfo?.isTrialing && subscriptionInfo?.requiresPaymentSetup) {
                          return 'Activate Plan'
                        }
                        
                        // For paid users on their current plan
                        if (isCurrentTier) return 'Current Plan'
                        
                        // If user is on a trial
                        if (subscriptionInfo?.isTrialing) {
                          // If trying to upgrade from free trial to a paid plan
                          if (subscriptionInfo.plan === 'free') return 'Upgrade'
                          // If on Pro trial looking at Pro+ 
                          if (subscriptionInfo.plan === 'pro' && tier.id === 'pro_plus') return 'Upgrade'
                          // For any other case during trial (like downgrade), show regular CTA
                          return tier.cta
                        }
                        
                        // For paid users (not on trial)
                        if (subscriptionInfo && !subscriptionInfo.isTrialing && subscriptionInfo.plan !== 'free') {
                          // Pro users can upgrade to Pro+
                          if (subscriptionInfo.plan === 'pro' && tier.id === 'pro_plus') return 'Upgrade to Pro+'
                          // Don't show downgrade options for paid users
                          if ((subscriptionInfo.plan === 'pro_plus' && (tier.id === 'pro' || tier.id === 'free')) || 
                              (subscriptionInfo.plan === 'pro' && tier.id === 'free')) {
                            return 'Downgrade Not Available'
                          }
                        }
                        
                        // Default case - show the tier's CTA
                        return tier.cta
                      })()}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-gray-600">
            All plans include watermark-free images for professional use.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <span>✓ Cancel anytime</span>
            <span>✓ No setup fees</span>
            <span>✓ 24/7 support</span>
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
          // Clear pending plan from localStorage on close
          localStorage.removeItem(PENDING_PLAN_KEY)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    )}
    </>
  )
}