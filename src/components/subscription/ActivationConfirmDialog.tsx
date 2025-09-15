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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, CheckCircle, XCircle, Info, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface ActivationConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  planName: string
  planPrice: number
  planFeatures: string[]
  isActivating?: boolean
}

export default function ActivationConfirmDialog({
  open,
  onClose,
  onConfirm,
  planName,
  planPrice,
  planFeatures,
  isActivating = false
}: ActivationConfirmDialogProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const config = getClientSubscriptionConfig()
  
  const handleConfirm = () => {
    if (!agreedToTerms) return
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-5 h-5 text-orange-500" />
            Activate {planName} Subscription
          </DialogTitle>
          <DialogDescription>
            Review your subscription details before activation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subscription Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan</span>
              <span className="font-semibold">{planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Price</span>
              <span className="font-semibold">${planPrice}/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Billing</span>
              <span className="text-sm text-gray-600">Starts immediately</span>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">What's included:</h4>
            <ul className="space-y-1">
              {planFeatures.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Notices */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <ul className="space-y-1 text-sm">
                <li>• Your trial will end immediately and billing will begin</li>
                <li>• You can cancel anytime from your account page</li>
                <li>• No refunds for partial months</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Payment Method */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CreditCard className="w-4 h-4" />
            <span>Your saved payment method will be charged</span>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer select-none"
            >
              I agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              . I understand that my subscription will begin immediately and I will be charged ${planPrice}/month.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isActivating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!agreedToTerms || isActivating}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          >
            {isActivating ? (
              <>Processing...</>
            ) : (
              <>Activate {planName} Now</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}