'use client'

import React from 'react'
import { useOAuth } from '../hooks/useOAuth'

interface OAuthStatusProps {
  showDetails?: boolean
  className?: string
}

export function OAuthStatus({ showDetails = false, className = '' }: OAuthStatusProps) {
  const { user, loading, error, signOut } = useOAuth()
  
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={`text-sm text-red-600 ${className}`}>
        Error: {error.message}
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        Not signed in
      </div>
    )
  }
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user.avatar && (
        <img 
          src={user.avatar} 
          alt={user.name || user.email}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {user.name || user.email}
        </div>
        {showDetails && user.name && (
          <div className="text-xs text-gray-500 truncate">
            {user.email}
          </div>
        )}
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  )
}