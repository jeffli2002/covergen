'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Coins, TrendingUp, TrendingDown, Plus, ExternalLink } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { PRICING_CONFIG } from '@/config/pricing.config'
import Link from 'next/link'

interface PointsBalanceProps {
  variant?: 'header' | 'dashboard' | 'compact'
  showDetails?: boolean
}

export function PointsBalance({ variant = 'header', showDetails = false }: PointsBalanceProps) {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<string>('free')

  useEffect(() => {
    fetchBalance()
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/points/balance', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
        setTier(data.tier || 'free')
      } else {
        setBalance(null)
      }
    } catch (error) {
      console.error('Error fetching points balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = () => {
    router.push('/pricing#credits-packs')
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (balance === null) {
    return null
  }

  const isLowBalance = balance < 20
  const getBalanceColor = () => {
    if (balance === 0) return 'text-red-600'
    if (isLowBalance) return 'text-orange-600'
    return 'text-green-600'
  }

  // Compact variant for header
  if (variant === 'compact' || variant === 'header') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-gray-100"
            size="sm"
          >
            <Coins className={`w-4 h-4 ${getBalanceColor()}`} />
            <span className={`font-semibold ${getBalanceColor()}`}>
              {balance.toLocaleString()}
            </span>
            {isLowBalance && balance > 0 && (
              <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">
                Low
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Credits Balance</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getBalanceColor()}`}>
                  {balance.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
              {tier !== 'free' && (
                <p className="text-xs text-gray-500 mt-1">
                  {tier === 'pro' ? 'Pro Plan' : 'Pro+ Plan'}
                </p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
              <p className="font-medium text-gray-700">You can create:</p>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>• Nano Banana Images</span>
                  <span className="font-semibold">
                    {Math.floor(balance / PRICING_CONFIG.generationCosts.nanoBananaImage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Sora 2 Videos</span>
                  <span className="font-semibold">
                    {Math.floor(balance / PRICING_CONFIG.generationCosts.sora2Video)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>• Sora 2 Pro Videos</span>
                  <span className="font-semibold">
                    {Math.floor(balance / PRICING_CONFIG.generationCosts.sora2ProVideo)}
                  </span>
                </div>
              </div>
            </div>

            {isLowBalance && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 mb-2">
                  {balance === 0 ? 'You\'re out of credits!' : 'Running low on credits!'}
                </p>
                <Button
                  size="sm"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleBuyCredits}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Buy Credits
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/${locale}/account#usage`}>
                  View History
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
              {!isLowBalance && (
                <Button size="sm" className="flex-1" onClick={handleBuyCredits}>
                  <Plus className="w-4 h-4 mr-1" />
                  Buy More
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Dashboard variant - larger display
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Credits Balance</h3>
          <p className="text-sm text-gray-600">Available for generation</p>
        </div>
        <div className="p-2 bg-white rounded-lg">
          <Coins className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${getBalanceColor()}`}>
            {balance.toLocaleString()}
          </span>
          <span className="text-gray-500">credits</span>
        </div>
        {tier !== 'free' && (
          <Badge variant="outline" className="text-xs">
            {tier === 'pro' ? 'Pro Plan' : 'Pro+ Plan'}
          </Badge>
        )}
      </div>

      {showDetails && (
        <div className="mb-6 p-4 bg-white rounded-lg space-y-2">
          <p className="font-medium text-gray-700 text-sm mb-3">Generation Capacity</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nano Banana Images</span>
              <span className="font-semibold text-gray-900">
                {Math.floor(balance / PRICING_CONFIG.generationCosts.nanoBananaImage)} images
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sora 2 Videos</span>
              <span className="font-semibold text-gray-900">
                {Math.floor(balance / PRICING_CONFIG.generationCosts.sora2Video)} videos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sora 2 Pro Videos</span>
              <span className="font-semibold text-gray-900">
                {Math.floor(balance / PRICING_CONFIG.generationCosts.sora2ProVideo)} videos
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          asChild
        >
          <Link href={`/${locale}/account#usage`}>
            View History
          </Link>
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          onClick={handleBuyCredits}
        >
          <Plus className="w-4 h-4 mr-1" />
          Buy Credits
        </Button>
      </div>

      {isLowBalance && (
        <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <p className="text-sm text-orange-900">
            {balance === 0
              ? '⚠️ You\'re out of credits! Purchase more to continue creating.'
              : '⚠️ Running low on credits. Consider buying more or upgrading your plan.'}
          </p>
        </div>
      )}
    </div>
  )
}
