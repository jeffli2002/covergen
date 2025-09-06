// Central initialization for all auth listeners
import { profileSyncListener } from './profileSync'
import { sessionManagerListener } from './sessionManager'

let initialized = false

export function initializeAuthListeners() {
  if (initialized) {
    console.warn('[AuthListeners] Already initialized')
    return
  }

  console.log('[AuthListeners] Initializing all listeners')
  
  // Start all listeners
  profileSyncListener.start()
  sessionManagerListener.start()
  
  initialized = true
}

export function stopAuthListeners() {
  if (!initialized) {
    console.warn('[AuthListeners] Not initialized')
    return
  }

  console.log('[AuthListeners] Stopping all listeners')
  
  profileSyncListener.stop()
  sessionManagerListener.stop()
  
  initialized = false
}

// Export individual listeners for direct access if needed
export { profileSyncListener, sessionManagerListener }