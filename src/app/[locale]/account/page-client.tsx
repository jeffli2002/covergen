'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  User, CreditCard, History, Settings, LogOut, 
  Loader2, Crown, Zap, AlertCircle, ExternalLink,
  Calendar, RefreshCw, Shield, Sparkles, Clock,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { creemService } from '@/services/payment/creem'
import { toast } from 'sonner'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import ActivationConfirmDialog from '@/components/subscription/ActivationConfirmDialog'
import { useBestAuth } from '@/hooks/useBestAuth'
import { authEvents } from '@/lib/events/auth-events'

// Simple date formatter to avoid date-fns dependency
const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const formatDateTime = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return date.toLocaleDateString('en-US', options)
}

interface AccountPageClientProps {
  locale: string
}

// Get trial limits configuration from environment variables
const getTrialLimits = () => {
  const config = getClientSubscriptionConfig()
  return {
    pro: {
      daily: config.limits.pro.trial_daily,
      total: config.limits.pro.trial_total,
      days: config.trialDays
    },
    pro_plus: {
      daily: config.limits.pro_plus.trial_daily,
      total: config.limits.pro_plus.trial_total,
      days: config.trialDays
    }
  }
}

export default function AccountPageClient({ locale }: AccountPageClientProps) {
  const router = useRouter()
  const { user: appStoreUser, setUser } = useAppStore()
  const { user: authUser, session, loading: authLoading, signOut } = useBestAuth()
  const [loading, setLoading] = useState(true)
  const [initialAuthCheck, setInitialAuthCheck] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...')
  const [accountData, setAccountData] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [activating, setActivating] = useState(false)
  const [showActivationConfirm, setShowActivationConfirm] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Track if we've already loaded data to prevent re-fetching
  const [hasLoadedData, setHasLoadedData] = useState(false)

  useEffect(() => {
    // Only run auth check if we haven't loaded data yet
    if (hasLoadedData) {
      return
    }

    const checkAuthAndLoad = async () => {
      try {
        // Wait for BestAuth to load
        setLoadingMessage('Checking authentication...')
        
        // If auth is still loading, wait
        if (authLoading) {
          return
        }
        
        // Mark initial auth check as complete
        setInitialAuthCheck(false)
        
        // Give a small delay to ensure auth state is fully populated
        // This prevents race conditions where authLoading is false but user/session aren't set yet
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if user is authenticated after auth has finished loading
        if (!authUser || !session) {
          console.log('[Account] No auth found after loading:', { authUser, session, authLoading })
          // Only redirect if we're certain auth has finished loading and no user exists
          router.replace(`/${locale}?auth=signin&redirect=${encodeURIComponent(`/${locale}/account`)}`)
          return
        }

        console.log('[Account] User authenticated:', authUser.email)
        setLoadingMessage('Loading account data...')
        
        // Mark that we're loading data to prevent re-runs
        setHasLoadedData(true)
        await loadAccountData()
      } catch (error) {
        console.error('Error in auth check:', error)
        setLoading(false)
        setHasLoadedData(true) // Prevent retry on error
      }
    }
    
    checkAuthAndLoad()
  }, [locale, router, authUser, session, authLoading, hasLoadedData])

  const loadAccountData = async () => {
    try {
      if (!authUser || !session) {
        console.error('No authenticated user found')
        toast.error('Please sign in to view account details')
        router.replace(`/${locale}?auth=signin&redirect=${encodeURIComponent(`/${locale}/account`)}`)
        return
      }
      
      // Set a timeout for the API calls
      const loadTimeout = setTimeout(() => {
        console.error('[Account] Loading timeout reached')
        toast.error('Failed to load account data. Please try refreshing the page.')
        setLoading(false)
        // Optionally redirect to home after timeout
        setTimeout(() => {
          router.push(`/${locale}`)
        }, 2000)
      }, 15000) // 15 second timeout
      
      try {
        // Load account data from BestAuth API
        console.log('[Account] Fetching account data with token:', session.token ? 'Present' : 'Missing')
        
        const response = await fetch('/api/bestauth/account', {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          },
          // Add timeout to fetch
          signal: AbortSignal.timeout(10000)
        }).catch(err => {
          console.error('[Account] Fetch error:', err)
          throw new Error('Network error: Unable to reach server')
        })
        
        console.log('[Account] Response status:', response.status)
        
        if (!response.ok) {
          clearTimeout(loadTimeout) // Clear timeout before throwing
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          console.error('[Account] API error:', errorData)
          throw new Error(errorData.error || `Failed to load account data (${response.status})`)
        }
        
        const data = await response.json()
        clearTimeout(loadTimeout)
        console.log('[Account] Data loaded successfully')
        
        setAccountData(data)
        setSubscription(data.subscription)
        setUsage(data.usage)
        
        // Update user in store if we have subscription data
        const config = getClientSubscriptionConfig()
        if (data.subscription) {
          const tier = data.subscription.tier || 'free'
          const quotaLimit = tier === 'pro' ? config.limits.pro.monthly : 
                            tier === 'pro_plus' ? config.limits.pro_plus.monthly : 
                            config.limits.free.daily
          setUser({
            id: data.user.id,
            email: data.user.email,
            tier: tier,
            quotaUsed: data.usage?.today || 0,
            quotaLimit: quotaLimit
          })
        } else {
          setUser({
            id: data.user.id,
            email: data.user.email,
            tier: 'free',
            quotaUsed: data.usage?.today || 0,
            quotaLimit: config.limits.free.daily
          })
        }
      } catch (innerError) {
        clearTimeout(loadTimeout)
        console.error('[Account] Inner error:', innerError)
        throw innerError
      }
    } catch (error) {
      console.error('[Account] Error loading account data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load account data'
      
      // Set error state instead of just showing toast
      setLoadError(errorMessage)
      toast.error(errorMessage)
      
      // Don't redirect on error - just show the error message
      // This prevents infinite loops
      if (error instanceof Error && error.message.includes('401')) {
        console.error('[Account] Authentication error - user may need to re-login')
        setLoadError('Authentication error. Please sign in again.')
        // Don't auto-redirect, let user click sign in manually
      }
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error('No billing information found')
      return
    }

    setLoading(true)
    try {
      const result = await creemService.createPortalSession({
        customerId: subscription.stripe_customer_id,
        returnUrl: `${window.location.origin}/${locale}/account`
      })

      if (result.success && result.url) {
        window.open(result.url, '_blank', 'width=800,height=600')
      } else {
        throw new Error(result.error || 'Failed to open billing portal')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return

    if (!confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your current billing period.')) {
      return
    }

    setCancelling(true)
    try {
      // Check auth token
      if (!session?.token) {
        throw new Error('Authentication required')
      }

      // Call BestAuth API endpoint
      const response = await fetch('/api/bestauth/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Subscription cancelled. You will keep access until the end of your billing period.')
        
        // Update local state immediately to reflect cancellation
        if (subscription) {
          setSubscription({
            ...subscription,
            cancel_at_period_end: true
          })
          
          // Emit subscription change event
          authEvents.emitSubscriptionChange({
            ...subscription,
            cancel_at_period_end: true
          })
          authEvents.emitAuthChange('subscription_update')
        }
        
        // Then reload data from server (might have slight delay)
        await loadAccountData()
      } else {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return

    setResuming(true)
    try {
      // Check auth token
      if (!session?.token) {
        throw new Error('Authentication required')
      }

      // Call BestAuth API endpoint - DELETE method removes the cancellation
      const response = await fetch('/api/bestauth/subscription/cancel', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Subscription resumed successfully!')
        
        // Update local state immediately to reflect resumption
        if (subscription) {
          setSubscription({
            ...subscription,
            cancel_at_period_end: false
          })
          
          // Emit subscription change event
          authEvents.emitSubscriptionChange({
            ...subscription,
            cancel_at_period_end: false
          })
          authEvents.emitAuthChange('subscription_update')
        }
        
        // Then reload data from server (might have slight delay)
        await loadAccountData()
      } else {
        throw new Error(data.error || 'Failed to resume subscription')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resume subscription')
    } finally {
      setResuming(false)
    }
  }

  const handleActivateClick = () => {
    if (!subscription || subscription.status !== 'trialing') return
    
    // Check if user has payment method
    if (!subscription.stripe_subscription_id) {
      // No payment method, redirect to add one
      toast.error('Please add a payment method to activate your subscription', {
        duration: 4000
      })
      router.push(`/${locale}/payment?plan=${currentPlan}&activate=true`)
      return
    }
    
    // Show confirmation dialog
    setShowActivationConfirm(true)
  }

  const handleActivateSubscription = async () => {
    if (!subscription || subscription.status !== 'trialing') return

    setActivating(true)
    setShowActivationConfirm(false)
    
    try {
      // Check auth token
      if (!session?.token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/bestauth/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.activated) {
          // Immediate activation successful (when API supports it)
          toast.success(data.message || 'Subscription activated successfully!')
          // Reload account data to show updated status
          await loadAccountData()
        } else if (data.billingStartsAt) {
          // Activation confirmed but billing starts at trial end
          toast.success(data.message, {
            duration: 8000
          })
          if (data.note) {
            // Show additional note about trial period
            setTimeout(() => {
              toast.info(data.note, {
                duration: 6000
              })
            }, 1000)
          }
        }
      } else {
        // Handle payment method required
        if (data.needsPaymentMethod) {
          toast.error('Please add a payment method to activate your subscription', {
            duration: 4000
          })
          
          // Try to open billing portal for adding payment method
          if (subscription?.stripe_customer_id) {
            const result = await creemService.createPortalSession({
              customerId: subscription.stripe_customer_id,
              returnUrl: `${window.location.origin}/${locale}/account`
            })
            
            if (result.success && result.url) {
              window.location.href = result.url
            } else {
              // Fallback to payment page
              router.push(`/${locale}/payment?plan=${currentPlan}&activate=true`)
            }
          } else {
            // No customer ID, go to payment page for new checkout
            router.push(`/${locale}/payment?plan=${currentPlan}&activate=true`)
          }
        } else {
          throw new Error(data.error || 'Failed to activate subscription')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate subscription')
    } finally {
      setActivating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Use the BestAuth hook's signOut method which already emits events
      const result = await signOut()
      
      if (result.success) {
        // Clear local state
        setUser(null)
        
        // The signOut method in useBestAuth already emits the auth change event
        // Just redirect to home
        router.push(`/${locale}`)
      } else {
        console.error('Sign out failed:', result.error)
        toast.error('Failed to sign out. Please try again.')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('An error occurred while signing out.')
    }
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Zap className="w-5 h-5" />
      case 'pro_plus':
        return <Crown className="w-5 h-5" />
      default:
        return null
    }
  }

  const currentPlan = subscription?.tier || 'free'
  const isTrialing = subscription?.status === 'trialing'
  const config = getClientSubscriptionConfig()
  
  // Get plan details using client-safe configuration
  const planDetailsMap = {
    free: {
      name: 'Free',
      price: 0,
      credits: config.limits.free.monthly,
      features: [
        `${config.limits.free.monthly} covers per month`,
        'No watermark',
        'Basic platform sizes',
        'Email support'
      ]
    },
    pro: {
      name: 'Pro',
      price: 900,
      credits: config.limits.pro.monthly,
      features: [
        `${config.limits.pro.monthly} covers per month`,
        'No watermark',
        'All platform sizes',
        'Priority support'
      ]
    },
    pro_plus: {
      name: 'Pro+',
      price: 1900,
      credits: config.limits.pro_plus.monthly,
      features: [
        `${config.limits.pro_plus.monthly} covers per month`,
        'No watermark',
        'All platform sizes',
        'Advanced customization',
        'Commercial usage license',
        'Dedicated support'
      ]
    }
  }
  
  const planDetails = planDetailsMap[currentPlan as keyof typeof planDetailsMap] || {
    name: 'Free',
    price: 0,
    credits: config.limits.free.monthly,
    features: []
  }
  
  const TRIAL_LIMITS = getTrialLimits()
  const trialLimits = isTrialing ? TRIAL_LIMITS[currentPlan as keyof typeof TRIAL_LIMITS] : null
  
  // Calculate usage based on subscription type and trial status
  const isPaidUser = !isTrialing && (currentPlan === 'pro' || currentPlan === 'pro_plus')
  let currentUsage: number
  let usageLimit: number
  let usagePeriod: string
  
  if (isPaidUser) {
    // Paid users: show monthly usage
    currentUsage = usage?.thisMonth || 0
    usageLimit = planDetails?.credits || config.limits[currentPlan as keyof typeof config.limits].monthly
    usagePeriod = 'This Month'
  } else if (isTrialing) {
    // Trial users: show daily usage with trial limits
    currentUsage = usage?.today || 0
    usageLimit = trialLimits?.daily || config.limits.free.daily
    usagePeriod = 'Today'
  } else {
    // Free users: show daily usage
    currentUsage = usage?.today || 0
    usageLimit = config.limits.free.daily
    usagePeriod = 'Today'
  }
  
  const usagePercentage = (currentUsage / usageLimit) * 100

  // Show loading state while checking auth or loading data
  if (loading || authLoading || initialAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-body-md text-gray-600">{loadingMessage}</p>
          <p className="text-ui-sm text-gray-500 mt-2">This should only take a moment...</p>
        </div>
      </div>
    )
  }

  // Show error state if loading failed
  if (loadError && !accountData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-heading-4 text-gray-900 mb-2">Unable to Load Account Data</h2>
              <p className="text-body-md text-gray-600 mb-4">{loadError}</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setLoadError(null)
                    setLoading(true)
                    loadAccountData()
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/${locale}`)}
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-hero-title text-gray-900">My Account</h1>
          <p className="text-body-lg text-gray-600 mt-2">Manage your subscription and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-ui-sm text-gray-700">Email</label>
                  <p className="text-body-md text-gray-900 mt-1">{accountData?.user?.email || authUser?.email || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-ui-sm text-gray-700">User ID</label>
                  <p className="text-ui-sm text-gray-500 font-mono mt-1">{accountData?.user?.id || authUser?.id || 'Not available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan & Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                Current Plan
                {getPlanIcon(currentPlan)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-heading-4 flex items-center gap-3">
                    {planDetails?.name}
                    {isTrialing && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Trial
                      </Badge>
                    )}
                  </h3>
                  <p className="text-body-md text-gray-600 mt-1">
                    {isTrialing ? (
                      <>Free {trialLimits?.days || 7}-day trial</>
                    ) : currentPlan === 'free' ? (
                      'Free forever'
                    ) : (
                      `$${planDetails?.price ? planDetails.price / 100 : 0}/month`
                    )}
                  </p>
                </div>
                <Badge variant={
                  currentPlan === 'free' ? 'secondary' : 
                  subscription?.status === 'paused' ? 'destructive' :
                  'default'
                }>
                  {subscription?.status === 'paused' ? 'Paused' : 
                   subscription?.status || (currentPlan === 'free' ? 'Active' : 'Unknown')}
                </Badge>
              </div>

              {/* Trial Information */}
              {isTrialing && trialLimits && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-2">
                      <p className="text-ui-md">Trial Limits:</p>
                      <ul className="space-y-1 text-ui-sm">
                        <li>• {trialLimits.daily} covers per day</li>
                        <li>• {trialLimits.total} total covers during trial</li>
                        <li>• {trialLimits.days} days trial period</li>
                      </ul>
                      {subscription.trial_ends_at && (
                        <p className="text-ui-sm mt-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Trial ends on {formatDateTime(new Date(subscription.trial_ends_at))}
                        </p>
                      )}
                      {subscription.stripe_subscription_id ? (
                        <p className="text-ui-sm mt-2 text-blue-900">
                          ✓ Your subscription will automatically activate when the trial ends
                        </p>
                      ) : (
                        <p className="text-ui-sm mt-2 text-blue-800">
                          ⚠️ Please add a payment method to continue after trial
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Subscription Dates */}
              {subscription && !isTrialing && currentPlan !== 'free' && (
                <div className="space-y-2 text-ui-sm text-gray-600">
                  {subscription.current_period_end && (
                    <p>
                      <Calendar className="inline w-4 h-4 mr-1" />
                      {subscription.cancel_at_period_end
                        ? `Cancels on ${formatDate(new Date(subscription.current_period_end))}`
                        : `Renews on ${formatDate(new Date(subscription.current_period_end))}`
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Warnings */}
              {subscription?.cancel_at_period_end && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Your subscription is set to cancel at the end of the billing period.
                  </AlertDescription>
                </Alert>
              )}

              {subscription?.status === 'paused' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Subscription paused</strong> - Please update your payment method to resume service.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {currentPlan === 'free' ? (
                  <Button 
                    onClick={() => router.push(`/${locale}/payment`)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                ) : isTrialing ? (
                  <>
                    {/* Show trial info instead of activation button */}
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {planDetails?.name} Trial Active
                      </Badge>
                      {!subscription?.stripe_subscription_id && (
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/${locale}/payment?plan=${currentPlan}&activate=true`)}
                          className="text-ui-sm"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Add Payment Method
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleManageBilling}
                      disabled={loading}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </Button>
                    
                    {subscription?.cancel_at_period_end ? (
                      <Button
                        variant="outline"
                        onClick={handleResumeSubscription}
                        disabled={resuming}
                      >
                        {resuming ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Resume Subscription
                      </Button>
                    ) : (
                      <>
                        {currentPlan === 'pro' && (
                          <Button
                            onClick={() => router.push(`/${locale}/payment?plan=pro_plus&upgrade=true`)}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Pro+
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                        >
                          {cancelling ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Cancel Subscription
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                <History className="w-5 h-5" />
                Usage {usagePeriod}
              </CardTitle>
              <CardDescription className="text-ui-sm text-gray-600">
                Track your cover generation usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-ui-sm text-gray-600">Covers Generated</span>
                  <span className="text-ui-sm">
                    {currentUsage} / {usageLimit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              <p className="text-ui-sm text-gray-600">
                {usageLimit - currentUsage} credits remaining {usagePeriod.toLowerCase()}
              </p>

              {usagePercentage >= 80 && currentPlan !== 'pro_plus' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    You're running low on credits. {isTrialing ? 'Activate your plan' : 'Consider upgrading'} for more.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Plan Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                <Shield className="w-5 h-5" />
                Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planDetails?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-body-md text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                <Settings className="w-5 h-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('/privacy', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('/terms', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Terms of Service
              </Button>
              
              <div className="border-t my-3" />
              
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Activation Confirmation Dialog */}
      {isTrialing && planDetails && (
        <ActivationConfirmDialog
          open={showActivationConfirm}
          onClose={() => setShowActivationConfirm(false)}
          onConfirm={handleActivateSubscription}
          planName={planDetails.name}
          planPrice={planDetails.price / 100}
          planFeatures={planDetails.features}
          isActivating={activating}
        />
      )}
    </div>
  )
}