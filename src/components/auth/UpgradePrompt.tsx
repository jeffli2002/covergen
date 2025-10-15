'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, Check } from 'lucide-react'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import { getPlanByType } from '@/lib/subscription-plans'
import { usePathname } from 'next/navigation'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface UpgradePromptProps {
  onClose?: () => void
  onUpgrade?: () => void
  onSignIn?: () => void
  dailyCount?: number
  dailyLimit?: number
  type?: 'image' | 'video'
  isAuthenticated?: boolean
}

export default function UpgradePrompt({ 
  onClose, 
  onUpgrade,
  onSignIn, 
  dailyCount = 3, 
  dailyLimit = 3, 
  type = 'image',
  isAuthenticated = true
}: UpgradePromptProps) {
  // Get subscription configuration
  const config = getClientSubscriptionConfig()
  
  // Get Pro plan pricing from PRICING_CONFIG
  const proPlan = getPlanByType('pro')
  const freePlan = getPlanByType('free')
  const proPrice = PRICING_CONFIG.plans[1].price.monthly
  const proPriceDisplay = `$${proPrice.toFixed(1)}/mo`
  
  // Get current locale from pathname
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en' // Extract locale from path
  
  const contentType = type === 'video' ? 'videos' : 'images'
  
  // Get plan limits from PRICING_CONFIG (credit-based)
  const proCredits = PRICING_CONFIG.plans[1].credits.monthly
  const proPlusCredits = PRICING_CONFIG.plans[2].credits.monthly
  const proImageLimit = Math.floor(proCredits / PRICING_CONFIG.generationCosts.nanoBananaImage)
  const proPlusImageLimit = Math.floor(proPlusCredits / PRICING_CONFIG.generationCosts.nanoBananaImage)
  const proVideoLimit = Math.floor(proCredits / PRICING_CONFIG.generationCosts.sora2Video)
  const proPlusVideoLimit = Math.floor(proPlusCredits / PRICING_CONFIG.generationCosts.sora2Video)
  
  // Get free tier limits for display (from subscription config)
  const freeSignupBonus = PRICING_CONFIG.plans[0].credits.onSignup! // 30 credits
  const freeDailyLimit = 3 // SUBSCRIPTION_CONFIG.free.dailyImageLimit
  const freeMonthlyLimit = 10 // SUBSCRIPTION_CONFIG.free.monthlyImageLimit
  
  const features = type === 'video' 
    ? [
        { icon: Zap, text: `${proCredits} credits/month (Pro) or ${proPlusCredits}/month (Pro+)` },
        { icon: Zap, text: `Up to ${proVideoLimit} videos/month (Pro) or ${proPlusVideoLimit}/month (Pro+)` },
        { icon: Sparkles, text: 'Sora 2 AI video generation' },
        { icon: Shield, text: 'Commercial usage rights' },
        { icon: Check, text: 'HD quality exports' },
      ]
    : [
        { icon: Zap, text: `${proCredits} credits/month (Pro) or ${proPlusCredits}/month (Pro+)` },
        { icon: Zap, text: `Up to ${proImageLimit} images/month (Pro) or ${proPlusImageLimit}/month (Pro+)` },
        { icon: Sparkles, text: 'Gemini 2.5 Flash AI generation' },
        { icon: Shield, text: 'Commercial usage rights' },
      ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              {!isAuthenticated ? 'Sign In Required' : 'Daily Limit Reached'}
            </CardTitle>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-2">
            {!isAuthenticated 
              ? type === 'video'
                ? `Please sign in to generate videos. Free users don't have video access. Sign up to get one-time signup bonus for images!`
                : `Please sign in to generate images. Free tier has daily and monthly limits. Sign up for one-time signup bonus!`
              : `You've reached your daily limit for ${contentType}.`
            }
          </p>
          {isAuthenticated && (
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-xs">
                Used {dailyCount} / {dailyLimit} {contentType} today
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to Pro
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-purple-600">{proPriceDisplay}</span>
            </div>
            {proPrice < 20 && <Badge className="mt-2 bg-purple-500">SPECIAL OFFER</Badge>}
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {!isAuthenticated ? (
              <>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    if (onSignIn) {
                      onSignIn()
                    } else {
                      window.location.href = `/${locale}?auth=signin`
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (onSignIn) {
                      onSignIn()
                    } else {
                      window.location.href = `/${locale}?auth=signup`
                    }
                  }}
                >
                  Create Free Account
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => window.location.href = `/${locale}/payment`}
                >
                  Upgrade to Pro
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={onClose}
                >
                  Try Again Tomorrow
                </Button>
              </>
            )}
          </div>

          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>Your daily limit resets at midnight UTC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}