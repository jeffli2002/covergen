'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/AuthForm'

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out our AI cover generator',
    icon: Sparkles,
    features: [
      '10 covers per month',
      '3 covers per day max',
      'No watermark',
      'All platform sizes',
      'Email support',
      'Personal use only'
    ],
    limitations: [
      'Daily limit: 3 covers',
      'Monthly limit: 10 covers',
      'No commercial usage'
    ],
    cta: 'Get Started',
    popular: false,
    badge: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'Ideal for regular content creators',
    icon: Zap,
    features: [
      '120 covers per month',
      'No daily limit',
      'No watermark',
      'All platform sizes',
      'Priority support',
      'Commercial usage rights',
      '24-hour download history'
    ],
    limitations: [],
    cta: 'Start 7-Day Trial',
    popular: true,
    badge: '7-Day Trial (First-Time Only)'
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: '$19',
    period: 'per month',
    description: 'For professional creators and teams',
    icon: Crown,
    features: [
      '300 covers per month',
      'No daily limit',
      'No watermark',
      'Full commercial license',
      'Custom brand templates',
      'API access',
      'Dedicated support',
      '7-day cloud gallery'
    ],
    limitations: [],
    cta: 'Start 7-Day Trial',
    popular: false,
    badge: '7-Day Trial (First-Time Only)'
  }
]

interface PricingSectionProps {
  locale?: string
}

const PENDING_PLAN_KEY = 'covergen_pending_plan'

export default function PricingSection({ locale = 'en' }: PricingSectionProps = {}) {
  const { user } = useAppStore()
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  
  // Check for pending plan on mount and after auth
  useEffect(() => {
    if (authUser) {
      const storedPlan = localStorage.getItem(PENDING_PLAN_KEY)
      if (storedPlan && storedPlan !== 'free') {
        console.log('[PricingSection] Found pending plan after auth:', storedPlan)
        localStorage.removeItem(PENDING_PLAN_KEY)
        // Redirect to payment page with the plan
        router.push(`/${locale}/payment?plan=${storedPlan}`)
      }
    }
  }, [authUser, router, locale])

  const handleSubscribe = (tierKey: string) => {
    // For free tier, just navigate to generator
    if (tierKey === 'free') {
      const generatorSection = document.getElementById('generator')
      if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: 'smooth' })
      } else if (window.location.pathname !== '/') {
        window.location.href = '/#generator'
      }
      return
    }

    // For paid tiers, check authentication
    if (!authUser) {
      // Store the plan they want to subscribe to
      setPendingPlan(tierKey)
      // Also store in localStorage for OAuth flow
      localStorage.setItem(PENDING_PLAN_KEY, tierKey)
      // Show sign-in modal
      setShowAuthModal(true)
      return
    }

    // If authenticated, navigate to payment page
    router.push(`/${locale}/payment?plan=${tierKey}`)
  }

  const handleAuthSuccess = (authenticatedUser: any) => {
    console.log('[PricingSection] Auth success, pending plan:', pendingPlan)
    setShowAuthModal(false)
    
    // After successful sign-in, redirect to payment with the pending plan
    if (pendingPlan && pendingPlan !== 'free') {
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        console.log('[PricingSection] Redirecting to payment page for plan:', pendingPlan)
        router.push(`/${locale}/payment?plan=${pendingPlan}`)
        setPendingPlan(null)
      }, 100)
    }
  }

  return (
    <>
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free or try Pro plans with a 7-day trial. All images are watermark-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-4">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const isCurrentTier = user?.subscription?.tier === tier.id
            
            return (
              <Card 
                key={tier.id} 
                className={`relative transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                  tier.popular ? 'border-orange-500 shadow-xl scale-105' : 'border-gray-200'
                } ${isCurrentTier ? 'ring-2 ring-orange-500' : ''} bg-white hover:shadow-2xl`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {tier.badge && !tier.popular && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                      tier.popular ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl text-gray-900">{tier.name}</CardTitle>
                  
                  <div className="text-3xl font-bold text-gray-900">
                    {tier.price}
                    <span className="text-sm font-normal text-gray-500">
                      /{tier.period}
                    </span>
                  </div>
                  
                  
                  <CardDescription className="text-base text-gray-600">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">Features included:</h4>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {tier.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-500 text-sm">Limitations:</h4>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="text-sm text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Button */}
                  {tier.id === 'free' ? (
                    <Button 
                      className="w-full transition-all duration-300 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                      variant="outline"
                      disabled={isCurrentTier}
                      onClick={() => handleSubscribe(tier.id)}
                    >
                      {isCurrentTier ? 'Current Plan' : tier.cta}
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full transition-all duration-300 ${
                        tier.popular 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-lg' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                      disabled={isCurrentTier}
                      onClick={() => handleSubscribe(tier.id)}
                    >
                      {isCurrentTier ? 'Current Plan' : tier.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-gray-600">
            All plans include watermark-free images for professional use.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <span>✓ Cancel anytime</span>
            <span>✓ No setup fees</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      </div>
    </section>

    {/* Auth Modal */}
    {showAuthModal && (
      <AuthForm 
        onClose={() => {
          setShowAuthModal(false)
          setPendingPlan(null)
          // Clear pending plan from localStorage on close
          localStorage.removeItem(PENDING_PLAN_KEY)
        }}
        onAuthSuccess={handleAuthSuccess}
      />
    )}
    </>
  )
}