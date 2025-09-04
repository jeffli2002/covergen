'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/services/payment/creem'

interface PlanSelectorProps {
  currentPlan?: string
  onSelectPlan: (planId: string) => void
  loading?: boolean
  compact?: boolean
}

export default function PlanSelector({ 
  currentPlan = 'free', 
  onSelectPlan, 
  loading = false,
  compact = false 
}: PlanSelectorProps) {
  const plans = [
    {
      ...SUBSCRIPTION_PLANS.free,
      icon: Sparkles,
      popular: false,
      color: 'gray'
    },
    {
      ...SUBSCRIPTION_PLANS.pro,
      icon: Zap,
      popular: true,
      color: 'orange'
    },
    {
      ...SUBSCRIPTION_PLANS.pro_plus,
      icon: Crown,
      popular: false,
      color: 'purple'
    }
  ]

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = currentPlan === plan.id
          
          return (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                isCurrentPlan ? 'ring-2 ring-orange-500' : 'hover:shadow-lg'
              }`}
              onClick={() => !isCurrentPlan && onSelectPlan(plan.id)}
            >
              <CardHeader className="text-center pb-2">
                <Icon className={`w-6 h-6 mx-auto mb-2 text-${plan.color}-500`} />
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${plan.price / 100}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-gray-600 mb-2">
                  {plan.credits || 10} credits/month
                </p>
                {isCurrentPlan && (
                  <Badge className="w-full justify-center">Current</Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const Icon = plan.icon
        const isCurrentPlan = currentPlan === plan.id
        
        return (
          <Card 
            key={plan.id}
            className={`relative transition-all ${
              plan.popular ? 'border-orange-500 shadow-xl scale-105' : ''
            } ${isCurrentPlan ? 'ring-2 ring-orange-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <Icon className={`w-8 h-8 mx-auto mb-4 text-${plan.color}-500`} />
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold mt-2">
                ${plan.price / 100}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              <CardDescription>
                {plan.credits || 10} credits per month
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : ''
                }`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={loading || isCurrentPlan || plan.id === 'free'}
                onClick={() => onSelectPlan(plan.id)}
              >
                {isCurrentPlan 
                  ? 'Current Plan' 
                  : plan.id === 'free' 
                  ? 'Free Plan' 
                  : 'Select Plan'
                }
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}