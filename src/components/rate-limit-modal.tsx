'use client'

import React from 'react'
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
import { AlertTriangle, Zap, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FREE_TIER_LIMITS } from '@/lib/rate-limit'

interface RateLimitModalProps {
  isOpen: boolean
  onClose: () => void
  remainingCovers?: number
  isSignedIn?: boolean
}

export function RateLimitModal({ 
  isOpen, 
  onClose, 
  remainingCovers = 0,
  isSignedIn = false 
}: RateLimitModalProps) {
  const { user } = useAuth()
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <DialogTitle>
              {remainingCovers > 0 
                ? `${remainingCovers} Free Covers Remaining`
                : 'Free Limit Reached'
              }
            </DialogTitle>
          </div>
          <DialogDescription className="text-left pt-4">
            {remainingCovers > 0 ? (
              <div>
                <p>You have <strong>{remainingCovers}</strong> free covers remaining this month.</p>
                <p className="mt-2">Free users get {FREE_TIER_LIMITS.MONTHLY_COVERS} covers per month and access to these platforms:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>YouTube</li>
                  <li>Instagram</li>
                  <li>TikTok</li>
                  <li>Spotify</li>
                  <li>WeChat</li>
                </ul>
              </div>
            ) : (
              <div>
                <p>You've used all {FREE_TIER_LIMITS.MONTHLY_COVERS} free covers this month.</p>
                <p className="mt-2">
                  {user 
                    ? 'Upgrade to Pro to continue creating covers and unlock all platforms!'
                    : 'Sign in or create an account to continue, or upgrade to Pro for unlimited access!'
                  }
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-col space-y-2">
          {!user && (
            <Link href="/sign-in" className="w-full">
              <Button className="w-full" variant="default">
                Sign In to Continue
              </Button>
            </Link>
          )}
          
          <Link href="/pricing" className="w-full">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              variant="default"
            >
              <Zap className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
          
          {remainingCovers > 0 && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Continue with Free
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