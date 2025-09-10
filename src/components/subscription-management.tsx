'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getClientSubscriptionConfig, getTrialPeriodText } from '@/lib/subscription-config-client'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
}

export function SubscriptionManagement() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [processing, setProcessing] = useState(false)
  const config = getClientSubscriptionConfig()

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [user])

  const fetchSubscriptionInfo = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/subscription/status')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription || processing) return
    
    const confirmCancel = window.confirm(
      subscription.status === 'trialing'
        ? 'Are you sure you want to cancel your trial? You will not be charged.'
        : 'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.'
    )
    
    if (!confirmCancel) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Subscription cancelled', {
          description: data.message
        })
        await fetchSubscriptionInfo()
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to cancel subscription'
        })
      }
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setProcessing(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!subscription || processing) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Subscription resumed', {
          description: 'Your subscription will continue after the current period.'
        })
        await fetchSubscriptionInfo()
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to resume subscription'
        })
      }
    } catch (error) {
      toast.error('Failed to resume subscription')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpgrade = async (targetTier: 'pro' | 'pro_plus') => {
    if (!subscription || processing) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.checkoutUrl) {
          // Redirect to checkout for trial upgrades
          window.location.href = data.checkoutUrl
        } else {
          toast.success('Subscription upgraded', {
            description: data.message
          })
          await fetchSubscriptionInfo()
        }
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to upgrade subscription'
        })
      }
    } catch (error) {
      toast.error('Failed to upgrade subscription')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load subscription information.
        </AlertDescription>
      </Alert>
    )
  }

  const isTrialing = subscription.isTrialing
  const isCancelled = subscription.cancelAtPeriodEnd
  const planName = subscription.plan === 'pro-plus' ? 'Pro+' : subscription.plan === 'pro' ? 'Pro' : 'Free'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription Management</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isTrialing ? 'secondary' : 'default'}>
              {planName} Plan
            </Badge>
            {isTrialing && subscription.trialDaysRemaining !== null && (
              <Badge variant="outline">
                {subscription.trialDaysRemaining} {subscription.trialDaysRemaining === 1 ? 'day' : 'days'} left
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Manage your subscription and billing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Status</span>
            <span className="text-sm text-muted-foreground capitalize">
              {subscription.status}
              {isCancelled && ' (Cancelling)'}
            </span>
          </div>
          
          {subscription.currentPeriodEnd && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                {isTrialing ? 'Trial ends' : isCancelled ? 'Access until' : 'Next billing date'}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(new Date(subscription.currentPeriodEnd), 'PPP')}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-sm font-medium">Monthly limit</span>
            <span className="text-sm text-muted-foreground">
              {subscription.plan === 'free' 
                ? config.limits.free.monthly
                : subscription.plan === 'pro'
                ? config.limits.pro.monthly
                : config.limits.pro_plus.monthly
              } covers
            </span>
          </div>
        </div>

        {isTrialing && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {subscription.trialDaysRemaining === 1 
                ? 'Your trial ends tomorrow. '
                : subscription.trialDaysRemaining === 0
                ? 'Your trial ends today. '
                : `You have ${subscription.trialDaysRemaining} days left in your trial. `
              }
              {subscription.plan === 'free' 
                ? 'Upgrade now to continue with Pro features after your trial ends.'
                : 'Your subscription will automatically continue after the trial period unless you cancel.'
              }
            </AlertDescription>
          </Alert>
        )}

        {isCancelled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription is scheduled to cancel at the end of your current billing period.
              You can resume your subscription anytime before then.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        {/* Upgrade buttons for free/pro users */}
        {subscription.canUpgrade && !isCancelled && (
          <div className="flex gap-2 w-full">
            {subscription.plan === 'free' && (
              <Button
                onClick={() => handleUpgrade('pro')}
                disabled={processing}
                className="flex-1"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            )}
            <Button
              onClick={() => handleUpgrade('pro_plus')}
              disabled={processing}
              className="flex-1"
              variant={subscription.plan === 'pro' ? 'default' : 'outline'}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Pro+
            </Button>
          </div>
        )}
        
        {/* Cancel/Resume button */}
        {subscription.plan !== 'free' && (
          <div className="w-full">
            {isCancelled ? (
              <Button
                onClick={handleResumeSubscription}
                disabled={processing}
                variant="outline"
                className="w-full"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CheckCircle className="mr-2 h-4 w-4" />
                Resume Subscription
              </Button>
            ) : (
              <Button
                onClick={handleCancelSubscription}
                disabled={processing}
                variant="destructive"
                className="w-full"
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cancel Subscription
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}