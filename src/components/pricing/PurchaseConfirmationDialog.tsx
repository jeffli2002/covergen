'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Shield, Check, AlertCircle } from 'lucide-react'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface PurchaseConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  purchaseType: 'subscription' | 'credits'
  planId?: string
  packId?: string
  billingCycle?: 'monthly' | 'yearly'
  isTestMode?: boolean
}

export function PurchaseConfirmationDialog({
  open,
  onClose,
  onConfirm,
  purchaseType,
  planId,
  packId,
  billingCycle = 'monthly',
  isTestMode = false,
}: PurchaseConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  // Get purchase details
  const getPurchaseDetails = () => {
    if (purchaseType === 'subscription' && planId) {
      const plan = PRICING_CONFIG.plans.find(p => p.id === planId)
      if (!plan) return null

      const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly
      const credits = billingCycle === 'yearly' ? plan.credits.yearly : plan.credits.monthly

      return {
        name: `${plan.name} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`,
        description: plan.description,
        price,
        credits,
        billingText: billingCycle === 'yearly' 
          ? `Billed $${plan.price.yearly.toFixed(2)} annually`
          : `Billed $${plan.price.monthly.toFixed(2)} monthly`,
        savings: billingCycle === 'yearly' ? '20% savings vs monthly' : null,
      }
    }

    if (purchaseType === 'credits' && packId) {
      const pack = PRICING_CONFIG.creditsPacks.find(p => p.id === packId)
      if (!pack) return null

      return {
        name: `${pack.points.toLocaleString()} Credits Pack`,
        description: pack.bonus > 0 
          ? `Includes ${pack.bonus} bonus credits` 
          : 'One-time purchase',
        price: pack.price,
        credits: pack.points + pack.bonus,
        billingText: 'One-time payment',
        savings: null,
      }
    }

    return null
  }

  const details = getPurchaseDetails()
  if (!details) return null

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
          </div>
          {isTestMode && (
            <Badge variant="outline" className="w-fit border-orange-400 text-orange-600">
              Test Mode
            </Badge>
          )}
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4">
            {/* Test Mode Warning */}
            {isTestMode && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-1">Test Payment</p>
                  <p>Use test card: <code className="bg-white px-2 py-0.5 rounded">4242 4242 4242 4242</code></p>
                  <p className="text-xs mt-1">No real charges will be made in test mode</p>
                </div>
              </div>
            )}

            {/* Purchase Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{details.name}</h3>
                <p className="text-sm text-gray-600">{details.description}</p>
              </div>

              {details.credits > 0 && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {details.credits.toLocaleString()} credits
                  </Badge>
                  {details.savings && (
                    <Badge className="bg-green-100 text-green-800">
                      {details.savings}
                    </Badge>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600">Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      ${details.price.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{details.billingText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            {purchaseType === 'subscription' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">What you get:</p>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      {details.credits.toLocaleString()} credits 
                      {billingCycle === 'yearly' ? ' per year' : ' per month'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      Watermark-free content
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      Commercial usage rights
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">
                      Cancel anytime
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Credits Pack Info */}
            {purchaseType === 'credits' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Credits Never Expire</p>
                  <p>These credits can be used anytime and never expire. Perfect for occasional use!</p>
                </div>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-gray-500">
              By confirming, you agree to our{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/refund-policy" target="_blank" className="text-blue-600 hover:underline">
                Refund Policy
              </a>
              .
            </p>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
