'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, CreditCard, Crown, Info, Loader2, Shield, Sparkles, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { creemService, SUBSCRIPTION_PLANS, CREEM_TEST_CARDS } from '@/services/payment/creem'
import { toast } from 'sonner'
import CreemDebug from '@/components/debug/CreemDebug'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface PaymentPageClientProps {
  locale: string
  initialPlan?: string
  isUpgrade?: boolean
  isActivation?: boolean
  redirectUrl?: string
}

export default function PaymentPageClient({ 
  locale, 
  initialPlan = 'pro', 
  isUpgrade = false,
  isActivation = false,
  redirectUrl 
}: PaymentPageClientProps) {
  const router = useRouter()
  const { user } = useAppStore()
  const { user: authUser, loading: authLoading, getUserSubscription } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus'>(initialPlan as any)
  const [isTestMode, setIsTestMode] = useState(false)
  // Remove the local interface - use the actual subscription data structure
  type Subscription = any
  
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [proratedAmount, setProratedAmount] = useState<number | null>(null)
  const [isProcessingTrialUpgrade, setIsProcessingTrialUpgrade] = useState(false)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  
  // Get trial days from environment variables
  const trialDays = parseInt(process.env.NEXT_PUBLIC_TRIAL_DAYS || '3')

  useEffect(() => {
    // Check if we're in test mode
    setIsTestMode(creemService.isTestMode())

    console.log('[PaymentPage] Initial load:', {
      authUser: !!authUser,
      authUserEmail: authUser?.email,
      authLoading: authLoading,
      storeUser: !!user,
      storeUserEmail: user?.email,
      session: authUser ? 'Present' : 'Missing',
      getUserSubscription: typeof getUserSubscription
    })

    // Wait for auth to load
    if (authLoading) {
      return
    }

    // Check authentication after auth has loaded
    if (!authUser) {
      console.log('[PaymentPage] Not authenticated, redirecting...')
      // Redirect to auth with return URL
      const returnUrl = `/${locale}/payment?plan=${selectedPlan}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
      router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    // BestAuth handles session management internally via cookies

    // Load current subscription
    loadCurrentSubscription()
  }, [authUser, authLoading, locale, router, selectedPlan, redirectUrl, getUserSubscription])

  const loadCurrentSubscription = async () => {
    setIsLoadingSubscription(true)
    try {
      const subscription = await getUserSubscription()
      console.log('[PaymentPage] Loaded subscription:', subscription)
      
      // Normalize the subscription data to ensure tier field exists
      if (subscription) {
        const normalizedSubscription = {
          ...subscription,
          tier: subscription.tier || subscription.plan || 'free',
          status: subscription.status || 'active'
        }
        console.log('[PaymentPage] Normalized subscription:', normalizedSubscription)
        setCurrentSubscription(normalizedSubscription)
      } else {
        // Set a default free subscription if none exists
        console.log('[PaymentPage] No subscription found, setting default free subscription')
        setCurrentSubscription({
          tier: 'free',
          status: 'active',
          plan: 'free'
        })
      }
      
      // Calculate prorated amount if upgrading
      if (subscription && subscription.tier === 'pro' && initialPlan === 'pro_plus' && isUpgrade) {
        calculateProratedAmount(subscription)
      }
      
      // Check if this is a trial user wanting to upgrade or activate
      if (subscription && subscription.status === 'trialing' && (isUpgrade || isActivation) && initialPlan) {
        console.log('[PaymentPage] Trial user wants to', isActivation ? 'activate' : 'upgrade', ', processing automatically')
        setIsProcessingTrialUpgrade(true)
        // Automatically start the upgrade/activation process for trial users
        setTimeout(() => {
          handleSelectPlan(initialPlan as 'pro' | 'pro_plus')
        }, 1000)
        return
      }
      
      // Check if this is a new user coming from trial signup
      if (!subscription && initialPlan && initialPlan !== 'free' && authUser) {
        console.log('[PaymentPage] No subscription found, user needs to select a plan')
        // Don't create manual trial - let user go through checkout process
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
  
  // Removed createTrialSubscription - all trials must go through checkout

  const calculateProratedAmount = (subscription: any) => {
    if (!subscription.current_period_end) return
    
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    
    if (daysRemaining > 0) {
      // Calculate unused Pro credit
      const proPricePerDay = SUBSCRIPTION_PLANS.pro.price / 30
      const unusedCredit = proPricePerDay * daysRemaining
      
      // Calculate Pro+ cost for remaining days
      const proPlusPricePerDay = SUBSCRIPTION_PLANS.pro_plus.price / 30
      const proPlusCost = proPlusPricePerDay * daysRemaining
      
      // Prorated amount is the difference
      const prorated = Math.max(0, proPlusCost - unusedCredit)
      setProratedAmount(prorated)
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
      // For trial users upgrading or activating with payment method
      if ((isUpgrade || isActivation) && currentSubscription?.status === 'trialing' && currentSubscription?.stripe_subscription_id) {
        console.log('[PaymentPage] Processing trial', isActivation ? 'activation' : 'upgrade', 'for user with payment method')
        
        // Use different endpoints for activation vs upgrade
        const endpoint = isActivation ? '/api/bestauth/subscription/activate' : '/api/bestauth/subscription/upgrade'
        const body = isActivation ? {} : { targetTier: planId }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        
        const result = await creemService.createCheckoutSession({
          userId: authUser.id,
          userEmail: authUser.email,
          planId,
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
        
        const result = await creemService.createCheckoutSession({
          userId: authUser.id,
          userEmail: authUser.email,
          planId,
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

  // Show special loading state for trial upgrades
  if (isProcessingTrialUpgrade) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isActivation ? 'Activating Your Plan' : 'Upgrading Your Trial'}
              </h2>
              <p className="text-gray-600">
                {currentSubscription?.stripe_subscription_id 
                  ? `${isActivation ? 'Activating' : 'Upgrading instantly to'} ${initialPlan === 'pro_plus' ? 'Pro+' : 'Pro'}...`
                  : `Setting up ${initialPlan === 'pro_plus' ? 'Pro+' : 'Pro'} subscription...`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {currentSubscription?.stripe_subscription_id 
                  ? 'Your payment method will be charged immediately.'
                  : 'You\'ll be redirected to secure checkout shortly.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {isActivation ? 'Activate Your Plan' : isUpgrade ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isActivation 
              ? 'Add a payment method to convert your trial to a paid subscription and continue using all features.'
              : 'Start creating professional covers with AI. All plans include watermark-free images.'
            }
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = currentSubscription?.tier === plan.id
            const isTrialUser = currentSubscription?.status === 'trialing'
            const needsPaymentSetup = isTrialUser && !currentSubscription?.stripe_subscription_id
            const isSelected = selectedPlan === plan.id
            
            // Allow trial users to click their current plan to add payment method
            // Also prevent paid users from selecting their current plan
            const isPaidUser = currentSubscription && !isTrialUser && currentSubscription.tier !== 'free'
            const isClickable = !loading && (!isCurrentPlan || (isCurrentPlan && needsPaymentSetup))
            
            console.log('[PaymentPage] Rendering plan:', plan.id, {
              isCurrentPlan,
              isTrialUser,
              needsPaymentSetup,
              isClickable,
              currentSubscriptionTier: currentSubscription?.tier,
              planId: plan.id,
              tierMatch: currentSubscription?.tier === plan.id,
              subscriptionData: currentSubscription,
              loading,
              disabled: !isClickable
            })
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  isClickable ? 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]' : 'cursor-not-allowed'
                } ${
                  isSelected ? 'ring-2 ring-orange-500 scale-105 shadow-2xl' : ''
                } ${plan.popular ? 'shadow-xl' : ''} ${
                  isCurrentPlan && !needsPaymentSetup ? 'opacity-75' : ''
                }`}
                onClick={() => isClickable && setSelectedPlan(plan.id as any)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-500 text-white px-4 py-1">
                      Most Popular
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
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price / 100}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  {/* Free Trial Badge */}
                  <div className="mt-3">
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {trialDays}-day free trial
                    </Badge>
                  </div>
                  
                  {/* Show prorated amount for upgrades */}
                  {isUpgrade && currentSubscription?.tier === 'pro' && plan.id === 'pro_plus' && proratedAmount !== null && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Prorated amount: ${(proratedAmount / 100).toFixed(2)}</p>
                      <p className="text-xs">Credit for unused Pro time applied</p>
                    </div>
                  )}
                  
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
                  <div className="text-center py-2 bg-gray-50 rounded-lg">
                    <span className={`text-2xl font-bold ${plan.popular ? 'text-orange-600' : 'text-gray-700'}`}>
                      {plan.credits}
                    </span>
                    <span className="text-gray-600 ml-1">credits/month</span>
                  </div>

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
                  {/* Current Plan Status for all users */}
                  {isCurrentPlan && isTrialUser && (
                    <Badge variant="secondary" className="w-full py-2 text-sm">
                      Current Plan (Trial)
                    </Badge>
                  )}
                  
                  {/* Current Plan Status for paid users */}
                  {isCurrentPlan && isPaidUser && (
                    <Badge className="w-full py-2 text-sm bg-green-100 text-green-800 border-green-200">
                      Current Plan
                    </Badge>
                  )}
                  
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
                        isTrialUser 
                      })
                      handleSelectPlan(plan.id as 'pro' | 'pro_plus')
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
                          // Regular upgrade
                          if (isUpgrade && currentSubscription?.tier === 'pro' && plan.id === 'pro_plus') {
                            return 'Upgrade Now'
                          }
                          // Default
                          return 'Get Started'
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

          {/* Current Plan Info */}
          <Card className={`max-w-2xl mx-auto border-gray-200 ${
            currentSubscription && currentSubscription.tier !== 'free' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50'
          }`}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                {(() => {
                  if (isLoadingSubscription) return <><Loader2 className="w-4 h-4 animate-spin" /> Loading subscription info...</>;
                  if (currentSubscription?.tier === 'pro') return <><Zap className="w-5 h-5 text-orange-500" /> You have the Pro plan</>;
                  if (currentSubscription?.tier === 'pro_plus') return <><Crown className="w-5 h-5 text-purple-500" /> You have the Pro+ plan</>;
                  return <><Sparkles className="w-5 h-5 text-gray-500" /> Not ready to upgrade?</>;
                })()}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {(() => {
                  const config = getClientSubscriptionConfig();
                  if (isLoadingSubscription) {
                    return 'Checking your subscription status...';
                  }
                  
                  switch (currentSubscription?.tier) {
                    case 'pro':
                      return `You're currently on the Pro plan with ${config.limits.pro.monthly} covers per month.`;
                    case 'pro_plus':
                      return `You're currently on the Pro+ plan with ${config.limits.pro_plus.monthly} covers per month.`;
                    case 'free':
                    default:
                      return `Continue using the free plan with ${config.limits.free.monthly} covers per month (${config.limits.free.daily} per day).`;
                  }
                })()}
              </p>
              <Button 
                variant={currentSubscription && currentSubscription.tier !== 'free' ? 'default' : 'ghost'}
                className={currentSubscription && currentSubscription.tier !== 'free' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => router.push(`/${locale}`)}
              >
                {(() => {
                  if (isLoadingSubscription) return 'Loading...';
                  if (currentSubscription?.tier === 'pro' || currentSubscription?.tier === 'pro_plus') {
                    return 'Go to Dashboard';
                  }
                  return 'Continue with Free Plan';
                })()}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}