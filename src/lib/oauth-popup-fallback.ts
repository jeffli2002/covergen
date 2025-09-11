// Fallback OAuth handler for when COOP blocks popup communication
export class OAuthPopupFallback {
  private static readonly STORAGE_KEY = 'oauth_popup_result'
  
  // Parent window polls for result
  static pollForResult(callback: (result: any) => void, timeout = 30000) {
    const startTime = Date.now()
    
    const checkInterval = setInterval(() => {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      
      if (stored) {
        try {
          const result = JSON.parse(stored)
          localStorage.removeItem(this.STORAGE_KEY)
          clearInterval(checkInterval)
          callback(result)
        } catch (e) {
          console.error('Failed to parse OAuth result:', e)
        }
      }
      
      // Timeout after 30 seconds
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        callback({ error: 'OAuth timeout' })
      }
    }, 500)
    
    return () => clearInterval(checkInterval)
  }
  
  // Popup stores result
  static storeResult(result: any) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(result))
      console.log('[OAuthPopupFallback] Result stored in localStorage')
    } catch (e) {
      console.error('[OAuthPopupFallback] Failed to store result:', e)
    }
  }
}