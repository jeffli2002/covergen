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

console.log('[PaymentPage] Module loaded at:', new Date().toISOString())

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
  console.log('[PaymentPage] Component rendering with props:', { locale, initialPlan, isUpgrade, redirectUrl })
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

  // Debug button click issues
  useEffect(() => {
    const checkButtons = () => {
      const buttons = document.querySelectorAll('button')
      console.log('[PaymentPage] Found buttons:', buttons.length)
      buttons.forEach((button, index) => {
        const styles = window.getComputedStyle(button)
        if (button.textContent?.includes('Get Started') || 
            button.textContent?.includes('Upgrade') || 
            button.textContent?.includes('Trial')) {
          console.log(`[PaymentPage] Payment button ${index}:`, {
            text: button.textContent,
            disabled: button.disabled,
            pointerEvents: styles.pointerEvents,
            cursor: styles.cursor,
            opacity: styles.opacity,
            visibility: styles.visibility,
            zIndex: styles.zIndex,
            position: styles.position,
            hasClickHandler: button.onclick !== null || button.hasAttribute('onClick')
          })
          
          // Add a direct onclick handler to test
          button.addEventListener('click', (e) => {
            console.log('[PaymentPage] Direct addEventListener click fired for:', button.textContent)
            console.log('[PaymentPage] Event details:', {
              type: e.type,
              target: e.target,
              currentTarget: e.currentTarget,
              defaultPrevented: e.defaultPrevented,
              propagationStopped: e.cancelBubble
            })
          }, true)
        }
      })
    }
    
    // Check for global event handlers
    const checkGlobalHandlers = () => {
      console.log('[PaymentPage] Checking global event handlers...')
      const listeners = (window as any).getEventListeners
      if (listeners) {
        console.log('[PaymentPage] Document click listeners:', listeners(document, 'click'))
        console.log('[PaymentPage] Window click listeners:', listeners(window, 'click'))
      }
    }
    
    // Check buttons after a short delay to ensure DOM is ready
    setTimeout(() => {
      checkButtons()
      checkGlobalHandlers()
    }, 1000)
  }, [loading, currentSubscription])

  useEffect(() => {
    // Set mounted to true
    isMounted.current = true
    
    // Check if we're in test mode
    setIsTestMode(creemService.isTestMode())
    
    // Debug: Find all payment buttons after component mounts
    setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-payment-button]')
      console.log('[PaymentPage] Found buttons:', buttons.length)
      buttons.forEach((btn, index) => {
        const computedStyle = window.getComputedStyle(btn)
        console.log(`[PaymentPage] Payment button ${index}:`, {
          exists: !!btn,
          disabled: btn.disabled,
          ariaDisabled: btn.getAttribute('aria-disabled'),
          pointerEvents: computedStyle.pointerEvents,
          opacity: computedStyle.opacity,
          visibility: computedStyle.visibility,
          display: computedStyle.display,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          className: btn.className,
          innerHTML: btn.innerHTML.substring(0, 50)
        })
        
        // Add a direct event listener to verify events work
        btn.addEventListener('click', (e) => {
          console.log('[PaymentPage] Direct addEventListener click fired for button:', index)
          console.log('[PaymentPage] Button dataset:', btn.dataset)
        })
      })
    }, 1000)
    
    // Also check if any elements might be blocking the buttons
    setTimeout(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-payment-button]')
      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect()
        const elementAtPoint = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        console.log('[PaymentPage] Element at button center:', {
          buttonId: btn.dataset.paymentButton,
          elementAtPoint: elementAtPoint,
          isButton: elementAtPoint === btn,
          actualElement: elementAtPoint?.tagName,
          actualClass: elementAtPoint?.className
        })
        
        // Check if button is actually clickable
        const isClickable = btn.offsetWidth > 0 && 
                          btn.offsetHeight > 0 && 
                          window.getComputedStyle(btn).visibility !== 'hidden'
        console.log('[PaymentPage] Button clickability:', {
          id: btn.dataset.paymentButton,
          isClickable,
          offsetWidth: btn.offsetWidth,
          offsetHeight: btn.offsetHeight
        })
      })
    }, 2000)

    console.log('[PaymentPage] Initial load:', {
      authUser: !!authUser,
      authUserEmail: authUser?.email,
      authUserId: authUser?.id,
      authLoading: authLoading,
      hasInitialized,
      storeUser: !!user,
      storeUserEmail: user?.email,
      storeUserId: user?.id,
      session: authService.getCurrentSession() ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    })

    // Wait for auth to load
    if (authLoading) {
      console.log('[PaymentPage] Auth is loading, waiting...')
      return
    }

    // Mark as initialized once auth has loaded
    if (!authLoading && !hasInitialized) {
      initCheckCount.current += 1
      console.log('[PaymentPage] Auth loaded, check count:', initCheckCount.current)
      
      // Give auth context 3 render cycles to stabilize
      if (initCheckCount.current >= 3) {
        console.log('[PaymentPage] Auth stabilized, marking as initialized')
        setHasInitialized(true)
      }
      return
    }

    // Check authentication after auth has loaded and initialized
    if (!authLoading && hasInitialized && !authUser) {
      console.log('[PaymentPage] Not authenticated after initialization, redirecting...', {
        authLoading,
        hasInitialized,
        authUser: !!authUser,
        initCheckCount: initCheckCount.current,
        timestamp: new Date().toISOString()
      })
      // Only redirect if component is still mounted
      if (isMounted.current) {
        // Redirect to auth with return URL
        const returnUrl = `/${locale}/payment?plan=${selectedPlan}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
        router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
      }
      return
    }

    // Skip session validity check here - we'll check when user actually clicks pay
    // This prevents immediate redirects due to timing issues
    console.log('[PaymentPage] Skipping session validity check in useEffect')

    // Load current subscription (only after initialization and auth)
    if (isMounted.current && hasInitialized && authUser) {
      console.log('[PaymentPage] Loading current subscription')
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
    console.log('[PaymentPage] handleSelectPlan ENTRY POINT')
    console.log('[PaymentPage] Stack trace:', new Error().stack)
    
    try {
      console.log('[PaymentPage] handleSelectPlan START')
      alert(`handleSelectPlan called with planId: ${planId}`)
      
      console.log('[PaymentPage] handleSelectPlan called with planId:', planId)
      console.log('[PaymentPage] Current authUser:', authUser)
      console.log('[PaymentPage] Authentication status:', authService.isAuthenticated())
      console.log('[PaymentPage] authLoading:', authLoading)
      console.log('[PaymentPage] user from context:', user)
      
      console.log('[PaymentPage] Starting payment process for plan:', planId)
      
      if (authLoading) {
        console.log('[PaymentPage] Auth is still loading')
        alert('Auth is still loading')
        toast.error('Please wait, authentication is loading...')
        return
      }
      
      if (!authUser) {
        console.log('[PaymentPage] No authUser found')
        console.log('[PaymentPage] Will redirect to signin')
        alert('No authUser found, will redirect to signin')
        toast.error('Please sign in to continue')
        const returnUrl = `/${locale}/payment?plan=${planId}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
        router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
        return
      }
    } catch (error: any) {
      console.error('[PaymentPage] Error in handleSelectPlan (early):', error)
      alert(`Error in handleSelectPlan: ${error.message}`)
      return
    }
    
    // Check session validity at payment time
    console.log('[PaymentPage] Checking session validity...')
    alert('About to check session validity')
    
    const isSessionValid = await PaymentAuthWrapper.isSessionValidForPayment()
    console.log('[PaymentPage] Session validity result:', isSessionValid)
    
    if (!isSessionValid) {
      console.log('[PaymentPage] Session not valid for payment at checkout time')
      toast.error('Your session has expired. Please sign in again to continue.')
      const returnUrl = `/${locale}/payment?plan=${planId}&redirect=${encodeURIComponent(redirectUrl || `/${locale}`)}`
      router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(returnUrl)}`)
      return
    }

    setLoading(true)
    console.log('[PaymentPage] Creating checkout session...')
    
    // Debug session details
    const session = authService.getCurrentSession()
    console.log('[PaymentPage] Session details:', {
      hasAccessToken: !!session?.access_token,
      tokenLength: session?.access_token?.length,
      tokenPrefix: session?.access_token?.substring(0, 20)
    })
    
    try {
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
        error: result.error,
        fullResult: result
      })

      if (result.success && result.url) {
        console.log('[PaymentPage] Redirecting to checkout URL:', result.url)
        // Redirect to Creem checkout
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('[PaymentPage] Payment error:', error)
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
          
          {/* Debug button */}
          <div className="mt-4 space-x-2">
            <Button 
              onClick={() => {
                console.log('[DEBUG] Test button clicked!')
                console.log('[DEBUG] AuthUser:', authUser)
                console.log('[DEBUG] Loading:', authLoading)
                toast.success('Test button clicked!')
              }}
              variant="outline"
              size="sm"
            >
              Test Button (Debug)
            </Button>
            <Button
              onClick={() => {
                console.log('[DEBUG] Testing auth state')
                console.log('[DEBUG] authUser:', authUser)
                console.log('[DEBUG] authLoading:', authLoading)
                console.log('[DEBUG] currentSubscription:', currentSubscription)
                console.log('[DEBUG] loading:', loading)
                console.log('[DEBUG] session:', authService.getCurrentSession())
                
                // Find all payment buttons and check their state
                const paymentButtons = document.querySelectorAll<HTMLButtonElement>('button[data-payment-button]')
                console.log('[DEBUG] Payment buttons found:', paymentButtons.length)
                paymentButtons.forEach((btn) => {
                  console.log('[DEBUG] Button state:', {
                    id: btn.dataset.paymentButton,
                    disabled: btn.disabled,
                    ariaDisabled: btn.getAttribute('aria-disabled'),
                    hasOnClick: !!btn.onclick
                  })
                })
              }}
              variant="outline"
              size="sm"
            >
              Test Auth State
            </Button>
          </div>
          
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
            
            console.log('[PaymentPage] Rendering plan:', plan.id, {
              isCurrentPlan,
              currentSubscriptionTier: currentSubscription?.tier,
              loading,
              disabled: loading || isCurrentPlan
            })
            
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
                  <div 
                    className="w-full"
                    onClick={(e) => {
                      console.log('[PaymentPage] CardFooter div clicked for plan:', plan.id)
                      console.log('[PaymentPage] Click target:', e.target)
                      console.log('[PaymentPage] Current target:', e.currentTarget)
                    }}
                  >
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
                    onMouseDown={(e) => {
                      console.log('[PaymentPage] Mouse down on button for plan:', plan.id)
                    }}
                    onPointerDown={(e) => {
                      console.log('[PaymentPage] Pointer down on button for plan:', plan.id)
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      
                      console.log('[PaymentPage] === BUTTON CLICK START ===')
                      alert(`Button clicked for plan: ${plan.id}`)
                      console.log('[PaymentPage] Button clicked for plan:', plan.id)
                      console.log('[PaymentPage] Button click event:', e)
                      console.log('[PaymentPage] Button disabled state:', loading || isCurrentPlan)
                      console.log('[PaymentPage] Loading:', loading, 'isCurrentPlan:', isCurrentPlan)
                      
                      // Ensure button is not disabled
                      if (loading || isCurrentPlan) {
                        console.log('[PaymentPage] Button is disabled, not processing click')
                        alert('Button is disabled')
                        return
                      }
                      
                      // Debug: Check if handleSelectPlan exists
                      console.log('[PaymentPage] handleSelectPlan function exists:', typeof handleSelectPlan)
                      console.log('[PaymentPage] About to call handleSelectPlan')
                      
                      try {
                        // Call handleSelectPlan and catch any errors
                        handleSelectPlan(plan.id as 'pro' | 'pro_plus').catch(err => {
                          console.error('[PaymentPage] Error calling handleSelectPlan:', err)
                          alert(`Error calling handleSelectPlan: ${err.message}`)
                        })
                      } catch (syncError: any) {
                        console.error('[PaymentPage] Synchronous error calling handleSelectPlan:', syncError)
                        alert(`Sync error: ${syncError.message || syncError}`)
                      }
                    }}
                    style={{ cursor: loading || isCurrentPlan ? 'not-allowed' : 'pointer' }}
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
                  </div>
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
}