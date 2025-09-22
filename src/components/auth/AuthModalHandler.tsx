'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AuthForm from './AuthForm'
import { X } from 'lucide-react'

export default function AuthModalHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    const authParam = searchParams.get('auth')
    const redirectParam = searchParams.get('redirect')
    
    if (authParam === 'signin' || authParam === 'signup') {
      setShowAuthModal(true)
      setRedirectPath(redirectParam)
    }
  }, [searchParams])

  const handleClose = () => {
    setShowAuthModal(false)
    // Remove auth params from URL
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('auth')
    newUrl.searchParams.delete('redirect')
    router.replace(newUrl.pathname + newUrl.search)
  }

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false)
    
    // If there's a redirect path, navigate to it
    if (redirectPath) {
      router.push(redirectPath)
    } else {
      // Remove auth params from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('auth')
      newUrl.searchParams.delete('redirect')
      router.replace(newUrl.pathname + newUrl.search)
    }
  }

  if (!showAuthModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-md w-full">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <AuthForm 
          onClose={handleClose}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  )
}