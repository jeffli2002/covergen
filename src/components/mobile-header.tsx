'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, Menu, X, LogOut, Settings, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/auth/AuthForm'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">CoverGen AI</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex h-20 items-center justify-between px-4 border-b">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">CoverGen AI</h1>
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
                        Free Tier
                      </div>
                    </div>
                    <span className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Free
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
                    <Button variant="outline" className="flex-1 text-base">
                      <Settings className="w-5 h-5 mr-2" />
                      Settings
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