'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, Sparkles } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import { useRouter } from 'next/navigation'
import { PRICING_CONFIG } from '@/config/pricing.config'

interface CreditsPacksProps {
  locale?: string
}

export function CreditsPacks({ locale = 'en' }: CreditsPacksProps) {
  const { user } = useBestAuth()
  const router = useRouter()
  const [processingPack, setProcessingPack] = useState<string | null>(null)

  const handlePurchasePack = async (packId: string) => {
    if (!user) {
      router.push(`/sign-in?redirect=/pricing&pack=${packId}`)
      return
    }

    setProcessingPack(packId)
    try {
      // Call the points purchase API
      const response = await fetch('/api/points/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ packId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Creem checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error purchasing credits pack:', error)
      alert('Failed to purchase credits. Please try again.')
    } finally {
      setProcessingPack(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto mb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coins className="w-8 h-8 text-orange-500" />
          <h2 className="text-3xl font-bold text-gray-900">Credits Packs</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Need more credits? Purchase one-time credit packs that never expire. Perfect for occasional extra usage.
        </p>
      </div>

      {/* Horizontal Pack Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_CONFIG.creditsPacks.map((pack) => {
          const totalCredits = pack.points + pack.bonus
          const costPerCredit = (pack.price / totalCredits).toFixed(3)

          return (
            <Card
              key={pack.id}
              className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pack.popular ? 'border-orange-400 ring-2 ring-orange-200' : 'border-gray-200'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                  </div>
                </div>

                <CardTitle className="text-xl text-gray-900">
                  {pack.points.toLocaleString()} Credits
                </CardTitle>

                {pack.bonus > 0 && (
                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs mx-auto mt-2">
                    +{pack.bonus} Bonus
                  </Badge>
                )}

                <div className="mt-3">
                  <div className="text-3xl font-bold text-gray-900">
                    ${pack.price.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ${costPerCredit}/credit
                  </p>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-4 p-3 bg-gray-50 rounded-lg space-y-1.5">
                  <p className="text-xs font-medium text-gray-700">You can create:</p>
                  <p className="text-xs text-gray-600">
                    • {Math.floor(totalCredits / PRICING_CONFIG.generationCosts.nanoBananaImage)} images
                  </p>
                  <p className="text-xs text-gray-600">
                    • {Math.floor(totalCredits / PRICING_CONFIG.generationCosts.sora2Video)} videos
                  </p>
                  <p className="text-xs text-gray-600">
                    • {Math.floor(totalCredits / PRICING_CONFIG.generationCosts.sora2ProVideo)} Pro videos
                  </p>
                </div>

                <Button
                  className={`w-full ${
                    pack.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="sm"
                  disabled={processingPack === pack.id}
                  onClick={() => handlePurchasePack(pack.id)}
                >
                  {processingPack === pack.id ? 'Processing...' : 'Buy Now'}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-2">
                  Credits never expire
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How Credits Work</p>
            <p className="text-blue-800">
              Credits purchased through one-time packs <strong>never expire</strong> and can be used anytime. 
              Subscription credits refresh monthly. All credits can be used for any generation type.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
