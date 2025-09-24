'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Lock, Sparkles, Crown } from 'lucide-react'
import { useUpgradeButton } from '@/hooks/useCheckoutSession'
import { cn } from '@/lib/utils'

interface ProtectedUpgradeButtonProps {
  planId: 'pro' | 'pro_plus'
  className?: string
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  children?: React.ReactNode
  successUrl?: string
  cancelUrl?: string
  showIcon?: boolean
}

export function ProtectedUpgradeButton({
  planId,
  className,
  size = 'default',
  variant = 'default',
  children,
  showIcon = true
}: ProtectedUpgradeButtonProps) {
  const { handleUpgrade, isDisabled, isLoading, cleanup } = useUpgradeButton(planId)

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />
    }
    if (isDisabled && !isLoading) {
      return <Lock className="w-4 h-4" />
    }
    if (showIcon) {
      return planId === 'pro_plus' ? (
        <Crown className="w-4 h-4" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )
    }
    return null
  }

  const getButtonText = () => {
    if (isLoading) {
      return 'Creating checkout...'
    }
    if (children) {
      return children
    }
    return planId === 'pro_plus' ? 'Upgrade to Pro+' : 'Upgrade to Pro'
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isDisabled}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isDisabled && 'cursor-not-allowed opacity-75',
        className
      )}
      size={size}
      variant={variant}
    >
      <span className="flex items-center gap-2">
        {getIcon()}
        {getButtonText()}
      </span>
      {/* Loading shimmer effect */}
      {isLoading && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </Button>
  )
}

// Utility component for displaying checkout session errors
export function CheckoutSessionError({ error }: { error: string | null }) {
  if (!error) return null

  const getErrorMessage = () => {
    if (error.includes('active checkout session')) {
      return 'You have an active checkout session. Please complete it or wait for it to expire.'
    }
    if (error.includes('Too many')) {
      return 'Too many checkout attempts. Please try again later.'
    }
    return error
  }

  const getErrorType = () => {
    if (error.includes('active checkout session')) {
      return 'warning'
    }
    if (error.includes('Too many')) {
      return 'rate-limit'
    }
    return 'error'
  }

  const type = getErrorType()

  return (
    <div
      className={cn(
        'mt-2 p-3 rounded-md text-sm',
        type === 'warning' && 'bg-yellow-50 text-yellow-800 border border-yellow-200',
        type === 'rate-limit' && 'bg-orange-50 text-orange-800 border border-orange-200',
        type === 'error' && 'bg-red-50 text-red-800 border border-red-200'
      )}
    >
      {getErrorMessage()}
    </div>
  )
}