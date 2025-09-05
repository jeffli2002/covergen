'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRateLimit } from '@/hooks/useRateLimit'
import { useAuth } from '@/contexts/AuthContext'
import { RateLimitModal, PlatformRestrictedModal } from '@/components/rate-limit-modal'
import { UsageIndicator, CompactUsageIndicator } from '@/components/usage-indicator'
import { FREE_TIER_LIMITS } from '@/lib/rate-limit'

interface PlatformRateLimitWrapperProps {
  children: React.ReactNode
  platform: string
  onGenerate?: () => Promise<void>
  showUsageIndicator?: boolean
}

export function PlatformRateLimitWrapper({
  children,
  platform,
  onGenerate,
  showUsageIndicator = true,
}: PlatformRateLimitWrapperProps) {
  const { user } = useAuth()
  const {
    remainingCovers,
    hasReachedLimit,
    canAccessPlatform,
    incrementUsage,
    anonymousId,
  } = useRateLimit()
  
  const [showRateLimitModal, setShowRateLimitModal] = useState(false)
  const [showPlatformModal, setShowPlatformModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const router = useRouter()
  
  // Check platform access on mount
  useEffect(() => {
    if (!canAccessPlatform(platform)) {
      setShowPlatformModal(true)
    }
  }, [platform, canAccessPlatform])
  
  // Handle generation with rate limiting
  const handleGenerate = async () => {
    // Check if platform is allowed
    if (!canAccessPlatform(platform)) {
      setShowPlatformModal(true)
      return
    }
    
    // Check rate limit for anonymous users
    if (!user) {
      if (hasReachedLimit) {
        setShowRateLimitModal(true)
        return
      }
      
      // Show warning if getting close to limit
      if (remainingCovers <= 3 && remainingCovers > 0) {
        setShowRateLimitModal(true)
      }
    }
    
    // Proceed with generation
    if (onGenerate) {
      setIsGenerating(true)
      try {
        await onGenerate()
        // Increment usage after successful generation
        await incrementUsage()
        
        // If user just hit the limit, show modal
        if (remainingCovers === 1) {
          setShowRateLimitModal(true)
        }
      } finally {
        setIsGenerating(false)
      }
    }
  }
  
  // Calculate usage for display
  const usedCovers = user
    ? 0 // We don't track authenticated user usage here
    : (FREE_TIER_LIMITS.MONTHLY_COVERS - remainingCovers)
    
  const totalCovers = FREE_TIER_LIMITS.MONTHLY_COVERS
  
  return (
    <>
      {/* Usage Indicator */}
      {showUsageIndicator && !user && (
        <div className="mb-6">
          <UsageIndicator
            usedCovers={usedCovers}
            totalCovers={totalCovers}
            isAnonymous={!user}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          onGenerate: handleGenerate,
          isGenerating,
          disabled: !canAccessPlatform(platform) || (hasReachedLimit && !user),
        })}
      </div>
      
      {/* Compact usage indicator in corner */}
      {!user && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-40">
          <CompactUsageIndicator
            usedCovers={usedCovers}
            totalCovers={totalCovers}
          />
        </div>
      )}
      
      {/* Modals */}
      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        remainingCovers={remainingCovers}
        isSignedIn={!!user}
      />
      
      <PlatformRestrictedModal
        isOpen={showPlatformModal}
        onClose={() => {
          setShowPlatformModal(false)
          // Redirect to platforms page if they can't access this one
          router.push('/platforms')
        }}
        platformName={platform}
      />
    </>
  )
}