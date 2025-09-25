'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Zap, Info } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FREE_TIER_LIMITS } from '@/lib/rate-limit'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface UsageIndicatorProps {
  usedCovers: number
  totalCovers: number
  isAnonymous?: boolean
  className?: string
}

export function UsageIndicator({
  usedCovers,
  totalCovers,
  isAnonymous = true,
  className = '',
}: UsageIndicatorProps) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const percentage = (usedCovers / totalCovers) * 100
  const remaining = totalCovers - usedCovers
  
  // Color based on usage
  let progressColor = 'bg-green-500'
  if (percentage > 70) progressColor = 'bg-yellow-500'
  if (percentage >= 100) progressColor = 'bg-red-500'
  
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAnonymous ? 'Free Usage' : 'Monthly Usage'}
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {isAnonymous 
                    ? `Anonymous users get ${getClientSubscriptionConfig().limits.free.monthly} free covers per month. Sign in to track usage across devices!`
                    : 'Your monthly usage resets at the beginning of each calendar month.'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isAnonymous && (
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {usedCovers} / {totalCovers} covers used
          </span>
          <span className={`font-medium ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
          </span>
        </div>
        
        <Progress 
          value={Math.min(percentage, 100)} 
          className="h-2"
          indicatorClassName={progressColor}
        />
        
        {percentage >= 80 && percentage < 100 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
            You're running low on free covers. Consider upgrading to Pro!
          </p>
        )}
        
        {percentage >= 100 && (
          <div className="mt-3">
            <Link href={`/${locale}/pricing`} className="w-full">
              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

interface CompactUsageIndicatorProps {
  usedCovers: number
  totalCovers: number
  className?: string
}

export function CompactUsageIndicator({
  usedCovers,
  totalCovers,
  className = '',
}: CompactUsageIndicatorProps) {
  const percentage = (usedCovers / totalCovers) * 100
  const remaining = totalCovers - usedCovers
  
  let textColor = 'text-green-600'
  if (percentage > 70) textColor = 'text-yellow-600'
  if (percentage >= 100) textColor = 'text-red-600'
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`text-sm font-medium ${textColor}`}>
        {remaining > 0 ? `${remaining} free covers left` : 'Free limit reached'}
      </span>
      {percentage >= 100 && (
        <Link href={`/${locale}/pricing`}>
          <Button size="sm" variant="outline">
            <Zap className="h-3 w-3" />
          </Button>
        </Link>
      )}
    </div>
  )
}