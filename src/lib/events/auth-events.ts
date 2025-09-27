// Event emitter for auth state changes
export class AuthEventEmitter extends EventTarget {
  private static instance: AuthEventEmitter

  static getInstance(): AuthEventEmitter {
    if (!AuthEventEmitter.instance) {
      AuthEventEmitter.instance = new AuthEventEmitter()
    }
    return AuthEventEmitter.instance
  }

  emitAuthChange(type: 'signin' | 'signout' | 'subscription_update') {
    this.dispatchEvent(new CustomEvent('authchange', { 
      detail: { type, timestamp: Date.now() } 
    }))
  }

  emitSubscriptionChange(data: any) {
    this.dispatchEvent(new CustomEvent('subscriptionchange', { 
      detail: { data, timestamp: Date.now() } 
    }))
  }

  onAuthChange(callback: (event: CustomEvent) => void) {
    this.addEventListener('authchange', callback as EventListener)
    return () => this.removeEventListener('authchange', callback as EventListener)
  }

  onSubscriptionChange(callback: (event: CustomEvent) => void) {
    this.addEventListener('subscriptionchange', callback as EventListener)
    return () => this.removeEventListener('subscriptionchange', callback as EventListener)
  }
}

export const authEvents = AuthEventEmitter.getInstance()