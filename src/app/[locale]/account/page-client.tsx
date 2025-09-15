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
import authService from '@/services/authService'
import { creemService } from '@/services/payment/creem'
import { toast } from 'sonner'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import ActivationConfirmDialog from '@/components/subscription/ActivationConfirmDialog'

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
  const { user, setUser } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState(0)
  const [cancelling, setCancelling] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [activating, setActivating] = useState(false)
  const [authUser, setAuthUser] = useState<any>(null)
  const [showActivationConfirm, setShowActivationConfirm] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(`/${locale}/account`)}`)
      return
    }

    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      // Get current user from auth service
      const currentUser = authService.getCurrentUser()
      setAuthUser(currentUser)
      
      // Load subscription and usage data
      const [sub, todayUsage] = await Promise.all([
        authService.getUserSubscription(),
        authService.getUserUsageToday()
      ])
      
      setSubscription(sub)
      setUsage(todayUsage)
      
      // Update user in store if we have subscription data
      const config = getClientSubscriptionConfig()
      if (currentUser && sub) {
        const quotaLimit = sub.tier === 'pro' ? config.limits.pro.monthly : 
                          sub.tier === 'pro_plus' ? config.limits.pro_plus.monthly : 
                          config.limits.free.daily
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          tier: sub.tier || 'free',
          quotaUsed: todayUsage,
          quotaLimit: quotaLimit
        })
      } else if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          tier: 'free',
          quotaUsed: todayUsage,
          quotaLimit: config.limits.free.daily
        })
      }
    } catch (error) {
      console.error('Error loading account data:', error)
      toast.error('Failed to load account data')
    } finally {
      setLoading(false)
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
      const result = await creemService.cancelSubscription(subscription.stripe_subscription_id)
      
      if (result.success) {
        toast.success('Subscription cancelled. You will keep access until the end of your billing period.')
        await loadAccountData()
      } else {
        throw new Error(result.error || 'Failed to cancel subscription')
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
      const result = await creemService.resumeSubscription(subscription.stripe_subscription_id)
      
      if (result.success) {
        toast.success('Subscription resumed successfully!')
        await loadAccountData()
      } else {
        throw new Error(result.error || 'Failed to resume subscription')
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
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    await authService.signOut()
    setUser(null)
    router.push(`/${locale}`)
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
        'Priority support',
        `${config.trialDays}-day free trial`
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
        'Dedicated support',
        `${config.trialDays}-day free trial`
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
  
  // Calculate usage based on whether it's a trial
  const dailyLimit = isTrialing && trialLimits ? trialLimits.daily : (planDetails?.credits || config.limits.free.daily)
  const usagePercentage = (usage / dailyLimit) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and account settings</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{authUser?.email || 'Not available'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-500 text-sm font-mono mt-1">{authUser?.id || 'Not available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Plan & Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                {getPlanIcon(currentPlan)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    {planDetails?.name}
                    {isTrialing && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Trial
                      </Badge>
                    )}
                  </h3>
                  <p className="text-gray-600 mt-1">
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
                      <p className="font-medium">Trial Limits:</p>
                      <ul className="space-y-1 text-sm">
                        <li>• {trialLimits.daily} covers per day</li>
                        <li>• {trialLimits.total} total covers during trial</li>
                        <li>• {trialLimits.days} days trial period</li>
                      </ul>
                      {subscription.trial_ends_at && (
                        <p className="text-sm mt-2">
                          <Clock className="inline w-4 h-4 mr-1" />
                          Trial ends on {formatDateTime(new Date(subscription.trial_ends_at))}
                        </p>
                      )}
                      {subscription.stripe_subscription_id ? (
                        <p className="text-sm mt-2 font-medium text-blue-900">
                          ✓ Your subscription will automatically activate when the trial ends
                        </p>
                      ) : (
                        <p className="text-sm mt-2 text-blue-800">
                          ⚠️ Please add a payment method to continue after trial
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Subscription Dates */}
              {subscription && !isTrialing && currentPlan !== 'free' && (
                <div className="space-y-2 text-sm text-gray-600">
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
                          className="text-sm"
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
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Usage {isTrialing ? 'Today' : 'This Month'}
              </CardTitle>
              <CardDescription>
                Track your cover generation usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Covers Generated</span>
                  <span className="text-sm font-medium">
                    {usage} / {dailyLimit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>

              <p className="text-sm text-gray-600">
                {dailyLimit - usage} credits remaining {isTrialing ? 'today' : 'this month'}
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
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Plan Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planDetails?.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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