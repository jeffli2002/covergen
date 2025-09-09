'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  User, CreditCard, History, Settings, LogOut, 
  Loader2, Crown, Zap, AlertCircle, ExternalLink,
  Calendar, RefreshCw, Shield
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

interface AccountPageClientProps {
  locale: string
}

export default function AccountPageClient({ locale }: AccountPageClientProps) {
  const router = useRouter()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState(0)
  const [cancelling, setCancelling] = useState(false)
  const [resuming, setResuming] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push(`/${locale}?auth=signin&redirect=${encodeURIComponent(`/${locale}/account`)}`)
      return
    }

    loadAccountData()
  }, [locale, router])

  const loadAccountData = async () => {
    try {
      const [sub, todayUsage] = await Promise.all([
        authService.getUserSubscription(),
        authService.getUserUsageToday()
      ])
      
      setSubscription(sub)
      setUsage(todayUsage)
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
        // Open in new window as expected by tests
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
  const planDetails = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]
  const usagePercentage = planDetails ? (usage / (planDetails.credits || 10)) * 100 : 0

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

        <Tabs defaultValue="subscription" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Current Plan
                  {getPlanIcon(currentPlan)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{planDetails?.name}</h3>
                    <p className="text-gray-600">
                      ${planDetails?.price ? planDetails.price / 100 : 0}/month
                    </p>
                  </div>
                  <Badge variant={
                    currentPlan === 'free' ? 'secondary' : 
                    subscription?.status === 'paused' ? 'destructive' :
                    'default'
                  }>
                    {subscription?.status === 'paused' ? 'Paused' : (subscription?.status || 'Active')}
                  </Badge>
                </div>

                {subscription && (
                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Show trial information if applicable */}
                    {subscription.is_trial_active && subscription.trial_end && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                        <p className="text-green-800 font-medium">
                          🎉 Free trial active
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          Trial ends on {formatDate(new Date(subscription.trial_end))}
                        </p>
                        <p className="text-green-700 text-xs mt-1">
                          {subscription.tier === 'pro' ? '4 covers/day during trial' : '6 covers/day during trial'}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-green-700 border-green-300 hover:bg-green-100"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/payment/convert-trial', {
                                method: 'POST'
                              })
                              const data = await response.json()
                              
                              if (data.success) {
                                if (data.checkoutUrl) {
                                  // Redirect to Creem checkout
                                  window.location.href = data.checkoutUrl
                                } else {
                                  // Fallback: just refresh the data
                                  toast.success('Trial conversion initiated!')
                                  await loadAccountData()
                                }
                              } else {
                                toast.error(data.error || 'Failed to convert trial')
                              }
                            } catch (error) {
                              console.error('Trial conversion error:', error)
                              toast.error('Failed to convert trial. Please try again.')
                            }
                          }}
                        >
                          Start subscription now (no rate limits)
                        </Button>
                      </div>
                    )}
                    
                    {subscription.current_period_end && !subscription.is_trial_active && (
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

                <div className="flex gap-3">
                  {currentPlan === 'free' ? (
                    <Button 
                      onClick={() => router.push(`/${locale}/payment`)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      Upgrade Plan
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleManageBilling}
                        disabled={loading}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Subscription
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

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
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
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage</CardTitle>
                <CardDescription>
                  Track your cover generation usage for the current month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Covers Generated</span>
                    <span className="text-sm font-medium">
                      {usage} / {planDetails?.credits || 10}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                </div>

                <p className="text-sm text-gray-600">
                  {planDetails?.credits ? planDetails.credits - usage : 10 - usage} credits remaining this month
                </p>

                {usagePercentage >= 80 && currentPlan !== 'pro_plus' && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      You're running low on credits. Consider upgrading for more.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Detailed usage history coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-gray-500 text-sm font-mono">{user?.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}