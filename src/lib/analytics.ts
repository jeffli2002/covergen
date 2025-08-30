// User Testing & Analytics Framework
export interface UserEvent {
  event: string
  properties: Record<string, any>
  userId?: string
  timestamp: Date
}

export interface ABTest {
  id: string
  name: string
  variants: string[]
  allocation: Record<string, number>
}

class Analytics {
  private events: UserEvent[] = []
  private activeTests: ABTest[] = [
    {
      id: 'homepage_cta',
      name: 'Homepage CTA Button Text',
      variants: ['Get Started Free', 'Create Your First Cover', 'Start Generating'],
      allocation: { 'Get Started Free': 0.4, 'Create Your First Cover': 0.3, 'Start Generating': 0.3 }
    },
    {
      id: 'pricing_highlight',
      name: 'Pricing Section Highlight',
      variants: ['pro', 'pro_plus', 'none'],
      allocation: { 'pro': 0.5, 'pro_plus': 0.3, 'none': 0.2 }
    }
  ]

  // Track user events
  track(event: string, properties: Record<string, any> = {}, userId?: string) {
    const userEvent: UserEvent = {
      event,
      properties,
      userId,
      timestamp: new Date()
    }
    
    this.events.push(userEvent)
    
    // Mock sending to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', userEvent)
    }
    
    // In production, send to analytics service:
    // this.sendToAnalytics(userEvent)
  }

  // A/B Testing
  getVariant(testId: string, userId?: string): string {
    const test = this.activeTests.find(t => t.id === testId)
    if (!test) return 'control'
    
    // Simple hash-based assignment for consistent user experience
    const hash = this.simpleHash(testId + (userId || 'anonymous'))
    const variants = Object.keys(test.allocation)
    
    let cumulativeWeight = 0
    const randomValue = (hash % 100) / 100
    
    for (const variant of variants) {
      cumulativeWeight += test.allocation[variant]
      if (randomValue < cumulativeWeight) {
        return variant
      }
    }
    
    return variants[0] || 'control'
  }

  // User journey tracking
  trackPageView(page: string, userId?: string) {
    this.track('page_view', { page }, userId)
  }

  trackInteraction(element: string, action: string, userId?: string) {
    this.track('interaction', { element, action }, userId)
  }

  trackConversion(type: 'signup' | 'subscription' | 'generation' | 'download', userId?: string) {
    this.track('conversion', { type }, userId)
  }

  trackError(error: string, context: string, userId?: string) {
    this.track('error', { error, context }, userId)
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, userId?: string) {
    this.track('performance', { metric, value }, userId)
  }

  // User feedback
  trackFeedback(rating: number, context: string, feedback?: string, userId?: string) {
    this.track('feedback', { rating, context, feedback }, userId)
  }

  // Get analytics data (for testing/debugging)
  getEvents(): UserEvent[] {
    return this.events
  }

  // Simple hash function for A/B testing
  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // In production, implement:
  // private sendToAnalytics(event: UserEvent) {
  //   fetch('/api/analytics', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(event)
  //   })
  // }
}

export const analytics = new Analytics()

// React hooks for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackFeedback: analytics.trackFeedback.bind(analytics),
    getVariant: analytics.getVariant.bind(analytics)
  }
}

// User testing utilities
export const userTesting = {
  // Key metrics to track
  keyMetrics: [
    'time_to_first_generation',
    'generation_success_rate', 
    'conversion_rate',
    'user_satisfaction',
    'feature_adoption_rate'
  ],

  // User journey checkpoints
  journeyCheckpoints: [
    'landing_page_view',
    'signup_started',
    'signup_completed',
    'first_generation_attempt',
    'first_generation_success',
    'first_download',
    'subscription_view',
    'subscription_purchase'
  ],

  // Test scenarios
  testScenarios: [
    {
      id: 'new_user_flow',
      name: 'New User Onboarding',
      steps: [
        'Visit homepage',
        'Click get started',
        'Complete signup',
        'Generate first cover',
        'Download result'
      ]
    },
    {
      id: 'conversion_flow',
      name: 'Free to Paid Conversion',
      steps: [
        'Use free quota',
        'Hit quota limit',
        'View pricing',
        'Subscribe to Pro',
        'Generate with Pro features'
      ]
    }
  ]
}