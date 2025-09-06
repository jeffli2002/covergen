'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, LogOut, Sparkles, User, ChevronDown, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthForm from '@/components/auth/AuthForm'
import UserMenu from '@/components/auth/UserMenu'
import LanguageSwitcher from '@/components/language-switcher'
import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  locale: Locale
  translations: any
}

export default function Header({ locale, translations: t }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { user: storeUser } = useAppStore()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const currentTier = storeUser?.subscription?.tier || 'free'

  const handleLogout = async () => {
    console.log('[Header] Signing out...')
    const result = await signOut()
    if (!result.success) {
      console.error('[Header] Sign out failed:', result.error)
    } else {
      console.log('[Header] Sign out successful')
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    
    // Check if there's a pending plan from pricing section
    const pendingPlan = localStorage.getItem('covergen_pending_plan')
    if (pendingPlan && pendingPlan !== 'free') {
      console.log('[Header] Found pending plan after auth:', pendingPlan)
      localStorage.removeItem('covergen_pending_plan')
      // Redirect to payment page with the plan
      router.push(`/${locale}/payment?plan=${pendingPlan}`)
    }
  }

  return (
    <>
      <header className="hidden lg:block border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 relative z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.common.appName}
            </h1>
            <span className="text-sm text-gray-600 font-medium">
              Powered by Nano Banana*
            </span>
          </a>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.navigation.features}
            </a>
            
            {/* Platforms Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Platforms <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/youtube`} className="cursor-pointer">
                    YouTube Thumbnail Maker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/tiktok`} className="cursor-pointer">
                    TikTok Cover Creator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/instagram`} className="cursor-pointer">
                    Instagram Post Designer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/spotify`} className="cursor-pointer">
                    Spotify Cover Art
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/twitch`} className="cursor-pointer">
                    Twitch Thumbnail Maker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/linkedin`} className="cursor-pointer">
                    LinkedIn Cover Creator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/wechat`} className="cursor-pointer">
                    WeChat Cover Maker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/rednote`} className="cursor-pointer">
                    Rednote Cover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/platforms/bilibili`} className="cursor-pointer">
                    Bilibili Video Cover
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Tools <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/anime-poster-maker`} className="cursor-pointer">
                    Anime Poster Maker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/spotify-playlist-cover`} className="cursor-pointer">
                    Spotify Playlist Cover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/facebook-event-cover`} className="cursor-pointer">
                    Facebook Event Cover
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/social-media-poster`} className="cursor-pointer">
                    Social Media Poster
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/book-cover-creator`} className="cursor-pointer">
                    Book Cover Creator
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/game-cover-art`} className="cursor-pointer">
                    Game Cover Art
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/webinar-poster-maker`} className="cursor-pointer">
                    Webinar Poster Maker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/event-poster-designer`} className="cursor-pointer">
                    Event Poster Designer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/tools/music-album-cover`} className="cursor-pointer">
                    Music Album Cover
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href={`/${locale}/payment`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.navigation.pricing}
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {user ? (
              <>
                <UserMenu />
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                
                {/* Upgrade/Account button */}
                {currentTier === 'free' ? (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm px-4"
                    onClick={() => router.push(`/${locale}/payment`)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push(`/${locale}/account`)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {currentTier === 'pro' ? 'Pro' : 'Pro+'} Account
                  </Button>
                )}

                {/* Logout button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50" 
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                  onClick={() => {
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
      </header>

      {/* Auth Modal - Rendered outside header */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  )
}