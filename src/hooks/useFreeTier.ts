'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const FREE_TIER_LIMIT = 3

export function useFreeTier() {
  const { user, getUserUsageToday, incrementUsage, getUserSubscription } = useAuth()
  const [usageToday, setUsageToday] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const checkUsage = async () => {
      if (user) {
        setIsLoading(true)
        try {
          // Load subscription to check tier
          const sub = await getUserSubscription()
          setSubscription(sub)
          
          const localUsage = getLocalUsage()
          
          if (localUsage > 0) {
            for (let i = 0; i < localUsage; i++) {
              await incrementUsage()
            }
            localStorage.removeItem('coverimage_usage')
          }
          
          const usage = await getUserUsageToday()
          setUsageToday(usage)
        } catch (error) {
          console.error('Error checking usage:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        const localUsage = getLocalUsage()
        setUsageToday(localUsage)
        setIsLoading(false)
      }
    }

    checkUsage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Remove getUserUsageToday from dependencies to prevent unnecessary calls

  const canGenerate = () => {
    // Bypass limit in development mode
    if (process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true') {
      return true
    }
    
    // Pro and Pro+ users have no daily limits (they use credits instead)
    if (subscription) {
      const tier = subscription.tier || subscription.subscription_tier || 'free'
      if (tier === 'pro' || tier === 'pro_plus') {
        console.log('[useFreeTier] Pro/Pro+ user - bypassing daily limit check')
        return true // Let the backend check credits instead
      }
    }
    
    // Free tier users have daily limit
    return usageToday < FREE_TIER_LIMIT
  }

  const getRemainingGenerations = () => {
    // Show unlimited in development mode
    if (process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true') {
      return 999
    }
    
    // Pro and Pro+ users have effectively unlimited daily generations
    if (subscription) {
      const tier = subscription.tier || subscription.subscription_tier || 'free'
      if (tier === 'pro' || tier === 'pro_plus') {
        return 999 // Effectively unlimited (limited by credits, not daily count)
      }
    }
    
    // Free tier users have daily limit
    return Math.max(0, FREE_TIER_LIMIT - usageToday)
  }

  const incrementLocalUsage = () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('coverimage_usage')
    const usage = stored ? JSON.parse(stored) : {}
    
    if (usage.date !== today) {
      usage.date = today
      usage.count = 0
    }
    
    usage.count = (usage.count || 0) + 1
    localStorage.setItem('coverimage_usage', JSON.stringify(usage))
    setUsageToday(usage.count)
  }

  const getLocalUsage = () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('coverimage_usage')
    
    if (!stored) return 0
    
    const usage = JSON.parse(stored)
    return usage.date === today ? usage.count : 0
  }

  const trackUsage = async () => {
    // Skip tracking in development mode
    if (process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true') {
      console.log('Dev mode: Skipping usage tracking')
      return
    }
    
    if (user) {
      try {
        await incrementUsage()
        const newUsage = await getUserUsageToday()
        setUsageToday(newUsage)
      } catch (error) {
        console.error('Error tracking usage:', error)
      }
    } else {
      incrementLocalUsage()
    }
  }

  return {
    usageToday,
    canGenerate,
    getRemainingGenerations,
    trackUsage,
    isLoading,
    freeTierLimit: FREE_TIER_LIMIT,
    subscription
  }
}