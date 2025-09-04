'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { useFreeTier } from '@/hooks/useFreeTier'
import { useAuth } from '@/contexts/AuthContext'

export default function UserMenu() {
  const { getRemainingGenerations, freeTierLimit } = useFreeTier()
  const { subscription } = useAuth()
  const remaining = getRemainingGenerations()
  const isDevMode = process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true' && process.env.NODE_ENV === 'development'
  
  // In production or when user has a subscription, always show real usage
  const shouldShowDevMode = isDevMode && !subscription?.tier || (subscription?.tier === 'free' && isDevMode)

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <Sparkles className="w-4 h-4 text-purple-600" />
      <span className="text-sm text-gray-700">
        {shouldShowDevMode ? (
          <>Unlimited (Dev Mode)</>
        ) : subscription && subscription.tier !== 'free' ? (
          <>{subscription.monthlyUsage} / {subscription.quotaLimit} images this month</>
        ) : (
          <>{remaining} / {freeTierLimit} images today</>
        )}
      </span>
      {!shouldShowDevMode && remaining === 0 && subscription?.tier === 'free' && (
        <Badge className="bg-red-500 text-white text-xs">
          Limit reached
        </Badge>
      )}
      {shouldShowDevMode && (
        <Badge className="bg-blue-500 text-white text-xs">
          DEV
        </Badge>
      )}
    </div>
  )
}