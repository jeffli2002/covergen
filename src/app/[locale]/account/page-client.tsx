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
import { creemService, SUBSCRIPTION_PLANS } from '@/services/payment/creem'
import { toast } from 'sonner'

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

// Trial limits configuration
const TRIAL_LIMITS = {
  pro: {
    daily: 10,
    total: 50,
    days: 7
  },
  pro_plus: {
    daily: 20,
    total: 100,
    days: 7
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
  const [authUser, setAuthUser] = useState<any>(null)

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
      if (currentUser && sub) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          tier: sub.tier || 'free',
          quotaUsed: todayUsage,
          quotaLimit: SUBSCRIPTION_PLANS[sub.tier as keyof typeof SUBSCRIPTION_PLANS]?.credits || 10
        })
      } else if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          tier: 'free',
          quotaUsed: todayUsage,
          quotaLimit: 10
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
  const planDetails = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]
  const trialLimits = isTrialing ? TRIAL_LIMITS[currentPlan as keyof typeof TRIAL_LIMITS] : null
  
  // Calculate usage based on whether it's a trial
  const dailyLimit = isTrialing && trialLimits ? trialLimits.daily : (planDetails?.credits || 10)
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
                      <>Free {trialLimits?.days}-day trial</>
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
                    <Button 
                      onClick={() => router.push(`/${locale}/payment?plan=${currentPlan}&activate=true`)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Activate {planDetails?.name} - ${planDetails?.price ? planDetails.price / 100 : 0}/mo
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/${locale}/payment`)}
                    >
                      View All Plans
                    </Button>
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
    </div>
  )
}