'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { useFreeTier } from '@/hooks/useFreeTier'

export default function UserMenu() {
  const { getRemainingGenerations, freeTierLimit } = useFreeTier()
  const remaining = getRemainingGenerations()
  const isDevMode = process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true'

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <Sparkles className="w-4 h-4 text-purple-600" />
      <span className="text-sm text-gray-700">
        {isDevMode ? (
          <>Unlimited (Dev Mode)</>
        ) : (
          <>{remaining} / {freeTierLimit} images today</>
        )}
      </span>
      {!isDevMode && remaining === 0 && (
        <Badge className="bg-red-500 text-white text-xs">
          Limit reached
        </Badge>
      )}
      {isDevMode && (
        <Badge className="bg-blue-500 text-white text-xs">
          DEV
        </Badge>
      )}
    </div>
  )
}