'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Zap, Shield, Check } from 'lucide-react'

interface UpgradePromptProps {
  onClose?: () => void
  onSignIn?: () => void
}

export default function UpgradePrompt({ onClose, onSignIn }: UpgradePromptProps) {
  const features = [
    { icon: Zap, text: 'Unlimited image generation' },
    { icon: Sparkles, text: 'Priority AI processing' },
    { icon: Shield, text: 'Commercial usage rights' },
    { icon: Check, text: 'All platform sizes included' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Daily Limit Reached</CardTitle>
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
            You've used all 10 free images for today. Sign in or upgrade to continue creating!
          </p>
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
            <Badge className="mt-2 bg-green-500">COMING SOON</Badge>
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
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled
            >
              Upgrade to Pro (Coming Soon)
            </Button>
            
            {onSignIn && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onSignIn}
              >
                Sign In to Continue
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Free tier resets daily at midnight</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}