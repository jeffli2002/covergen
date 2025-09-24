'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface GoogleOAuthButtonProps {
  onClick: () => void | Promise<void>
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  size?: 'large' | 'medium'
  showTrustSignals?: boolean
  className?: string
  text?: string
}

export function GoogleOAuthButton({ 
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'large',
  showTrustSignals = false,
  className = '',
  text = 'Continue with Google'
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()
    } catch (error) {
      console.error('Google OAuth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const baseClasses = "w-full font-medium rounded-lg transition-all duration-150 ease-in-out focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group"
  
  const variantClasses = {
    primary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm hover:shadow-md",
    secondary: "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
  }
  
  const sizeClasses = {
    large: "h-12 text-base",
    medium: "h-10 text-sm"
  }

  const logoSize = size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
  const loadingSize = size === 'large' ? 'h-4 w-4' : 'h-3 w-3'

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        aria-label="Continue with Google account"
        role="button"
      >
        {isLoading ? (
          <Loader2 className={`mr-2 ${loadingSize} animate-spin`} />
        ) : (
          <svg className={`mr-3 ${logoSize} flex-shrink-0`} viewBox="0 0 24 24">
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="flex-1 text-left">
          {isLoading ? 'Connecting to Google...' : text}
        </span>
        {!isLoading && (
          <svg 
            className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </Button>
      
      {showTrustSignals && !isLoading && (
        <p className="text-xs text-gray-500 text-center">
          Quick signup with your Google account
        </p>
      )}
    </div>
  )
}