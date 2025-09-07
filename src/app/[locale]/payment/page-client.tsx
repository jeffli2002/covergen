'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, CreditCard, Crown, Info, Loader2, Shield, Sparkles, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import authService from '@/services/authService'
import { creemService, SUBSCRIPTION_PLANS, CREEM_TEST_CARDS } from '@/services/payment/creem'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import { toast } from 'sonner'
import CreemDebug from '@/components/debug/CreemDebug'


interface PaymentPageClientProps {
  locale: string
  initialPlan?: string
  isUpgrade?: boolean
  redirectUrl?: string
}

export default function PaymentPageClient({ 
  locale, 
  initialPlan = 'pro', 
  isUpgrade = false,
  redirectUrl 
}: PaymentPageClientProps) {
  
  const router = useRouter()
  const { user } = useAppStore()
  const { user: authUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_plus'>(initialPlan as any)
  const [isTestMode, setIsTestMode] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [proratedAmount, setProratedAmount] = useState<number | null>(null)
  const isMounted = useRef(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const initCheckCount = useRef(0)
  const [componentError, setComponentError] = useState<Error | null>(null)


  useEffect(() => {
    // Set mounted to true
    isMounted.current = true
    
    // Check if we're in test mode
    setIsTestMode(creemService.isTestMode())
    

    // Wait for auth to load
    if (authLoading) {
      return
    }

    // Mark as initialized once auth has loaded
    if (!authLoading && !hasInitialized) {
      initCheckCount.current += 1
      
      // Give auth context 3 render cycles to stabilize
      if (initCheckCount.current >= 3) {
        setHasInitialized(true)
      }
      return
    }

    // Check authentication after auth has loaded and initialized
    if (!authLoading && hasInitialized && !authUser) {
      // Only redirect if component is still mounted
      if (isMounted.current) {
        // Redirect to auth with return URL
        const returnUrl = `/${locale}/payment?plan=${selectedPlan}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
        router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
      }
      return
    }

    // Load current subscription (only after initialization and auth)
    if (isMounted.current && hasInitialized && authUser) {
      loadCurrentSubscription()
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [authUser, authLoading, locale, router, selectedPlan, redirectUrl, hasInitialized])

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await authService.getUserSubscription()
      setCurrentSubscription(subscription)
      
      // Calculate prorated amount if upgrading
      if (subscription && subscription.tier === 'pro' && initialPlan === 'pro_plus' && isUpgrade) {
        calculateProratedAmount(subscription)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

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
    // Add immediate window logging to verify function is called
    if (typeof window !== 'undefined') {
      window.console.log('[PaymentPage] handleSelectPlan START - planId:', planId);
    }
    console.log('[PaymentPage] handleSelectPlan called with planId:', planId)
    
    try {
      // Check authentication first
      window.console.log('[PaymentPage] Checking auth state - authLoading:', authLoading, 'authUser:', !!authUser);
      
      if (authLoading) {
        window.console.log('[PaymentPage] Auth is still loading');
        console.log('[PaymentPage] Auth is still loading')
        toast.error('Please wait, authentication is loading...')
        return
      }
      
      if (!authUser) {
        window.console.log('[PaymentPage] No authUser found - redirecting to signin');
        console.log('[PaymentPage] No authUser found')
        toast.error('Please sign in to continue')
        const returnUrl = `/${locale}/payment?plan=${planId}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
        router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
        return
      }
      
      window.console.log('[PaymentPage] Auth check passed, user:', authUser.email);
      
      // Check session validity at payment time
      window.console.log('[PaymentPage] About to check session validity...');
      console.log('[PaymentPage] Checking session validity...')
      const isSessionValid = await PaymentAuthWrapper.isSessionValidForPayment()
      window.console.log('[PaymentPage] Session validity result:', isSessionValid);
      console.log('[PaymentPage] Session validity result:', isSessionValid)
      
      if (!isSessionValid) {
        console.log('[PaymentPage] Session not valid for payment')
        toast.error('Your session has expired. Please sign in again to continue.')
        const returnUrl = `/${locale}/payment?plan=${planId}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
        router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
        return
      }

      setLoading(true)
      console.log('[PaymentPage] Creating checkout session...')
      
      // Create checkout session
      const userId = authUser.id
      const userEmail = authUser.email || ''
      
      console.log('[PaymentPage] Creating checkout with:', { userId, userEmail, planId })
      
      const result = await creemService.createCheckoutSession({
        userId,
        userEmail,
        planId,
        successUrl: `${window.location.origin}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/${locale}/payment/cancel`,
        currentPlan: currentSubscription?.tier || 'free'
      })
      
      console.log('[PaymentPage] Checkout result:', {
        success: result.success,
        hasUrl: !!result.url,
        error: result.error
      })

      if (result.success && result.url) {
        console.log('[PaymentPage] Redirecting to checkout URL')
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      window.console.error('[PaymentPage] CAUGHT ERROR in handleSelectPlan:', error);
      window.console.error('[PaymentPage] Error message:', error.message);
      window.console.error('[PaymentPage] Error stack:', error.stack);
      console.error('[PaymentPage] Error in handleSelectPlan:', error)
      console.error('[PaymentPage] Error stack:', error.stack)
      
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
      if (isMounted.current) {
        setLoading(false)
      }
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

  // Use try-catch for rendering logic only, not hooks
  try {
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
    
    return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            {isUpgrade ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start creating professional covers with AI. All plans include watermark-free images.
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
            const isSelected = selectedPlan === plan.id
            
            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-orange-500 scale-105' : ''
                } ${plan.popular ? 'shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
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
                  
                  {/* Show trial badge */}
                  {plan.trialDays > 0 && !isCurrentPlan && (
                    <Badge className="mt-3 bg-green-100 text-green-800 border-green-200">
                      {plan.trialDays}-day free trial
                    </Badge>
                  )}
                  
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
                    <span className="text-2xl font-bold text-orange-600">
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

                <CardFooter>
                  <Button
                    data-payment-button={plan.id}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    size="lg"
                    disabled={loading || isCurrentPlan}
                    onClick={async () => {
                      window.console.log('[PaymentPage] Payment button clicked for plan:', plan.id);
                      
                      if (loading || isCurrentPlan) {
                        window.console.log('[PaymentPage] Button is disabled, returning');
                        return;
                      }
                      
                      try {
                        window.console.log('[PaymentPage] About to call handleSelectPlan');
                        await handleSelectPlan(plan.id as 'pro' | 'pro_plus');
                      } catch (error: any) {
                        window.console.error('[PaymentPage] Error selecting plan:', error);
                        console.error('[PaymentPage] Error selecting plan:', error);
                        toast.error(`Error: ${error.message || 'Failed to select plan'}`);
                      }
                    }}
                    style={{ 
                      cursor: loading || isCurrentPlan ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {isUpgrade && currentSubscription?.tier === 'pro' && plan.id === 'pro_plus'
                          ? 'Upgrade Now'
                          : plan.trialDays > 0 
                            ? `Start ${plan.trialDays}-Day Free Trial`
                            : 'Get Started'
                        }
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
            {selectedPlan && SUBSCRIPTION_PLANS[selectedPlan].trialDays > 0 
              ? `Your ${SUBSCRIPTION_PLANS[selectedPlan].trialDays}-day free trial will automatically convert to a paid subscription unless cancelled.`
              : 'Subscriptions automatically renew unless cancelled.'
            }
          </p>

          {/* Free Tier Info */}
          <Card className="max-w-2xl mx-auto bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Not ready to upgrade?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Continue using the free plan with 10 covers per month.
              </p>
              <Button 
                variant="ghost" 
                onClick={() => router.push(`/${locale}`)}
              >
                Continue with Free Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
  } catch (error: any) {
    console.error('[PaymentPage] CRITICAL ERROR IN COMPONENT:', error)
    return (
      <div className="min-h-screen bg-red-50 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Page Error</h1>
            <p className="text-red-700">An error occurred loading the payment page. Please refresh and try again.</p>
            <pre className="mt-4 p-4 bg-red-100 rounded text-left text-sm overflow-auto">
              {error?.toString()}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}