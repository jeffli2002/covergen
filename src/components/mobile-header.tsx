'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, Menu, X, LogOut, Settings, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/auth/AuthForm'
import UsageDisplay from '@/components/usage-display'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    console.log('[MobileHeader] Signing out...')
    const result = await signOut()
    if (!result.success) {
      console.error('[MobileHeader] Sign out failed:', result.error)
    } else {
      console.log('[MobileHeader] Sign out successful')
      setIsMenuOpen(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setIsMenuOpen(false)
  }

  // Fetch subscription info when user is logged in
  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo()
    } else {
      setSubscriptionInfo(null)
    }
  }, [user])

  const fetchSubscriptionInfo = async () => {
    try {
      console.log('[MobileHeader] Fetching subscription info for user:', user?.email)
      const response = await fetch('/api/usage/status')
      if (response.ok) {
        const data = await response.json()
        console.log('[MobileHeader] Subscription info received:', data)
        setSubscriptionInfo(data)
      } else {
        console.error('[MobileHeader] Failed to fetch subscription info:', response.status)
      }
    } catch (error) {
      console.error('[MobileHeader] Failed to fetch subscription info:', error)
    }
  }

  // Format tier display
  const getTierDisplay = () => {
    if (!subscriptionInfo) return 'Free'
    
    const { subscription_tier, is_trial } = subscriptionInfo
    
    if (is_trial) {
      return subscription_tier === 'pro' ? 'Pro Trial' : 'Pro+ Trial'
    }
    
    switch (subscription_tier) {
      case 'pro':
        return 'Pro'
      case 'pro_plus':
        return 'Pro+'
      default:
        return 'Free'
    }
  }

  const getTierBadgeColor = () => {
    if (!subscriptionInfo) return 'bg-gray-100 text-gray-800'
    
    const { subscription_tier, is_trial } = subscriptionInfo
    
    if (is_trial) {
      return 'bg-blue-100 text-blue-800'
    }
    
    switch (subscription_tier) {
      case 'pro':
        return 'bg-orange-100 text-orange-800'
      case 'pro_plus':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between px-4">
          <h1 className="text-xl md:text-2xl font-bold text-primary">CoverGen Pro</h1>
          
          <div className="flex items-center gap-2">
            <UsageDisplay />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex h-20 items-center justify-between px-4 border-b">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">CoverGen Pro</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Navigation */}
            <nav className="space-y-2">
              <a 
                href="#generator" 
                className="block py-3 text-lg font-medium hover:text-primary"
                onClick={() => {
                  setIsMenuOpen(false)
                  const generatorSection = document.getElementById('generator')
                  if (generatorSection) {
                    generatorSection.scrollIntoView({ behavior: 'smooth' })
                  } else if (window.location.pathname !== '/') {
                    window.location.href = '/#generator'
                  }
                }}
              >
                Generate
              </a>
              <a href="#" className="block py-3 text-lg text-muted-foreground hover:text-primary">
                Gallery
              </a>
              <a href="#" className="block py-3 text-lg text-muted-foreground hover:text-primary">
                Templates
              </a>
            </nav>

            <div className="border-t pt-4">
              {user ? (
                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-medium">{user.email}</div>
                      <div className="text-base text-muted-foreground">
                        {getTierDisplay()} Tier
                      </div>
                    </div>
                    <span className={`px-3 py-2 rounded-full text-sm font-medium ${getTierBadgeColor()}`}>
                      {getTierDisplay()}
                    </span>
                  </div>

                  {/* Upgrade Button */}
                  <Button 
                    className="w-full text-lg" 
                    size="lg"
                    onClick={() => {
                      setIsMenuOpen(false)
                      const pricingSection = document.getElementById('pricing')
                      if (pricingSection) {
                        pricingSection.scrollIntoView({ behavior: 'smooth' })
                      } else if (window.location.pathname !== '/') {
                        window.location.href = '/#pricing'
                      }
                    }}
                  >
                    <Crown className="w-5 h-5 mr-3" />
                    Upgrade to Pro
                  </Button>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-base"
                      onClick={() => {
                        setIsMenuOpen(false)
                        // Use proper Next.js navigation with locale support
                        const currentLocale = window.location.pathname.split('/')[1] || 'en'
                        window.location.href = `/${currentLocale}/account`
                      }}
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      Account
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="flex-1 text-base">
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-lg" 
                    size="lg" 
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowAuthModal(true)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full text-lg" 
                    size="lg" 
                    onClick={() => {
                      setIsMenuOpen(false)
                      const generatorSection = document.getElementById('generator')
                      if (generatorSection) {
                        generatorSection.scrollIntoView({ behavior: 'smooth' })
                      } else if (window.location.pathname !== '/') {
                        window.location.href = '/#generator'
                      }
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}