'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { AlertTriangle, Zap, Crown, Clock, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FREE_TIER_LIMITS } from '@/lib/rate-limit'

interface RateLimitModalProps {
  isOpen: boolean
  onClose: () => void
  limitType?: 'daily' | 'monthly'
  dailyLimit?: number
  dailyUsed?: number
  monthlyLimit?: number
  monthlyUsed?: number
  resetTime?: Date
  isTrialing?: boolean
  tier?: 'free' | 'pro' | 'pro_plus'
}

export function RateLimitModal({ 
  isOpen, 
  onClose, 
  limitType = 'monthly',
  dailyLimit,
  dailyUsed,
  monthlyLimit,
  monthlyUsed,
  resetTime,
  isTrialing = false,
  tier = 'free'
}: RateLimitModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')
  
  // Calculate remaining covers
  const dailyRemaining = dailyLimit && dailyUsed !== undefined ? Math.max(0, dailyLimit - dailyUsed) : 0
  const monthlyRemaining = monthlyLimit && monthlyUsed !== undefined ? Math.max(0, monthlyLimit - monthlyUsed) : 0
  
  useEffect(() => {
    if (!resetTime) return

    const updateTimer = () => {
      const now = new Date()
      const diff = resetTime.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeUntilReset('Now!')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`)
      } else {
        setTimeUntilReset(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [resetTime])

  const handleUpgrade = async () => {
    if (isTrialing) {
      // Convert trial to paid subscription
      try {
        const response = await fetch('/api/payment/convert-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl
          }
        }
      } catch (error) {
        console.error('Failed to convert trial:', error)
        router.push('/payment')
      }
    } else {
      router.push('/payment')
    }
    onClose()
  }
  
  const getModalContent = () => {
    // Daily limit reached
    if (limitType === 'daily' && dailyRemaining === 0) {
      if (tier === 'free') {
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          title: 'Daily Limit Reached',
          description: (
            <>
              <p>You've used all <strong>{dailyLimit}</strong> of your daily free covers.</p>
              {timeUntilReset && (
                <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg mt-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Daily limit resets in: <strong>{timeUntilReset}</strong></span>
                </div>
              )}
              <p className="mt-3">Upgrade to Pro for unlimited daily covers!</p>
            </>
          ),
          primaryAction: 'Upgrade to Pro',
          secondaryAction: 'Try tomorrow'
        }
      } else if (isTrialing) {
        const planName = tier === 'pro' ? 'Pro' : 'Pro+'
        return {
          icon: <Sparkles className="h-6 w-6 text-purple-500" />,
          title: 'Trial Daily Limit Reached',
          description: (
            <>
              <p>You've used all <strong>{dailyLimit}</strong> of your daily trial covers.</p>
              {timeUntilReset && (
                <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg mt-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Daily limit resets in: <strong>{timeUntilReset}</strong></span>
                </div>
              )}
              <p className="mt-3">Start your {planName} subscription now to remove all daily limits!</p>
              <p className="text-sm text-gray-500 mt-1">No more waiting - create covers whenever you need them.</p>
            </>
          ),
          primaryAction: 'Start Subscription',
          secondaryAction: 'Try tomorrow'
        }
      }
    }
    
    // Monthly limit reached (legacy behavior)
    if (monthlyRemaining === 0) {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        title: 'Monthly Limit Reached',
        description: (
          <>
            <p>You've used all {monthlyLimit} free covers this month.</p>
            <p className="mt-2">
              {user 
                ? 'Upgrade to Pro to continue creating covers and unlock all platforms!'
                : 'Sign in or create an account to continue, or upgrade to Pro for unlimited access!'
              }
            </p>
          </>
        ),
        primaryAction: 'Upgrade to Pro',
        secondaryAction: user ? null : 'Sign In to Continue'
      }
    }
    
    // Still have covers remaining
    return {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
      title: `${dailyRemaining || monthlyRemaining} Covers Remaining`,
      description: (
        <>
          <p>You have <strong>{dailyRemaining || monthlyRemaining}</strong> {limitType === 'daily' ? 'daily' : 'monthly'} covers remaining.</p>
          <p className="mt-2">Free users get {dailyLimit || monthlyLimit} covers per {limitType === 'daily' ? 'day' : 'month'}.</p>
        </>
      ),
      primaryAction: 'Upgrade to Pro',
      secondaryAction: 'Continue with Free'
    }
  }
  
  const content = getModalContent()
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {content.icon}
            <DialogTitle>{content.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-4">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-col space-y-2">
          {!user && content.secondaryAction === 'Sign In to Continue' && (
            <Link href="/sign-in" className="w-full">
              <Button className="w-full" variant="default">
                Sign In to Continue
              </Button>
            </Link>
          )}
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            {content.primaryAction}
          </Button>
          
          {content.secondaryAction && content.secondaryAction !== 'Sign In to Continue' && (
            <Button variant="outline" onClick={onClose} className="w-full">
              {content.secondaryAction}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PlatformRestrictedModalProps {
  isOpen: boolean
  onClose: () => void
  platformName: string
}

export function PlatformRestrictedModal({
  isOpen,
  onClose,
  platformName,
}: PlatformRestrictedModalProps) {
  const { user } = useAuth()
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-purple-500" />
            <DialogTitle>Premium Platform</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-4">
            <p>
              <strong>{platformName}</strong> is a premium platform available only to Pro and Pro+ subscribers.
            </p>
            <p className="mt-3">Free users have access to:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>YouTube</li>
              <li>Instagram</li>
              <li>TikTok</li>
              <li>Spotify</li>
              <li>WeChat</li>
            </ul>
            <p className="mt-3">
              Upgrade to Pro to unlock all platforms and create unlimited covers!
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-col space-y-2">
          <Link href="/pricing" className="w-full">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              variant="default"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
          
          <Button variant="outline" onClick={onClose} className="w-full">
            Back to Platforms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}