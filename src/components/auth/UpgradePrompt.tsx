'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, Check } from 'lucide-react'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'
import { usePathname } from 'next/navigation'

interface UpgradePromptProps {
  onClose?: () => void
  onUpgrade?: () => void
  dailyCount?: number
  dailyLimit?: number
  isTrial?: boolean
  type?: 'image' | 'video'
  isAuthenticated?: boolean
}

export default function UpgradePrompt({ 
  onClose, 
  onUpgrade, 
  dailyCount = 3, 
  dailyLimit = 3, 
  isTrial = false,
  type = 'image',
  isAuthenticated = true
}: UpgradePromptProps) {
  // Get subscription configuration
  const config = getClientSubscriptionConfig()
  
  // Get current locale from pathname
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en' // Extract locale from path
  
  const contentType = type === 'video' ? 'videos' : 'images'
  const features = type === 'video' 
    ? [
        { icon: Zap, text: '30 videos/month (Pro) or 60/month (Pro+)' },
        { icon: Sparkles, text: 'Sora 2 AI video generation' },
        { icon: Shield, text: 'Commercial usage rights' },
        { icon: Check, text: 'HD quality exports' },
      ]
    : [
        { icon: Zap, text: 'Unlimited daily generations' },
        { icon: Sparkles, text: 'Priority AI processing' },
        { icon: Shield, text: 'Commercial usage rights' },
        { icon: Check, text: 'All platform sizes included' },
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
              ? `Please sign in to generate ${contentType}. Free users get ${dailyLimit} ${contentType} per day!`
              : isTrial 
              ? `You've used all ${dailyLimit} ${contentType} for today during your ${config.trialDays}-day free trial.`
              : `You've used all ${dailyLimit} free ${contentType} for today.`
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
              <span className="text-3xl font-bold text-purple-600">$9.99</span>
              <span className="text-gray-600">/month</span>
            </div>
            <Badge className="mt-2 bg-purple-500">SPECIAL OFFER</Badge>
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
                  onClick={() => window.location.href = `/${locale}?auth=signin`}
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `/${locale}?auth=signup`}
                >
                  Create Free Account
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={onUpgrade || (() => window.location.href = `/${locale}/pricing`)}
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
            {isTrial && (
              <p className="font-medium text-purple-600">
                You have {3} days left in your free trial
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}