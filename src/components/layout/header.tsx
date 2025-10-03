'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, ChevronDown, CreditCard, Loader2, Menu } from 'lucide-react'
import { useBestAuth } from '@/hooks/useBestAuth'
import AuthForm from '@/components/auth/AuthForm'
import UserMenu from '@/components/auth/UserMenu'
import LanguageSwitcher from '@/components/language-switcher'
import { Locale } from '@/lib/i18n/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { authEvents } from '@/lib/events/auth-events'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ActivationConfirmDialog from '@/components/subscription/ActivationConfirmDialog'
import { getClientSubscriptionConfig } from '@/lib/subscription-config-client'

interface HeaderProps {
  locale: Locale
  translations: any
}

export default function Header({ locale, translations: t }: HeaderProps) {
  const router = useRouter()
  const { user, loading, signOut, session } = useBestAuth()
  const { user: storeUser, subscriptionRefreshTrigger, triggerSubscriptionRefresh } = useAppStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Force refresh header when auth state changes
  useEffect(() => {
    console.log('[Header] Auth state changed:', { 
      loading, 
      hasUser: !!user, 
      userEmail: user?.email,
      timestamp: new Date().toISOString()
    })
    
    // If user state changed, refresh subscription
    if (user && !loading) {
      triggerSubscriptionRefresh()
    } else if (!user && !loading) {
      // User signed out - clear all local state
      setSubscriptionInfo(null)
      const { setUser } = useAppStore.getState()
      setUser(null)
    }
  }, [loading, user?.id, triggerSubscriptionRefresh])
  
  // Listen for auth events
  useEffect(() => {
    const unsubscribeAuth = authEvents.onAuthChange((event) => {
      console.log('[Header] Auth event received:', event.detail)
      
      if (event.detail.type === 'signout') {
        // Clear all state immediately for sign out
        setSubscriptionInfo(null)
        const { setUser } = useAppStore.getState()
        setUser(null)
        // Force complete re-render
        setForceUpdate(prev => prev + 1)
      }
      
      // Refresh subscription data
      triggerSubscriptionRefresh()
      // Force re-render
      router.refresh()
    })
    
    const unsubscribeSubscription = authEvents.onSubscriptionChange((event) => {
      console.log('[Header] Subscription event received:', event.detail)
      // Update subscription info immediately
      if (event.detail.data) {
        setSubscriptionInfo(event.detail.data)
      }
      // Refresh subscription data
      triggerSubscriptionRefresh()
    })
    
    return () => {
      unsubscribeAuth()
      unsubscribeSubscription()
    }
  }, [router, triggerSubscriptionRefresh])
  const [activating, setActivating] = useState(false)
  const [showActivationConfirm, setShowActivationConfirm] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentTier = storeUser?.tier || 'free'
  
  // Debug logging
  useEffect(() => {
    console.log('[Header] Auth state:', { user: user?.email, loading, storeUser: storeUser?.email })
  }, [user, loading, storeUser])
  
  // Initialize header state
  useEffect(() => {
    // Small delay to prevent flash of incorrect content
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])
  
  // Initialize store user when auth user changes
  useEffect(() => {
    if (user && !storeUser) {
      console.log('[Header] Initializing store user from auth user')
      // Set a default user object in the store - tier will be updated when subscription info is fetched
      useAppStore.getState().setUser({
        id: user.id,
        email: user.email,
        tier: 'free', // Default to free, will be updated by subscription fetch
        quotaLimit: 10,
        quotaUsed: 0
      })
    }
  }, [user, storeUser])
  
  // Fetch subscription info to check trial status
  useEffect(() => {
    if (user && session) {
      console.log('[Header] Fetching subscription info due to:', { 
        user: user?.email, 
        hasSession: !!session,
        refreshTrigger: subscriptionRefreshTrigger 
      })
      fetch('/api/bestauth/subscription/status', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            console.log('[Header] Subscription info updated:', {
              tier: data.tier,
              plan: data.plan,
              status: data.status,
              isTrialing: data.isTrialing
            })
            setSubscriptionInfo(data)
            
            // Update store's user object with the correct tier
            const tier = data.tier || data.plan || 'free'
            if (user && (!storeUser || storeUser.tier !== tier)) {
              console.log('[Header] Updating store user tier:', { 
                oldTier: storeUser?.tier, 
                newTier: tier 
              })
              const quotaLimits = {
                free: 10,
                pro: 120,
                pro_plus: 300
              }
              useAppStore.getState().setUser({
                id: user.id,
                email: user.email,
                tier: tier as 'free' | 'pro' | 'pro_plus',
                quotaLimit: quotaLimits[tier as keyof typeof quotaLimits] || 10,
                quotaUsed: storeUser?.quotaUsed || 0
              })
            }
          }
        })
        .catch(err => console.error('Error fetching subscription:', err))
    } else {
      // Clear subscription info when user logs out
      setSubscriptionInfo(null)
    }
  }, [user, session, subscriptionRefreshTrigger, storeUser])

  const handleLogout = async () => {
    console.log('[Header] Signing out...')
    const result = await signOut()
    if (!result.success) {
      console.error('[Header] Sign out failed:', result.error)
    } else {
      console.log('[Header] Sign out successful')
      // Clear the app store user data
      const { setUser } = useAppStore.getState()
      setUser(null)
      // Force refresh to update UI
      router.refresh()
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    
    // Trigger subscription refresh to update header
    triggerSubscriptionRefresh()
    
    // Force router refresh to update UI
    router.refresh()
    
    // Check if there's a pending plan from pricing section
    const pendingPlan = localStorage.getItem('covergen_pending_plan')
    if (pendingPlan && pendingPlan !== 'free') {
      console.log('[Header] Found pending plan after auth:', pendingPlan)
      localStorage.removeItem('covergen_pending_plan')
      // Redirect to payment page with the plan
      router.push(`/${locale}/payment?plan=${pendingPlan}`)
    }
  }

  const handleActivateClick = () => {
    if (!subscriptionInfo || !subscriptionInfo.isTrialing) return
    
    // Check if user has payment method
    if (!subscriptionInfo.hasPaymentMethod) {
      // No payment method, redirect to add one
      toast.error('Please add a payment method to activate your subscription', {
        duration: 4000
      })
      router.push(`/${locale}/account`)
      return
    }
    
    // Show confirmation dialog
    setShowActivationConfirm(true)
  }

  const handleActivateSubscription = async () => {
    if (!subscriptionInfo || !subscriptionInfo.isTrialing || !session) return

    setActivating(true)
    setShowActivationConfirm(false)
    
    try {
      const response = await fetch('/api/bestauth/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (data.activated) {
          // Immediate activation successful (when API supports it)
          toast.success(data.message || 'Subscription activated successfully!')
          // Refresh subscription info
          const statusRes = await fetch('/api/bestauth/subscription/status', {
            headers: {
              'Authorization': `Bearer ${session.token}`
            }
          })
          const statusData = await statusRes.json()
          if (statusData && !statusData.error) {
            setSubscriptionInfo(statusData)
          }
        } else if (data.billingStartsAt) {
          // Activation confirmed but billing starts at trial end
          toast.success(data.message, {
            duration: 8000
          })
          if (data.note) {
            // Show additional note about trial period
            setTimeout(() => {
              toast.info(data.note, {
                duration: 6000
              })
            }, 1000)
          }
        }
      } else {
        // Handle payment method required
        if (data.needsPaymentMethod) {
          toast.error('Please add a payment method to activate your subscription', {
            duration: 4000
          })
          // Redirect to account page to add payment method
          router.push(`/${locale}/account`)
        } else {
          throw new Error(data.error || 'Failed to activate subscription')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to activate subscription')
    } finally {
      setActivating(false)
    }
  }

  return (
    <>
      <header className="hidden lg:block border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/blueLogoTransparent.png" alt="CoverGen Pro" className="h-10 w-auto" />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <a href={`/${locale}#features`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.navigation.features}
            </a>
            
            {/* Platforms Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Platforms <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2" align="start">
                <div className="grid gap-0">
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/youtube`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">YouTube</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/tiktok`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">TikTok</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/instagram`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">Instagram</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/spotify`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">Spotify</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/twitch`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">Twitch</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/linkedin`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">LinkedIn</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/wechat`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">WeChat</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/rednote`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">Rednote</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/platforms/bilibili`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm font-medium text-gray-900">Bilibili</div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href={`/${locale}/sora`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Sora 2 Video
            </Link>
            
            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Tools <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-[80vh] overflow-y-auto" align="start">
                <div className="p-2">
                  {/* Social Media Tools */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Social Media Tools</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/instagram-thumbnail-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Instagram Maker</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/facebook-event-cover`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Facebook Cover</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/linkedin-banner-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">LinkedIn Banner</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/social-media-poster`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Social Poster</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                  
                  {/* Video & Streaming */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Video & Streaming</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/thumbnail-tester`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Thumbnail Tester</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/discord-banner-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Discord Banner</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                  
                  {/* Music & Audio */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Music & Audio</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/spotify-playlist-cover`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Spotify Playlist</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/music-album-cover`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Album Cover</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/podcast-cover-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Podcast Cover</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                  
                  {/* Publishing & Books */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Publishing Tools</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/book-cover-creator`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Book Cover</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/kindle-cover-creator`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Kindle Cover</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/wattpad-cover-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Wattpad Cover</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                  
                  {/* Creative & Design */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Creative Design</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/anime-poster-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Anime Poster</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/game-cover-art`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Game Cover</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                  
                  {/* Event & Business */}
                  <div className="mb-3">
                    <div className="text-ui-sm text-gray-500 uppercase tracking-wider mb-1 px-3">Event & Business</div>
                    <div className="grid grid-cols-2 gap-0">
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/event-poster-designer`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Event Poster</div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="h-auto p-0">
                        <Link href={`/${locale}/tools/webinar-poster-maker`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                          <div className="text-sm font-medium text-gray-900">Webinar Poster</div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </div>
                
                {/* Explore All Tools */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/tools`} className="block px-3 py-2 rounded-md hover:bg-blue-50 transition-colors text-center">
                      <div className="font-medium text-blue-600">Browse All Tools →</div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link href={`/${locale}#pricing`} className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              {t.navigation.pricing}
            </Link>
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Resources <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-2" align="start">
                <div className="grid gap-0">
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/tutorials`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-700">Tutorials</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/blog`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-700">Blog</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}#faq`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-700">FAQ</div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="h-auto p-0">
                    <Link href={`/${locale}/support`} className="block px-4 py-2.5 hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-700">Support Center</div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {loading || !isInitialized ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user && user.email ? (
              <>
                
                {/* Upgrade/Account button */}
                {(() => {
                  const isTrialing = subscriptionInfo?.isTrialing
                  const requiresPayment = subscriptionInfo?.requiresPaymentSetup
                  const plan = subscriptionInfo?.plan || currentTier
                  
                  // For trial users who need payment setup
                  if (isTrialing && requiresPayment) {
                    return (
                      <Button 
                        size="sm" 
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4"
                        onClick={() => router.push(`/${locale}/account`)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    )
                  }
                  
                  // For trial users - show trial badge instead of activate button
                  if (isTrialing && (plan === 'pro' || plan === 'pro_plus')) {
                    return (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => router.push(`/${locale}/account`)}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {plan === 'pro' ? 'Pro' : 'Pro+'} Trial
                      </Button>
                    )
                  }
                  
                  // For free users
                  if (plan === 'free') {
                    return (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm px-4"
                        onClick={() => router.push(`/${locale}/payment`)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    )
                  }
                  
                  // For Pro users - show upgrade to Pro+ button
                  if (plan === 'pro') {
                    return (
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm px-4"
                        onClick={() => router.push(`/${locale}/payment?plan=pro_plus&upgrade=true`)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro+
                      </Button>
                    )
                  }
                  
                  // For Pro+ users - no upgrade available (highest tier)
                  return null
                })()}

                {/* User Avatar - Account link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/${locale}/account`)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="Account"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium" 
                  onClick={() => setShowAuthModal(true)}
                >
                  Log in
                </Button>
                <Button 
                  size="sm" 
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-5" 
                  onClick={() => {
                    const generatorSection = document.getElementById('generator')
                    if (generatorSection) {
                      generatorSection.scrollIntoView({ behavior: 'smooth' })
                    } else if (window.location.pathname !== '/') {
                      window.location.href = '/#generator'
                    }
                  }}
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/blueLogoTransparent.png" alt="CoverGen Pro" className="h-8 w-auto" />
          </Link>

          {/* Mobile Menu Button and User Avatar */}
          <div className="flex items-center gap-2">
            {!loading && user && user.email && (
              <>
                {/* User Avatar - Account link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/${locale}/account`)}
                  className="p-0.5 hover:bg-gray-100 rounded-full"
                  title="Account"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-4">
                <Link 
                  href={`/${locale}#features`} 
                  className="block text-base font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                
                {/* Platforms Section */}
                <div>
                  <div className="text-ui-md text-gray-500 uppercase tracking-wider mb-2">Platforms</div>
                  <div className="space-y-2 ml-4">
                    <Link 
                      href={`/${locale}/platforms/youtube`} 
                      className="block text-base text-gray-600 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      YouTube
                    </Link>
                    <Link 
                      href={`/${locale}/platforms/tiktok`} 
                      className="block text-base text-gray-600 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      TikTok
                    </Link>
                    <Link 
                      href={`/${locale}/platforms/instagram`} 
                      className="block text-base text-gray-600 hover:text-blue-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Instagram
                    </Link>
                    <Link 
                      href={`/${locale}/platforms`} 
                      className="block text-base font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      View All Platforms →
                    </Link>
                  </div>
                </div>
                
                {/* Sora 2 Link */}
                <Link 
                  href={`/${locale}/sora`} 
                  className="block text-base font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sora 2 Video
                </Link>
                
                {/* Tools Section */}
                <div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</div>
                  <div className="space-y-2 ml-4">
                    <Link 
                      href={`/${locale}/tools`} 
                      className="block text-base font-medium text-blue-600 hover:text-blue-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse All Tools →
                    </Link>
                  </div>
                </div>
                
                <Link 
                  href={`/${locale}#pricing`} 
                  className="block text-base font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href={`/${locale}/support`} 
                  className="block text-base font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
                
                <div className="pt-4 border-t border-gray-200">
                  {loading ? (
                    <div className="w-full h-10 bg-gray-100 animate-pulse rounded" />
                  ) : user ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{user?.email || 'User'}</div>
                          <div className="text-xs text-gray-500">
                            {subscriptionInfo?.tier === 'pro_plus' ? 'Pro+ Member' : 
                             subscriptionInfo?.tier === 'pro' ? 'Pro Member' : 'Free Plan'}
                          </div>
                        </div>
                      </div>
                      <Link 
                        href={`/${locale}/account`}
                        className="block text-base font-medium text-gray-700 hover:text-blue-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Account
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          handleLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="w-full text-gray-600 hover:text-red-600"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setShowAuthModal(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        Log in
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => {
                          const generatorSection = document.getElementById('generator')
                          if (generatorSection) {
                            generatorSection.scrollIntoView({ behavior: 'smooth' })
                          } else if (window.location.pathname !== '/') {
                            window.location.href = '/#generator'
                          }
                          setMobileMenuOpen(false)
                        }}
                      >
                        Get Started Free
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal - Rendered outside header */}
      {showAuthModal && (
        <AuthForm 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      
      {/* Activation Confirmation Dialog */}
      {subscriptionInfo?.isTrialing && subscriptionInfo?.plan && (() => {
        const config = getClientSubscriptionConfig()
        const planName = subscriptionInfo.plan === 'pro' ? 'Pro' : subscriptionInfo.plan === 'pro_plus' ? 'Pro+' : 'Free'
        const planPrice = subscriptionInfo.plan === 'pro' ? 9 : subscriptionInfo.plan === 'pro_plus' ? 19 : 0
        const planFeatures = subscriptionInfo.plan === 'pro' ? [
          `${config.limits.pro.monthly} covers per month`,
          'No watermark',
          'All platform sizes',
          'Priority support'
        ] : subscriptionInfo.plan === 'pro_plus' ? [
          `${config.limits.pro_plus.monthly} covers per month`,
          'No watermark',
          'All platform sizes',
          'Advanced customization',
          'Commercial usage license',
          'Dedicated support'
        ] : []
        
        return (
          <ActivationConfirmDialog
            open={showActivationConfirm}
            onClose={() => setShowActivationConfirm(false)}
            onConfirm={handleActivateSubscription}
            planName={planName}
            planPrice={planPrice}
            planFeatures={planFeatures}
            isActivating={activating}
          />
        )
      })()}
    </>
  )
}