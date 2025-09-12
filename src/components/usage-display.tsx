'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { getSubscriptionConfig } from '@/lib/subscription-config'

interface UsageStatus {
  daily_usage: number
  daily_limit: number
  remaining_daily: number
  is_trial: boolean
  subscription_tier: string
  trial_ends_at?: string | null
}

export default function UsageDisplay() {
  const { user } = useAuth()
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const config = getSubscriptionConfig()

  useEffect(() => {
    // For non-logged in users, show free tier limits
    if (!user) {
      setUsageStatus({
        daily_usage: 0,
        daily_limit: config.limits.free.daily,
        remaining_daily: config.limits.free.daily,
        is_trial: false,
        subscription_tier: 'free'
      })
      return
    }

    // For logged in users, fetch their actual usage
    fetchUsageStatus()
  }, [user])

  const fetchUsageStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/usage/status')
      if (response.ok) {
        const data = await response.json()
        setUsageStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usageStatus) {
    return null
  }

  // Determine display color based on remaining usage
  const remainingPercentage = (usageStatus.remaining_daily / usageStatus.daily_limit) * 100
  let colorClass = 'bg-green-100 text-green-800'
  if (remainingPercentage <= 0) {
    colorClass = 'bg-red-100 text-red-800'
  } else if (remainingPercentage <= 25) {
    colorClass = 'bg-orange-100 text-orange-800'
  } else if (remainingPercentage <= 50) {
    colorClass = 'bg-yellow-100 text-yellow-800'
  }

  // Format tier display
  const tierDisplay = usageStatus.is_trial 
    ? `${usageStatus.subscription_tier} Trial`
    : usageStatus.subscription_tier === 'free' 
    ? 'Free' 
    : usageStatus.subscription_tier === 'pro'
    ? 'Pro'
    : 'Pro+'

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Badge variant="secondary" className={`${colorClass} flex items-center gap-1 px-2 md:px-3 py-1`}>
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">
          {usageStatus.remaining_daily}/{usageStatus.daily_limit}
          <span className="hidden sm:inline"> daily</span>
        </span>
      </Badge>
      
      {/* Show tier for logged in users */}
      {user && (
        <Badge variant="outline" className="text-xs px-2 md:px-3">
          {tierDisplay}
        </Badge>
      )}
    </div>
  )
}