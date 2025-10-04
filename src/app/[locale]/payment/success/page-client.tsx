'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useBestAuth } from '@/hooks/useBestAuth'
import confetti from 'canvas-confetti'
import { authEvents } from '@/lib/events/auth-events'

interface PaymentSuccessClientProps {
  locale: string
  sessionId?: string
}

export default function PaymentSuccessClient({ locale, sessionId }: PaymentSuccessClientProps) {
  const router = useRouter()
  const { user: authUser, session } = useBestAuth()
  const { user, setUser, triggerUsageRefresh, triggerSubscriptionRefresh } = useAppStore()
  const [loading, setLoading] = useState(true)
  interface Subscription {
    id: string
    user_id: string
    tier: 'free' | 'pro' | 'pro_plus'
    status: 'active' | 'trialing' | 'paused' | 'cancelled'
    created_at: string
    updated_at: string
  }
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Load updated subscription info
    loadSubscriptionInfo()
  }, [])

  const loadSubscriptionInfo = async () => {
    try {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Fetch subscription info using BestAuth
      if (session?.token) {
        const response = await fetch('/api/bestauth/subscription/status', {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('[PaymentSuccess] Subscription loaded:', data)
          
          if (data) {
            setSubscription({
              id: data.id,
              user_id: data.user_id,
              tier: data.tier || data.plan,
              status: data.status,
              created_at: data.created_at,
              updated_at: data.updated_at
            })
            
            // Update app store with new tier
            if (authUser) {
              const quotaLimits = {
                pro: 120,
                pro_plus: 300
              }
              const tier = data.tier || data.plan
              setUser({
                id: authUser.id,
                email: authUser.email,
                tier: tier,
                quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
                quotaUsed: 0
              })
            }
            
            // Trigger refresh in other components
            console.log('[PaymentSuccess] Triggering subscription refresh')
            triggerSubscriptionRefresh()
            triggerUsageRefresh()
            
            // Emit subscription change event
            authEvents.emitSubscriptionChange(data)
            authEvents.emitAuthChange('subscription_update')
          }
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanDetails = (tier: string) => {
    switch (tier) {
      case 'pro':
        return {
          name: 'Pro',
          features: [
            'All platform sizes unlocked',
            'Priority support',
            'Batch generation'
          ]
        }
      case 'pro_plus':
        return {
          name: 'Pro+',
          features: [
            'Everything in Pro',
            'Commercial license',
            'Custom brand templates'
          ]
        }
      default:
        return null
    }
  }

  const planDetails = subscription ? getPlanDetails(subscription.tier) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            
            <CardTitle className="text-3xl mb-2">
              Welcome to {planDetails?.name || 'Pro'}! 🎉
            </CardTitle>
            
            <CardDescription className="text-lg">
              Your subscription has been activated successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : planDetails ? (
              <>
                {/* Features */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">What's included:</h3>
                  <ul className="space-y-2">
                    {planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li>1. Start creating amazing covers with your subscription</li>
                    <li>2. Explore all platform sizes now available to you</li>
                    <li>3. Check out the batch generation feature</li>
                    <li>4. Contact support if you need any help</li>
                  </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    size="lg"
                    onClick={() => router.push(`/${locale}?from_payment=true`)}
                  >
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.push(`/${locale}/account`)}
                  >
                    View Account
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  We're setting up your subscription...
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/${locale}?from_payment=true`)}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session ID for debugging in test mode */}
        {sessionId && process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  )
}