// Event bus for decoupled authentication communication
import { AuthEvent, AuthEventType } from './types'

type EventListener = (event: AuthEvent) => void | Promise<void>

class AuthEventBus {
  private listeners: Map<AuthEventType, Set<EventListener>> = new Map()
  private globalListeners: Set<EventListener> = new Set()
  private eventHistory: AuthEvent[] = []
  private maxHistorySize = 50

  // Subscribe to specific event type
  on(eventType: AuthEventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    
    const listeners = this.listeners.get(eventType)!
    listeners.add(listener)

    // Return unsubscribe function
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  // Subscribe to all events
  onAll(listener: EventListener): () => void {
    this.globalListeners.add(listener)
    return () => {
      this.globalListeners.delete(listener)
    }
  }

  // Emit an event
  async emit(event: AuthEvent): Promise<void> {
    console.log(`[AuthEventBus] Emitting event: ${event.type}`, {
      hasUser: !!event.user,
      hasSession: !!event.session,
      metadata: event.metadata
    })

    // Add to history
    this.eventHistory.push({
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString()
      }
    })
    
    // Trim history if needed
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Notify global listeners first
    for (const listener of this.globalListeners) {
      try {
        await Promise.resolve(listener(event))
      } catch (error) {
        console.error('[AuthEventBus] Global listener error:', error)
      }
    }

    // Notify specific listeners
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      for (const listener of listeners) {
        try {
          await Promise.resolve(listener(event))
        } catch (error) {
          console.error(`[AuthEventBus] Listener error for ${event.type}:`, error)
        }
      }
    }
  }

  // Get event history
  getHistory(eventType?: AuthEventType): AuthEvent[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType)
    }
    return [...this.eventHistory]
  }

  // Clear history
  clearHistory(): void {
    this.eventHistory = []
  }

  // Remove all listeners
  clear(): void {
    this.listeners.clear()
    this.globalListeners.clear()
  }

  // Get listener counts
  getListenerCount(eventType?: AuthEventType): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0
    }
    
    let total = this.globalListeners.size
    for (const listeners of this.listeners.values()) {
      total += listeners.size
    }
    return total
  }
}

// Export singleton instance
export const authEventBus = new AuthEventBus()