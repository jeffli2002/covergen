'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function OAuthDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    const updateDebugInfo = () => {
      const urlParams = new URLSearchParams(window.location.search)
      setDebugInfo({
        // URL Info
        pathname: window.location.pathname,
        hasCode: urlParams.has('code'),
        hasError: urlParams.has('error'),
        code: urlParams.get('code')?.substring(0, 10) + '...' || 'none',
        
        // Storage Info
        sessionStorageFlag: sessionStorage.getItem('oauth_popup_active'),
        localStorageFlag: localStorage.getItem('oauth_popup_active'),
        popupTimestamp: localStorage.getItem('oauth_popup_timestamp'),
        timeSincePopup: localStorage.getItem('oauth_popup_timestamp') 
          ? Math.floor((Date.now() - parseInt(localStorage.getItem('oauth_popup_timestamp')!)) / 1000) + 's ago'
          : 'N/A',
        
        // Window Info
        windowName: window.name,
        hasOpener: !!window.opener,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        isPopupSize: window.innerWidth <= 600 && window.innerHeight <= 800,
        
        // Cookies
        hasSbCookies: document.cookie.includes('sb-'),
        
        // Timestamp
        timestamp: new Date().toLocaleTimeString()
      })
    }
    
    // Update immediately
    updateDebugInfo()
    
    // Update every second
    const interval = setInterval(updateDebugInfo, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const clearOAuthFlags = () => {
    sessionStorage.removeItem('oauth_popup_active')
    localStorage.removeItem('oauth_popup_active')
    localStorage.removeItem('oauth_popup_timestamp')
    window.location.reload()
  }
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-[9999]">
      <h3 className="font-bold mb-2 text-yellow-400">OAuth Debug Panel</h3>
      
      <div className="space-y-1">
        <div className="text-blue-300">URL Info:</div>
        <div>• Path: {debugInfo.pathname}</div>
        <div>• Has Code: {debugInfo.hasCode ? '✅' : '❌'} {debugInfo.code}</div>
        <div>• Has Error: {debugInfo.hasError ? '⚠️' : '❌'}</div>
        
        <div className="text-green-300 mt-2">Storage Flags:</div>
        <div>• Session Flag: {debugInfo.sessionStorageFlag || 'not set'}</div>
        <div>• Local Flag: {debugInfo.localStorageFlag || 'not set'}</div>
        <div>• Popup Time: {debugInfo.timeSincePopup}</div>
        
        <div className="text-purple-300 mt-2">Window Info:</div>
        <div>• Name: "{debugInfo.windowName}"</div>
        <div>• Opener: {debugInfo.hasOpener ? '✅' : '❌'}</div>
        <div>• Size: {debugInfo.windowSize} {debugInfo.isPopupSize ? '(popup)' : ''}</div>
        
        <div className="text-orange-300 mt-2">Auth State:</div>
        <div>• Supabase Cookies: {debugInfo.hasSbCookies ? '✅' : '❌'}</div>
        
        <div className="text-gray-400 mt-2">Last Update: {debugInfo.timestamp}</div>
      </div>
      
      <Button 
        onClick={clearOAuthFlags}
        className="mt-3 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
        size="sm"
      >
        Clear OAuth Flags
      </Button>
    </div>
  )
}