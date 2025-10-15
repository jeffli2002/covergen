'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Sparkles, Shield, Check, Crown, ArrowRight } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface UpgradePromptProps {
  open: boolean
  onClose: () => void
  reason?: 'credits' | 'daily_limit' | 'monthly_limit' | 'video_limit' | 'pro_feature'
  currentCredits?: number
  requiredCredits?: number
  generationType?: 'nanoBananaImage' | 'sora2Video' | 'sora2ProVideo'
}

export function UpgradePrompt({
  open,
  onClose,
  reason = 'credits',
  currentCredits = 0,
  requiredCredits = 5,
  generationType = 'nanoBananaImage',
}: UpgradePromptProps) {
  const { user } = useBestAuth()
  const router = useRouter()
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && open) {
      fetchSubscriptionInfo()
    }
  }, [user, open])

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/points/balance', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const currentPlan = subscriptionInfo?.tier || 'free'
  const recommendedPlan = currentPlan === 'free' ? 'pro' : 'pro_plus'
  const plan = PRICING_CONFIG.plans.find((p) => p.id === recommendedPlan) || PRICING_CONFIG.plans[1]

  const getTitle = () => {
    switch (reason) {
      case 'credits':
        return 'Not Enough Credits'
      case 'daily_limit':
        return 'Daily Limit Reached'
      case 'monthly_limit':
        return 'Monthly Limit Reached'
      case 'video_limit':
        return 'Upgrade for Video Generation'
      case 'pro_feature':
        return 'Pro Feature'
      default:
        return 'Upgrade Your Plan'
    }
  }

  const getMessage = () => {
    const proCredits = PRICING_CONFIG.plans[1].credits.monthly
    const proPlusCredits = PRICING_CONFIG.plans[2].credits.monthly
    
    switch (reason) {
      case 'credits':
        return `You need ${requiredCredits} credits but only have ${currentCredits} credits remaining. Upgrade to get monthly credits and continue creating!`
      case 'daily_limit':
        return `You've reached your daily limit. Upgrade to Pro for ${proCredits.toLocaleString()} credits per month!`
      case 'monthly_limit':
        return `You've reached your monthly limit. Upgrade to Pro for ${proCredits.toLocaleString()} credits per month!`
      case 'video_limit':
        return `Sora 2 video generation is available on Pro and Pro+ plans. Upgrade to start creating videos!`
      case 'pro_feature':
        return `This feature is available on Pro and Pro+ plans. Upgrade to unlock professional features!`
      default:
        return `Upgrade to ${plan.name} and unlock more creative power!`
    }
  }

  const creditsProgress = (currentCredits / requiredCredits) * 100

  const handleUpgrade = () => {
    if (!user) {
      router.push(`/sign-in?redirect=/pricing`)
      onClose()
      return
    }

    router.push(`/pricing?highlight=${recommendedPlan}`)
    onClose()
  }

  const handleBuyCredits = () => {
    if (!user) {
      router.push(`/sign-in?redirect=/pricing#credits-packs`)
      onClose()
      return
    }

    router.push(`/pricing#credits-packs`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500" />
              {getTitle()}
            </DialogTitle>
            {currentPlan !== 'free' && (
              <Badge variant="outline" className="text-xs">
                {currentPlan === 'pro' ? 'Pro' : 'Pro+'}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-base">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        {/* Credits Progress (if applicable) */}
        {reason === 'credits' && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Credits</span>
              <span className="font-semibold text-gray-900">
                {currentCredits} / {requiredCredits}
              </span>
            </div>
            <Progress value={creditsProgress} className="h-2" />
            <p className="text-xs text-gray-500">
              You need {requiredCredits - currentCredits} more credits for this {generationType.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </p>
          </div>
        )}

        {/* Recommended Plan */}
        <div className="border-2 border-orange-500 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {plan.id === 'pro' ? <Zap className="w-5 h-5 text-orange-500" /> : <Crown className="w-5 h-5 text-orange-500" />}
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <Badge className="bg-orange-500">Recommended</Badge>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ${plan.price.yearly > 0 ? (plan.price.yearly / 12).toFixed(2) : '0'}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Billed ${plan.price.yearly.toFixed(2)} annually (20% off)
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {plan.features.slice(0, 4).map((feature, idx) => (
              feature.included && (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              )
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            size="lg"
            onClick={handleUpgrade}
          >
            Upgrade to {plan.name}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Alternative: Buy Credits Pack */}
        {reason === 'credits' && currentPlan !== 'free' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Just need a few more credits?
                </h4>
                <p className="text-xs text-blue-800 mb-3">
                  Purchase a one-time credit pack that never expires
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300 hover:bg-blue-100"
                  onClick={handleBuyCredits}
                >
                  Browse Credit Packs
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Free Tier Info */}
        {currentPlan === 'free' && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {reason === 'daily_limit' && 'Your limits reset tomorrow'}
              {reason === 'monthly_limit' && 'Your limits reset next month'}
              {(reason === 'credits' || reason === 'video_limit' || reason === 'pro_feature') && (
                <>Not ready to upgrade? <button className="text-orange-600 hover:underline font-medium" onClick={onClose}>Continue with Free</button></>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
