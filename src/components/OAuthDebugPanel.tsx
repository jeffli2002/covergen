'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function OAuthDebugPanelInner() {
  const searchParams = useSearchParams()
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  useEffect(() => {
    const updateDebugInfo = () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      const info = {
        // URL Info
        href: window.location.href,
        pathname: window.location.pathname,
        hasCode: !!code,
        codePreview: code ? `${code.substring(0, 8)}...` : null,
        hasError: !!error,
        
        // Window Info
        windowName: window.name,
        hasOpener: false,
        windowSize: `${window.innerWidth}x${window.innerHeight}`,
        isSmallWindow: window.innerWidth <= 600 && window.innerHeight <= 800,
        
        // Storage Flags
        sessionStorageFlag: sessionStorage.getItem('oauth_popup_active'),
        localStorageFlag: localStorage.getItem('oauth_popup_active'),
        popupTimestamp: localStorage.getItem('oauth_popup_timestamp'),
        
        // Popup Detection
        detectedAsPopup: false
      }
      
      // Check opener
      try {
        info.hasOpener = !!window.opener
      } catch (e) {
        info.hasOpener = false
      }
      
      // Popup detection logic (same as OAuthPopupHandler)
      info.detectedAsPopup = 
        info.windowName === 'oauth-popup' ||
        sessionStorage.getItem('oauth_popup_active') === 'true' ||
        localStorage.getItem('oauth_popup_active') === 'true' ||
        (info.hasCode && info.isSmallWindow)
      
      setDebugInfo(info)
    }
    
    // Update immediately and on changes
    updateDebugInfo()
    window.addEventListener('storage', updateDebugInfo)
    
    return () => {
      window.removeEventListener('storage', updateDebugInfo)
    }
  }, [searchParams])
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null
  
  // Only show if there's OAuth-related activity
  if (!debugInfo.hasCode && !debugInfo.hasError && 
      !debugInfo.sessionStorageFlag && !debugInfo.localStorageFlag) {
    return null
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#4ade80' }}>OAuth Debug Panel</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {Object.entries(debugInfo).map(([key, value]) => (
            <tr key={key}>
              <td style={{ 
                padding: '0.25rem 0.5rem 0.25rem 0', 
                borderBottom: '1px solid #333',
                color: '#94a3b8'
              }}>
                {key}:
              </td>
              <td style={{ 
                padding: '0.25rem 0', 
                borderBottom: '1px solid #333',
                color: value === true ? '#4ade80' : 
                       value === false ? '#f87171' : 
                       value === null ? '#6b7280' : '#f3f4f6',
                fontWeight: key === 'detectedAsPopup' ? 'bold' : 'normal'
              }}>
                {String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          sessionStorage.removeItem('oauth_popup_active')
          localStorage.removeItem('oauth_popup_active')
          localStorage.removeItem('oauth_popup_timestamp')
          window.location.reload()
        }}
        style={{
          marginTop: '0.5rem',
          padding: '0.25rem 0.5rem',
          background: '#ef4444',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Clear OAuth Flags & Reload
      </button>
    </div>
  )
}

export function OAuthDebugPanel() {
  return (
    <Suspense fallback={null}>
      <OAuthDebugPanelInner />
    </Suspense>
  )
}