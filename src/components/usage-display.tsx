'use client'

import { useEffect, useState } from 'react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { getSubscriptionConfig } from '@/lib/subscription-config'
import { useAppStore } from '@/lib/store'

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

interface UsageDisplayProps {
  session?: { token: string; expires_at: string } | null
}

export default function UsageDisplay({ session: parentSession }: UsageDisplayProps = {}) {
  const { user, session: hookSession } = useBestAuth()
  const session = parentSession || hookSession
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const config = getSubscriptionConfig()
  const usageRefreshTrigger = useAppStore(state => state.usageRefreshTrigger)

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
  }, [user, session, usageRefreshTrigger]) // Added usageRefreshTrigger to dependencies

  const fetchUsageStatus = async () => {
    try {
      setLoading(true)
      console.log('[UsageDisplay] Fetching usage status for user:', user?.email)
      
      const headers: HeadersInit = {}
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`
      }
      
      const response = await fetch('/api/usage/status', { headers })
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

  // Determine what to display based on user type
  const isPaidUser = !usageStatus.is_trial && (usageStatus.subscription_tier === 'pro' || usageStatus.subscription_tier === 'pro_plus')
  
  // Calculate used and total for consistent display
  let used: number
  let total: number | null
  let period: string
  
  if (isPaidUser) {
    // Paid users: show monthly usage
    used = usageStatus.monthly_usage || 0
    total = usageStatus.monthly_limit ?? null
    period = 'this month'
  } else {
    // Free and trial users: show daily usage
    used = usageStatus.daily_usage || 0
    total = usageStatus.daily_limit ?? null
    period = 'today'
  }

  // Calculate percentage for color coding
  const remainingPercentage = total && total > 0 
    ? ((total - used) / total) * 100 
    : 100
    
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
      <Badge 
        variant="secondary" 
        className={`${colorClass} flex items-center gap-1 px-2 md:px-3 py-1`}
        title={`${used} images generated ${period} out of ${total || 'unlimited'}`}
      >
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">
          {used}/{total || '∞'}
          <span className="hidden sm:inline ml-1">{period}</span>
        </span>
      </Badge>
      
      {/* Always show tier badge */}
      <Badge variant="outline" className={`text-xs px-2 md:px-3 ${tierBadgeClass}`}>
        {tierDisplay}
      </Badge>
    </div>
  )
}