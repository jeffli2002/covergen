'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'

interface PaymentCancelClientProps {
  locale: string
}

export default function PaymentCancelClient({ locale }: PaymentCancelClientProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12">
      <div className="container max-w-lg mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            
            <CardTitle className="text-2xl mb-2">
              Payment Cancelled
            </CardTitle>
            
            <CardDescription>
              Your payment was cancelled and no charges were made.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">
                Don't worry! You can continue using the free plan or try upgrading again anytime.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Free Plan Includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 10 covers per month</li>
                  <li>• No watermarks</li>
                  <li>• Basic platform sizes</li>
                  <li>• Email support</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={() => router.push(`/${locale}/payment`)}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push(`/${locale}`)}
                className="w-full"
              >
                Continue with Free Plan
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Having trouble? We're here to help!
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('mailto:support@covergen.ai', '_blank')}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}