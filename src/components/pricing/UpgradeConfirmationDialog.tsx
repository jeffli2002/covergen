'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight, 
  Check, 
  Crown, 
  Info, 
  Sparkles, 
  TrendingUp, 
  Zap,
  CreditCard
} from 'lucide-react'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface UpgradeConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  currentTier: 'free' | 'pro' | 'pro_plus'
  targetTier: 'pro' | 'pro_plus'
  currentBillingCycle?: 'monthly' | 'yearly'
  targetBillingCycle: 'monthly' | 'yearly'
  isUpgrading?: boolean
}

export function UpgradeConfirmationDialog({
  open,
  onClose,
  onConfirm,
  currentTier,
  targetTier,
  currentBillingCycle = 'monthly',
  targetBillingCycle,
  isUpgrading = false,
}: UpgradeConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      // Don't reset loading state here - parent component will close dialog
      // and handle redirect after successful upgrade
    }
  }

  // Get plan details
  const currentPlan = PRICING_CONFIG.plans.find(p => p.id === currentTier)
  const targetPlan = PRICING_CONFIG.plans.find(p => p.id === targetTier)

  if (!currentPlan || !targetPlan) return null

  // Calculate pricing details
  const currentPrice = currentBillingCycle === 'yearly' 
    ? currentPlan.price.yearly 
    : currentPlan.price.monthly
  const targetPrice = targetBillingCycle === 'yearly' 
    ? targetPlan.price.yearly 
    : targetPlan.price.monthly
  
  const currentCredits = currentBillingCycle === 'yearly'
    ? currentPlan.credits.yearly
    : currentPlan.credits.monthly

  const targetCredits = targetBillingCycle === 'yearly'
    ? targetPlan.credits.yearly
    : targetPlan.credits.monthly

  const currentMonthlyPrice = currentBillingCycle === 'yearly'
    ? (currentPrice / 12).toFixed(2)
    : currentPrice.toFixed(2)

  const targetMonthlyPrice = targetBillingCycle === 'yearly'
    ? (targetPrice / 12).toFixed(2)
    : targetPrice.toFixed(2)

  // Check if this is a tier upgrade vs billing cycle change
  const isTierUpgrade = currentTier !== targetTier
  const isBillingCycleChange = currentBillingCycle !== targetBillingCycle
  const isBothChanging = isTierUpgrade && isBillingCycleChange

  // Calculate savings for yearly plans
  const yearlySavings = targetBillingCycle === 'yearly'
    ? ((targetPlan.price.monthly * 12) - targetPlan.price.yearly).toFixed(2)
    : null

  // Plan icons
  const currentIcon = currentTier === 'free' ? Sparkles : currentTier === 'pro' ? Zap : Crown
  const targetIcon = targetTier === 'pro' ? Zap : Crown

  const CurrentIcon = currentIcon
  const TargetIcon = targetIcon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <DialogTitle className="text-2xl">
              {isBothChanging 
                ? 'Confirm Plan Upgrade & Billing Change'
                : isTierUpgrade 
                ? 'Confirm Plan Upgrade' 
                : 'Confirm Billing Change'}
            </DialogTitle>
          </div>
          <DialogDescription>
            Review your subscription changes before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current vs New Plan Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Plan */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <CurrentIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Current Plan</p>
                  <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${currentMonthlyPrice}
                    <span className="text-sm font-normal text-gray-600">/mo</span>
                  </span>
                </div>
                {currentBillingCycle === 'yearly' && (
                  <p className="text-xs text-gray-500">
                    ${currentPrice.toFixed(2)} billed annually
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200">
                <Badge className="bg-blue-100 text-blue-800">
                  {currentCredits.toLocaleString()} credits
                  {currentBillingCycle === 'yearly' ? '/year' : '/month'}
                </Badge>
              </div>
            </div>

            {/* New Plan */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-500 relative">
              <div className="absolute -top-3 right-4">
                <Badge className="bg-orange-500 text-white px-3 py-1 shadow-lg">
                  New Plan
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-orange-100">
                  <TargetIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-orange-700 uppercase font-medium">Upgrading To</p>
                  <h3 className="text-lg font-semibold text-gray-900">{targetPlan.name}</h3>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-700">Price:</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${targetMonthlyPrice}
                    <span className="text-sm font-normal text-gray-700">/mo</span>
                  </span>
                </div>
                {targetBillingCycle === 'yearly' && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700">
                      ${targetPrice.toFixed(2)} billed annually
                    </p>
                    {yearlySavings && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Save ${yearlySavings}/year vs monthly
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-orange-200">
                <Badge className="bg-orange-100 text-orange-800">
                  {targetCredits.toLocaleString()} credits
                  {targetBillingCycle === 'yearly' ? '/year' : '/month'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Credit Increase Highlight */}
          {targetCredits > currentCredits && (
            <Alert className="border-green-200 bg-green-50">
              <Sparkles className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-semibold">
                  +{(targetCredits - currentCredits).toLocaleString()} more credits{' '}
                  {targetBillingCycle === 'yearly' ? 'per year' : 'per month'}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* What You Get */}
          {isTierUpgrade && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                New Features & Benefits
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {targetTier === 'pro_plus' && currentTier === 'pro' && (
                  <>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>2x credits</strong> for maximum generation capacity
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Sora 2 Pro quality</strong> videos at higher resolution
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Dedicated support</strong> with priority response
                      </span>
                    </div>
                  </>
                )}
                {targetTier === 'pro' && currentTier === 'free' && (
                  <>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Unlimited daily generations</strong> with 800 credits/month
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Sora 2 video generation</strong> access
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Commercial usage rights</strong> for all content
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Important Information */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Prorated billing applies. Changes take effect immediately. Cancel anytime.
            </AlertDescription>
          </Alert>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600">New plan price:</span>
                <span className="text-lg font-semibold text-gray-900">
                  ${targetPrice.toFixed(2)}
                  <span className="text-sm font-normal text-gray-600">
                    {targetBillingCycle === 'yearly' ? '/year' : '/month'}
                  </span>
                </span>
              </div>
              {targetBillingCycle === 'yearly' && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-gray-500">Equivalent monthly:</span>
                  <span className="text-sm text-gray-700">
                    ${targetMonthlyPrice}/mo
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Prorated charges will be calculated based on your current billing cycle
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white min-w-[160px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Confirm Upgrade
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
