'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  User, CreditCard, History, Settings, LogOut, 
  Loader2, Crown, Zap, AlertCircle, ExternalLink,
  Calendar, RefreshCw, Shield, Sparkles, Clock,
  ChevronRight, CheckCircle
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { creemService } from '@/services/payment/creem'
import { toast } from 'sonner'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import ActivationConfirmDialog from '@/components/subscription/ActivationConfirmDialog'
import { useBestAuth } from '@/hooks/useBestAuth'
import { authEvents } from '@/lib/events/auth-events'
import { getPlanByType } from '@/lib/subscription-plans'
import { PRICING_CONFIG } from '@/config/pricing.config'

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

// Trial functionality removed - no free trials offered

export default function AccountPageClient({ locale }: AccountPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: appStoreUser, setUser } = useAppStore()
  const { user: authUser, session, loading: authLoading, signOut } = useBestAuth()
  const [loading, setLoading] = useState(true)
  const [initialAuthCheck, setInitialAuthCheck] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...')
  const [accountData, setAccountData] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [usageStats, setUsageStats] = useState<any>(null)
  const [cancelling, setCancelling] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showActivationConfirm, setShowActivationConfirm] = useState(false)
  const [activating, setActivating] = useState(false)
  
  // Check for upgrade/activation success from query params
  const justUpgraded = searchParams?.get('upgraded') === 'true'
  const justActivated = searchParams?.get('activated') === 'true'
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(justUpgraded || justActivated)

  // Track if we've already loaded data to prevent re-fetching
  const [hasLoadedData, setHasLoadedData] = useState(false)

  useEffect(() => {
    // Force reload if user just upgraded (to get fresh subscription data)
    if (justUpgraded || justActivated) {
      console.log('[Account] User just upgraded, forcing data reload')
      setHasLoadedData(false)
    }
  }, [justUpgraded, justActivated])

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
        
        // Force fresh data by ALWAYS adding cache-busting timestamp to prevent stale data
        const cacheBuster = `?t=${Date.now()}`
        console.log('[Account] Fetching account data...', { justUpgraded, justActivated, cacheBuster })
        
        const response = await fetch(`/api/bestauth/account${cacheBuster}`, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          },
          // Add timeout to fetch and disable cache
          cache: 'no-store',
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
        console.log('[Account] Data loaded successfully:', {
          subscriptionTier: data?.subscription?.tier,
          subscriptionStatus: data?.subscription?.status,
          userId: data?.user?.id
        })
        
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

        // Fetch credit transactions and usage stats
        try {
          const [txResponse, statsResponse] = await Promise.all([
            fetch(`/api/bestauth/transactions?limit=20`, {
              headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            }),
            fetch(`/api/bestauth/usage-stats`, {
              headers: {
                'Authorization': `Bearer ${session.token}`,
                'Content-Type': 'application/json'
              },
              cache: 'no-store'
            })
          ])

          if (txResponse.ok) {
            const txData = await txResponse.json()
            setTransactions(txData.transactions || [])
          }

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            setUsageStats(statsData)
          }
        } catch (txError) {
          console.error('[Account] Error loading transactions/stats:', txError)
          // Don't fail the whole page if transactions fail
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
    // For now, show a helpful message about managing billing
    toast.info('To manage your billing, please contact support at support@covergen.pro', {
      duration: 6000
    })
    
    // TODO: Implement Creem customer portal integration
    // if (!subscription?.stripe_customer_id) {
    //   toast.error('No billing information found')
    //   return
    // }
    // setLoading(true)
    // try {
    //   const result = await creemService.createPortalSession({
    //     customerId: subscription.stripe_customer_id,
    //     returnUrl: `${window.location.origin}/${locale}/account`
    //   })
    //   if (result.success && result.url) {
    //     window.open(result.url, '_blank', 'width=800,height=600')
    //   } else {
    //     throw new Error(result.error || 'Failed to open billing portal')
    //   }
    // } catch (error: any) {
    //   toast.error(error.message || 'Failed to open billing portal')
    // } finally {
    //   setLoading(false)
    // }
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
        
        // Force a complete page reload to clear all React state
        window.location.href = `/${locale}`
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
  const config = getClientSubscriptionConfig()
  
  // Get plan details from PRICING_CONFIG
  const freePlanConfig = PRICING_CONFIG.plans[0] // Free
  const proPlanConfig = PRICING_CONFIG.plans[1]  // Pro
  const proPlusPlanConfig = PRICING_CONFIG.plans[2] // Pro+
  
  const planDetailsMap = {
    free: {
      name: freePlanConfig.name,
      price: 0,
      credits: freePlanConfig.credits,
      features: freePlanConfig.features.filter(f => f.included).map(f => f.text)
    },
    pro: {
      name: proPlanConfig.name,
      price: Math.round(proPlanConfig.price.monthly * 100), // Convert to cents
      credits: proPlanConfig.credits,
      features: proPlanConfig.features.filter(f => f.included).map(f => f.text)
    },
    pro_plus: {
      name: proPlusPlanConfig.name,
      price: Math.round(proPlusPlanConfig.price.monthly * 100), // Convert to cents
      credits: proPlusPlanConfig.credits,
      features: proPlusPlanConfig.features.filter(f => f.included).map(f => f.text)
    }
  }
  
  const planDetails = planDetailsMap[currentPlan as keyof typeof planDetailsMap] || {
    name: 'Free',
    price: 0,
    credits: { monthly: 0, yearly: 0, onSubscribe: 0 },
    features: []
  }
  
  // Calculate credits and usage
  const isPaidUser = (currentPlan === 'pro' || currentPlan === 'pro_plus')
  
  // Get credits balance from usage data (assuming API returns this)
  const creditsBalance = usage?.credits_balance || 0
  const creditsUsed = usage?.credits_used_this_month || 0
  const creditsGranted = usage?.credits_granted_this_month || 0
  const creditsMonthly = planDetails.credits.monthly
  
  // For display purposes
  const usagePeriod = isPaidUser ? 'This Month' : 'Today'

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
        {/* Upgrade Success Banner */}
        {showUpgradeSuccess && subscription && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-5 h-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <p className="font-semibold mb-1">
                {justActivated ? 'Subscription Activated!' : 'Upgrade Successful!'}
              </p>
              <p className="text-sm">
                You now have immediate access to all {subscription.tier === 'pro' ? 'Pro' : 'Pro+'} features. 
                {!justActivated && ' Prorated charges have been applied to your account.'}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-green-700 hover:text-green-900"
                onClick={() => setShowUpgradeSuccess(false)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
                  </h3>
                  <p className="text-body-md text-gray-600 mt-1">
                    {currentPlan === 'free' ? (
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

              {/* Subscription Dates */}
              {subscription && currentPlan !== 'free' && (
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

          {/* Usage & Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-heading-5">
                <Sparkles className="w-5 h-5" />
                Credits & Usage
              </CardTitle>
              <CardDescription className="text-ui-sm text-gray-600">
                Track your credits balance and generation usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Credits Balance */}
              {isPaidUser && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-ui-md font-medium text-gray-900">Credits Balance</span>
                    <span className="text-heading-4 font-bold text-purple-600">
                      {creditsBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-ui-sm text-gray-600">
                    <span>Monthly Allocation</span>
                    <span className="font-medium">{creditsGranted > 0 ? creditsGranted.toLocaleString() : creditsMonthly.toLocaleString()} credits</span>
                  </div>
                  <div className="flex justify-between text-ui-sm text-gray-600 mt-1">
                    <span>Used This Month</span>
                    <span className="font-medium">{creditsUsed.toLocaleString()} credits</span>
                  </div>
                  <Progress 
                    value={(creditsGranted > 0 ? creditsGranted : creditsMonthly) > 0 ? (creditsUsed / (creditsGranted > 0 ? creditsGranted : creditsMonthly)) * 100 : 0}
                    className="h-2 mt-3" 
                  />
                </div>
              )}

              {/* Free Tier Credits */}
              {!isPaidUser && currentPlan === 'free' && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-ui-md font-medium text-gray-900">Credits Balance</span>
                    <span className="text-heading-5 font-bold text-gray-700">
                      {creditsBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-ui-sm text-gray-600">
                    {freePlanConfig.features.find(f => f.text.includes('images per day'))?.text}, {freePlanConfig.features.find(f => f.text.includes('images per month'))?.text}
                  </p>
                  {freePlanConfig.credits.onSignup && (
                    <p className="text-ui-sm text-gray-600 mt-1">
                      {freePlanConfig.features.find(f => f.text.includes('credits on signup'))?.text}
                    </p>
                  )}
                </div>
              )}

              {/* Generation Costs Reference */}
              <div className="pt-3 border-t">
                <h4 className="text-ui-sm font-medium text-gray-700 mb-3">Generation Costs</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-ui-sm text-gray-600">Nano Banana Image</span>
                    <Badge variant="secondary">{PRICING_CONFIG.generationCosts.nanoBananaImage} credits</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-ui-sm text-gray-600">Sora 2 Video</span>
                    <Badge variant="secondary">{PRICING_CONFIG.generationCosts.sora2Video} credits</Badge>
                  </div>
                  {currentPlan === 'pro_plus' && (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-ui-sm text-gray-600">Sora 2 Pro Video</span>
                      <Badge variant="secondary">{PRICING_CONFIG.generationCosts.sora2ProVideo} credits</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="pt-3 border-t">
                <h4 className="text-ui-sm font-medium text-gray-700 mb-3">Usage Statistics {usagePeriod}</h4>
                {usageStats ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-ui-sm">
                      <span className="text-gray-600">Images Generated</span>
                      <span className="font-medium">{usageStats.generations.images.total} ({usageStats.generations.images.totalCredits} credits)</span>
                    </div>
                    <div className="flex justify-between text-ui-sm">
                      <span className="text-gray-600">Videos Generated</span>
                      <span className="font-medium">{usageStats.generations.videos.total} ({usageStats.generations.videos.totalCredits} credits)</span>
                    </div>
                    <div className="flex justify-between text-ui-sm pt-2 border-t">
                      <span className="text-gray-600 font-medium">Total Credits Used</span>
                      <span className="font-bold text-purple-600">{usageStats.credits.spent}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-ui-sm">
                      <span className="text-gray-600">Images Generated</span>
                      <span className="font-medium">{isPaidUser ? (usage?.images_this_month || 0) : (usage?.images_today || 0)}</span>
                    </div>
                    <div className="flex justify-between text-ui-sm">
                      <span className="text-gray-600">Videos Generated</span>
                      <span className="font-medium">{isPaidUser ? (usage?.videos_this_month || 0) : (usage?.videos_today || 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Credit Transaction History */}
              {isPaidUser && transactions.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="text-ui-sm font-medium text-gray-700 mb-3">Credit Usage History</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions.map((tx: any) => (
                      <div key={tx.id} className="flex justify-between items-start p-3 bg-gray-50 rounded text-ui-sm hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                            <span className="text-gray-700">{tx.description}</span>
                          </div>
                          <div className="text-ui-xs text-gray-500 mt-1">
                            {new Date(tx.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-ui-xs text-gray-500">Balance</div>
                          <div className="font-medium text-gray-700">{tx.balance_after}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Credits Warning */}
              {isPaidUser && creditsBalance > 0 && creditsBalance < 100 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    You're running low on credits. {currentPlan === 'pro' ? 'Consider upgrading to Pro+ for more credits' : 'Your credits will refresh next month'}.
                  </AlertDescription>
                </Alert>
              )}
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
      
      {/* Activation Confirmation Dialog - Removed (no trials) */}
    </div>
  )
}