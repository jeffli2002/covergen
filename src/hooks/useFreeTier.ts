'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const FREE_TIER_LIMIT = 10

export function useFreeTier() {
  const { user, getUserUsageToday, incrementUsage } = useAuth()
  const [usageToday, setUsageToday] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUsage = async () => {
      if (user) {
        setIsLoading(true)
        try {
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
  }, [user, getUserUsageToday])

  const canGenerate = () => {
    // Bypass limit in development mode
    if (process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true') {
      return true
    }
    return usageToday < FREE_TIER_LIMIT
  }

  const getRemainingGenerations = () => {
    // Show unlimited in development mode
    if (process.env.NEXT_PUBLIC_BYPASS_USAGE_LIMIT === 'true') {
      return 999
    }
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
    freeTierLimit: FREE_TIER_LIMIT
  }
}