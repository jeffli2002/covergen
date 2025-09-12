'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { getSubscriptionConfig } from '@/lib/subscription-config'

interface UsageStatus {
  daily_usage: number
  daily_limit: number
  monthly_usage?: number
  monthly_limit?: number
  remaining_daily: number
  remaining_monthly?: number
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
      console.log('[UsageDisplay] Fetching usage status for user:', user?.email)
      const response = await fetch('/api/usage/status')
      if (response.ok) {
        const data = await response.json()
        console.log('[UsageDisplay] Usage status received:', data)
        setUsageStatus(data)
      } else {
        console.error('[UsageDisplay] Failed to fetch usage status:', response.status)
      }
    } catch (error) {
      console.error('[UsageDisplay] Failed to fetch usage status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usageStatus) {
    return null
  }

  // Format tier display
  const tierDisplay = usageStatus.is_trial 
    ? `${usageStatus.subscription_tier === 'pro' ? 'Pro' : 'Pro+'} Trial`
    : usageStatus.subscription_tier === 'free' 
    ? 'Free' 
    : usageStatus.subscription_tier === 'pro'
    ? 'Pro'
    : 'Pro+'

  // Determine tier badge color
  const tierBadgeClass = usageStatus.is_trial 
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : usageStatus.subscription_tier === 'pro'
    ? 'bg-orange-100 text-orange-800 border-orange-200'
    : usageStatus.subscription_tier === 'pro_plus'
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : 'bg-gray-100 text-gray-800 border-gray-200'

  // Determine what limit to show (daily for free/trial, monthly for paid)
  const isPaidUser = !usageStatus.is_trial && (usageStatus.subscription_tier === 'pro' || usageStatus.subscription_tier === 'pro_plus')
  const limitType = isPaidUser ? 'monthly' : 'daily'
  
  // For paid users, we need to fetch monthly data
  const displayLimit = isPaidUser 
    ? (usageStatus.monthly_limit || usageStatus.daily_limit)
    : usageStatus.daily_limit
    
  const displayRemaining = isPaidUser
    ? (usageStatus.remaining_monthly !== undefined ? usageStatus.remaining_monthly : usageStatus.remaining_daily)
    : usageStatus.remaining_daily

  // Determine display color based on remaining usage
  const remainingPercentage = displayRemaining && displayLimit > 0 
    ? (displayRemaining / displayLimit) * 100 
    : 0
    
  let colorClass = 'bg-green-100 text-green-800'
  if (remainingPercentage <= 0) {
    colorClass = 'bg-red-100 text-red-800'
  } else if (remainingPercentage <= 25) {
    colorClass = 'bg-orange-100 text-orange-800'
  } else if (remainingPercentage <= 50) {
    colorClass = 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <Badge variant="secondary" className={`${colorClass} flex items-center gap-1 px-2 md:px-3 py-1`}>
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">
          {displayRemaining}/{displayLimit}
          <span className="hidden sm:inline"> {limitType}</span>
        </span>
      </Badge>
      
      {/* Always show tier badge */}
      <Badge variant="outline" className={`text-xs px-2 md:px-3 ${tierBadgeClass}`}>
        {tierDisplay}
      </Badge>
    </div>
  )
}