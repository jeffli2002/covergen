'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, CreditCard, Crown, Home, Info, Loader2, Shield, Sparkles, UserCircle, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useBestAuth } from '@/hooks/useBestAuth'
import { creemService, SUBSCRIPTION_PLANS, CREEM_TEST_CARDS } from '@/services/payment/creem'
import { bestAuthPaymentService } from '@/services/payment/bestauth-payment'
import { toast } from 'sonner'
import CreemDebug from '@/components/debug/CreemDebug'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface PaymentPageClientProps {
  locale: string
  initialPlan?: string
  initialBilling?: 'monthly' | 'yearly'
  isUpgrade?: boolean
  isActivation?: boolean
  redirectUrl?: string
}

export default function PaymentPageClient({ 
  locale, 
  initialPlan = 'pro',
  initialBilling = 'monthly',
  isUpgrade = false,
  isActivation = false,
  redirectUrl 
}: PaymentPageClientProps) {
  const router = useRouter()
  const { user } = useAppStore()
  const { user: authUser, loading: authLoading, session } = useBestAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus' | null>(
    // Pre-select target plan for upgrade scenarios
    isUpgrade && initialPlan ? initialPlan as 'pro' | 'pro_plus' : null
  )
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBilling)
  const [isTestMode, setIsTestMode] = useState(false)
  // Remove the local interface - use the actual subscription data structure
  type Subscription = any
  
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  useEffect(() => {
    // Check if we're in test mode
    setIsTestMode(creemService.isTestMode())

    console.log('[PaymentPage] Initial load:', {
      authUser: !!authUser,
      authUserEmail: authUser?.email,
      authLoading: authLoading,
      storeUser: !!user,
      storeUserEmail: user?.email,
      session: session ? 'Present' : 'Missing',
      sessionToken: session?.token ? 'Present' : 'Missing'
    })

    // Wait for auth to load
    if (authLoading) {
      return
    }

    // Check authentication after auth has loaded
    if (!authUser) {
      console.log('[PaymentPage] Not authenticated, redirecting...')
      // Redirect to auth with return URL
      const returnUrl = selectedPlan 
        ? `/${locale}/payment?plan=${selectedPlan}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}` 
        : `/${locale}/payment?redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
      router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    // BestAuth handles session management internally via cookies

    // Load current subscription
    loadCurrentSubscription()
  }, [authUser, authLoading, locale, router, redirectUrl, session])

  const loadCurrentSubscription = async () => {
    setIsLoadingSubscription(true)
    try {
      // Use BestAuth API to get subscription
      if (!session?.token) {
        console.log('[PaymentPage] No session token, cannot fetch subscription')
        setCurrentSubscription({ tier: 'free', status: 'active', plan: 'free' })
        setIsLoadingSubscription(false)
        return
      }

      const response = await fetch('/api/bestauth/subscription/status', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      let subscription = null
      if (response.ok) {
        subscription = await response.json()
      }
      
      console.log('[PaymentPage] Raw subscription data:', {
        full: subscription,
        tier: subscription?.tier,
        plan: subscription?.plan,
        status: subscription?.status,
        hasData: !!subscription
      })
      
      // Normalize the subscription data to ensure tier field exists
      if (subscription && subscription.tier) {
        const normalizedSubscription = {
          ...subscription,
          tier: subscription.tier,
          plan: subscription.plan || subscription.tier, // Ensure both fields exist
          status: subscription.status || 'active'
        }
        console.log('[PaymentPage] Normalized subscription:', normalizedSubscription)
        setCurrentSubscription(normalizedSubscription)
      } else if (subscription && subscription.plan) {
        // Handle case where only plan field exists
        const normalizedSubscription = {
          ...subscription,
          tier: subscription.plan,
          plan: subscription.plan,
          status: subscription.status || 'active'
        }
        console.log('[PaymentPage] Normalized subscription (from plan):', normalizedSubscription)
        setCurrentSubscription(normalizedSubscription)
      } else {
        // Set a default free subscription if none exists or no tier/plan found
        console.log('[PaymentPage] No valid subscription found, setting default free subscription')
        console.log('[PaymentPage] Subscription object was:', subscription)
        setCurrentSubscription({
          tier: 'free',
          status: 'active',
          plan: 'free'
        })
      }
      
      // Check if this is a new user
      if (!subscription && initialPlan && initialPlan !== 'free' && authUser) {
        console.log('[PaymentPage] No subscription found, user needs to select a plan')
      }
      
      // Set selected plan based on user's situation
      // For upgrade scenarios, select the target plan immediately
      if (isUpgrade && initialPlan && !selectedPlan) {
        console.log('[PaymentPage] Upgrade scenario, selecting target plan:', initialPlan)
        setSelectedPlan(initialPlan as 'pro' | 'pro_plus')
      }
      // For activation scenarios, select the current plan
      else if (isActivation && subscription && !selectedPlan) {
        console.log('[PaymentPage] Activation scenario, selecting current plan:', subscription.tier)
        setSelectedPlan(subscription.tier as 'pro' | 'pro_plus')
      }
      // For paid Pro users not upgrading, don't select any plan
      else if (subscription && subscription.tier === 'pro' && subscription.status !== 'trialing' && !isUpgrade) {
        console.log('[PaymentPage] Paid Pro user, no plan pre-selected')
        if (selectedPlan) setSelectedPlan(null)
      }
      // For paid Pro+ users, don't select any plan
      else if (subscription && subscription.tier === 'pro_plus' && subscription.status !== 'trialing') {
        console.log('[PaymentPage] Paid Pro+ user, no plan pre-selected')
        if (selectedPlan) setSelectedPlan(null)
      }
      // For new users or free users, use the initial plan
      else if (initialPlan && (!subscription || subscription.tier === 'free') && !selectedPlan) {
        console.log('[PaymentPage] Setting selected plan to:', initialPlan)
        setSelectedPlan(initialPlan as 'pro' | 'pro_plus')
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
      // Set default free subscription on error
      setCurrentSubscription({
        tier: 'free',
        status: 'active',
        plan: 'free'
      })
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const handleSelectPlan = async (planId: 'pro' | 'pro_plus') => {
    console.log('[PaymentPage] handleSelectPlan called with planId:', planId)
    console.log('[PaymentPage] Current authUser:', authUser)
    console.log('[PaymentPage] Current subscription:', currentSubscription)
    console.log('[PaymentPage] Is trial upgrade:', isUpgrade && currentSubscription?.status === 'trialing')
    
    if (authLoading) {
      console.log('[PaymentPage] Auth is still loading')
      toast.error('Please wait, authentication is loading...')
      return
    }
    
    if (!authUser) {
      console.log('[PaymentPage] No authUser found, showing error')
      toast.error('Please sign in to continue')
      return
    }

    setLoading(true)
    
    try {
      // For paid users upgrading (Pro → Pro+)
      if (isUpgrade && currentSubscription?.status === 'active' && currentSubscription?.tier !== 'free') {
        console.log('[PaymentPage] Processing paid user upgrade:', { 
          from: currentSubscription.tier, 
          to: planId,
          hasSubscriptionId: !!currentSubscription?.stripe_subscription_id
        })
        
        if (!session?.token) {
          throw new Error('Authentication required')
        }
        
        const response = await fetch('/api/bestauth/subscription/upgrade', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify({ targetTier: planId })
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          if (data.upgraded) {
            // Instant upgrade successful!
            toast.success(data.message || 'Subscription upgraded successfully!')
            
            // Redirect to account page after a short delay
            setTimeout(() => {
              router.push(`/${locale}/account?upgraded=true`)
            }, 1500)
            return
          } else if (data.checkoutUrl) {
            // Need to complete checkout (fallback)
            window.location.href = data.checkoutUrl
            return
          }
        } else {
          throw new Error(data.error || 'Failed to upgrade subscription')
        }
      }
      
      // For trial users upgrading or activating with payment method
      if ((isUpgrade || isActivation) && currentSubscription?.status === 'trialing' && currentSubscription?.stripe_subscription_id) {
        console.log('[PaymentPage] Processing trial', isActivation ? 'activation' : 'upgrade', 'for user with payment method')
        
        // Use different endpoints for activation vs upgrade
        const endpoint = isActivation ? '/api/bestauth/subscription/activate' : '/api/bestauth/subscription/upgrade'
        const body = isActivation ? {} : { targetTier: planId }
        
        if (!session?.token) {
          throw new Error('Authentication required')
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          body: JSON.stringify(body)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          if (data.upgraded || data.activated) {
            // Instant upgrade/activation successful!
            toast.success(data.message || (isActivation ? 'Plan activated successfully!' : 'Subscription upgraded successfully!'))
            
            // Redirect to account page after a short delay
            setTimeout(() => {
              router.push(`/${locale}/account?${isActivation ? 'activated' : 'upgraded'}=true`)
            }, 1500)
          } else if (data.checkoutUrl) {
            // Need to complete checkout (no payment method on file)
            window.location.href = data.checkoutUrl
          }
        } else {
          throw new Error(data.error || (isActivation ? 'Failed to activate subscription' : 'Failed to upgrade subscription'))
        }
      } else if ((isActivation || isUpgrade) && currentSubscription?.status === 'trialing' && !currentSubscription?.stripe_subscription_id) {
        // Trial user without payment method needs to go through checkout
        console.log('[PaymentPage] Trial user needs to add payment method first')
        
        const result = await bestAuthPaymentService.createCheckoutSession({
          userId: authUser.id,
          userEmail: authUser.email,
          planId,
          billingCycle,
          successUrl: `${window.location.origin}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}&${isActivation ? 'activate=true' : 'upgrade=true'}`,
          cancelUrl: `${window.location.origin}/${locale}/payment/cancel`,
          currentPlan: currentSubscription?.tier || 'free'
        })

        if (result.success && result.url) {
          // Redirect to Creem checkout
          window.location.href = result.url
        } else {
          throw new Error(result.error || 'Failed to create checkout session')
        }
      } else {
        // For new subscriptions, create checkout session
        console.log('[PaymentPage] Creating new checkout session...')
        
        const result = await bestAuthPaymentService.createCheckoutSession({
          userId: authUser.id,
          userEmail: authUser.email,
          planId,
          billingCycle,
          successUrl: `${window.location.origin}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/${locale}/payment/cancel`,
          currentPlan: currentSubscription?.tier || 'free'
        })

        if (result.success && result.url) {
          // Redirect to Creem checkout
          window.location.href = result.url
        } else {
          throw new Error(result.error || 'Failed to create checkout session')
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error.message?.includes('Unable to connect to payment server')) {
        errorMessage = 'Payment service is temporarily unavailable. Please try again later.'
      } else if (error.message?.includes('Authentication required') || 
                 error.message?.includes('Session expired') ||
                 error.message?.includes('invalid JWT') ||
                 error.message?.includes('token has invalid claims') ||
                 error.message?.includes('token is expired')) {
        errorMessage = 'Your session has expired. Please sign in again to continue.'
        // Redirect to auth after a short delay
        setTimeout(() => {
          const returnUrl = `/${locale}/payment?plan=${planId}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
          router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
        }, 2000)
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message?.includes('Invalid plan')) {
        errorMessage = 'Invalid subscription plan selected.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.pro,
      icon: Zap,
      popular: true,
      savings: null
    },
    {
      ...SUBSCRIPTION_PLANS.pro_plus,
      icon: Crown,
      popular: false,
      savings: null
    }
  ]

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    )
  }


  const isTrialUser = currentSubscription?.status === 'trialing'
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-hero-title mb-4 text-gray-900">
            {isActivation ? 'Activate Your Plan' : isUpgrade ? 'Upgrade Your Plan' : 
              currentSubscription?.tier === 'pro' ? 'Upgrade to Pro+' :
              currentSubscription?.tier === 'pro_plus' ? 'Your Subscription' :
              'Choose Your Plan'}
          </h1>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {(() => {
              if (isActivation) {
                return 'Add a payment method to activate your subscription.'
              }
              if (currentSubscription?.tier === 'pro' && !isTrialUser) {
                return 'You\'re currently on the Pro plan. Upgrade to Pro+ for more covers and premium features!'
              }
              if (currentSubscription?.tier === 'pro_plus' && !isTrialUser) {
                return 'You\'re on our highest tier with all premium features and maximum cover generation.'
              }
              if (currentSubscription?.tier === 'free') {
                return (
                  <>
                    Start creating stunning watermark-free <span className="font-semibold text-purple-600">Sora 2</span> powered videos and <span className="font-semibold text-orange-600">nano banana</span> powered AI covers. Upgrade from the free plan for more exports and advanced features.
                  </>
                )
              }
              return (
                <>
                  Start creating stunning watermark-free <span className="font-semibold text-purple-600">Sora 2</span> powered videos and <span className="font-semibold text-orange-600">nano banana</span> powered AI covers. All plans include watermark-free images and videos.
                </>
              )
            })()}
          </p>
          
          {isTestMode && (
            <Alert className="mt-6 max-w-2xl mx-auto border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Test Mode Active:</strong> Use card number {CREEM_TEST_CARDS.success} for testing. 
                No real charges will be made.
              </AlertDescription>
            </Alert>
          )}
          
          {isTestMode && (
            <div className="mt-6">
              <CreemDebug />
            </div>
          )}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-orange-500' : 'bg-gray-300'
            }`}
            disabled={loading}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Save 20%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentSubscription?.tier === plan.id || currentSubscription?.plan === plan.id
            const needsPaymentSetup = isTrialUser && !currentSubscription?.stripe_subscription_id
            const isSelected = selectedPlan === plan.id
            
            // Allow trial users to click their current plan to add payment method
            // Also prevent paid users from selecting their current plan (unless upgrading)
            const isPaidUser = currentSubscription && !isTrialUser && currentSubscription.tier !== 'free' && currentSubscription.tier !== undefined
            const isUpgradeTarget = isUpgrade && initialPlan === plan.id
            
            // Check if this is an upgrade scenario (Pro user viewing Pro+ plan)
            const isUpgradeOption = currentSubscription?.tier === 'pro' && plan.id === 'pro_plus' && !isTrialUser
            
            // Determine if plan is clickable:
            // 1. Trial users can click their current plan to add payment
            // 2. Paid users cannot click their current plan
            // 3. All users can click higher tier plans (upgrades)
            const isClickable = !loading && (
              (!isCurrentPlan && !isPaidUser) || // Free users can click any plan
              (isCurrentPlan && needsPaymentSetup) || // Trial users can click to add payment
              (isUpgradeTarget && !isCurrentPlan) || // Upgrade target is clickable only if not current plan
              isUpgradeOption || // Pro users can upgrade to Pro+
              (!isCurrentPlan && isPaidUser) // Paid users can click different plans (upgrades)
            )
            
            console.log('[PaymentPage] Rendering plan:', plan.id, {
              isCurrentPlan,
              isTrialUser,
              isPaidUser,
              needsPaymentSetup,
              isClickable,
              currentSubscriptionTier: currentSubscription?.tier,
              currentSubscriptionPlan: currentSubscription?.plan,
              currentSubscriptionStatus: currentSubscription?.status,
              planId: plan.id,
              tierMatch: currentSubscription?.tier === plan.id,
              planMatch: currentSubscription?.plan === plan.id,
              subscription: currentSubscription,
              selectedPlan,
              isSelected,
              loading,
              disabled: !isClickable,
              isUpgrade,
              willShowCurrentPlan: isCurrentPlan && isPaidUser
            })
            
            // Temporary debug info directly on the page
            if (plan.id === 'pro' && isUpgrade) {
              console.warn(`DEBUG Pro Plan: isCurrentPlan=${isCurrentPlan}, isPaidUser=${isPaidUser}, tier=${currentSubscription?.tier}`)
            }
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  isClickable ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : 'cursor-not-allowed opacity-75'
                } ${
                  isSelected ? 'ring-2 ring-orange-500 scale-105 shadow-2xl' : ''
                } ${plan.popular ? 'shadow-xl' : ''}`}
                onClick={() => isClickable && setSelectedPlan(plan.id as 'pro' | 'pro_plus')}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {/* Current plan badge - Don't show for paid users during upgrade */}
                {isCurrentPlan && !needsPaymentSetup && isPaidUser && !isUpgrade && (
                  <div className="absolute -top-4 left-4 z-10">
                    <Badge className="bg-gray-600 text-white px-4 py-1">
                      Your Current Plan
                    </Badge>
                  </div>
                )}
                
                {/* Trial current plan badge */}
                {isCurrentPlan && isTrialUser && (
                  <div className="absolute -top-4 left-4 z-10">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      Trial - {currentSubscription?.stripe_subscription_id ? 'Active' : 'Add Payment'}
                    </Badge>
                  </div>
                )}
                
                
                {isSelected && (
                  <div className="absolute -inset-0.5 bg-orange-500 rounded-lg opacity-20"></div>
                )}
                
                {/* Click hint on hover */}
                {isClickable && !isSelected && (
                  <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                    <Badge variant="secondary" className="text-xs">
                      {needsPaymentSetup && isCurrentPlan ? 'Add payment method' : 'Click to select'}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      plan.popular 
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-heading-4">{plan.name}</CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-heading-2">
                      ${billingCycle === 'yearly' ? (plan.price / 100 * 12 * 0.8).toFixed(2) : plan.price / 100}
                    </span>
                    <span className="text-gray-600">
                      {billingCycle === 'yearly' ? '/yr' : '/mo'}
                    </span>
                  </div>
                  
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2">
                      {plan.savings}
                    </Badge>
                  )}
                  
                  <CardDescription className="mt-3">
                    {plan.id === 'pro' 
                      ? 'Perfect for regular content creators'
                      : 'Best for professionals and teams'
                    }
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  <Button
                    className={`w-full transition-all duration-300 ${
                      isSelected
                        ? plan.popular
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg scale-105'
                          : 'bg-gray-800 hover:bg-gray-900 text-white shadow-lg scale-105'
                        : plan.popular 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : ''
                    }`}
                    variant={!isSelected && !plan.popular ? 'outline' : 'default'}
                    size="lg"
                    disabled={!isClickable}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('[PaymentPage] Button clicked for plan:', plan.id)
                      console.log('[PaymentPage] Button state:', { 
                        isClickable, 
                        needsPaymentSetup, 
                        isCurrentPlan,
                        isTrialUser,
                        isPaidUser,
                        currentSubscriptionTier: currentSubscription?.tier
                      })
                      if (isClickable) {
                        setSelectedPlan(plan.id as 'pro' | 'pro_plus')
                        handleSelectPlan(plan.id as 'pro' | 'pro_plus')
                      }
                    }}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan && isTrialUser ? (
                      <>
                        <Crown className="mr-2 h-4 w-4" />
                        Activate Plan
                      </>
                    ) : isCurrentPlan && needsPaymentSetup ? (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </>
                    ) : isCurrentPlan && isPaidUser ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Current Plan
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {(() => {
                          // Trial user upgrading with payment method = instant
                          if (isUpgrade && isTrialUser && currentSubscription?.stripe_subscription_id) {
                            return 'Upgrade Instantly'
                          }
                          // Trial user upgrading without payment = checkout needed
                          if (isUpgrade && isTrialUser && !currentSubscription?.stripe_subscription_id) {
                            return 'Add Payment & Upgrade'
                          }
                          // Regular upgrade or Pro user viewing Pro+ (upgrade opportunity)
                          if ((isUpgrade || isUpgradeOption) && currentSubscription?.tier === 'pro' && plan.id === 'pro_plus') {
                            return 'Upgrade to Pro+'
                          }
                          // For free users viewing paid plans
                          if (currentSubscription?.tier === 'free') {
                            return 'Upgrade Now'
                          }
                          // For Pro users viewing Pro plan in upgrade scenario
                          if (isUpgrade && currentSubscription?.tier === 'pro' && plan.id === 'pro') {
                            return 'Current Plan'
                          }
                          // Default
                          return 'Upgrade Now'
                        })()}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Trust Badges */}
        <div className="text-center space-y-6">
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Instant Access</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscriptions automatically renew unless cancelled.
          </p>

          {/* Simple Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => router.push(`/${locale}`)}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Homepage
            </Button>
            
            <Button 
              size="lg"
              onClick={() => router.push(`/${locale}/account`)}
            >
              <UserCircle className="w-5 h-5 mr-2" />
              Go to Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}