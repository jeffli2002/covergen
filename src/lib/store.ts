import { create } from 'zustand'
import { Platform, StyleTemplate } from './utils'
import { userSessionService, type UnifiedUser } from '@/services/unified/UserSessionService'

export interface GenerationTask {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  title: string
  platform: Platform
  style: StyleTemplate
  enhancedPrompt?: string
  dimensions?: { width: number | undefined; height: number | undefined; label: string }
  avatarUrl?: string
  results: string[]
  createdAt: Date
}

interface AppState {
  // User state (now comes from UserSessionService)
  user: UnifiedUser | null
  isAuthenticated: boolean
  
  // UI state
  currentTask: GenerationTask | null
  tasks: GenerationTask[]
  isLoading: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  setCurrentTask: (task: GenerationTask | null) => void
  addTask: (task: GenerationTask) => void
  updateTask: (id: string, updates: Partial<GenerationTask>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  createCheckoutSession: (planId: 'pro' | 'pro_plus') => Promise<{ success: boolean; url?: string; error?: string }>
  createPortalSession: () => Promise<{ success: boolean; url?: string; error?: string }>
  incrementUsage: () => Promise<{ success: boolean; remaining?: number; error?: string }>
  checkUsageLimit: () => Promise<{ canGenerate: boolean; remaining: number; limit: number }>
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentTask: null,
  tasks: [],
  isLoading: false,
  error: null,

  // Initialize the store and connect to UserSessionService
  initialize: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // Initialize the unified service
      const initialized = await userSessionService.initialize()
      
      if (initialized) {
        // Subscribe to user changes
        userSessionService.subscribe((user) => {
          set({ 
            user,
            isAuthenticated: !!user,
            error: null
          })
        })
      }
    } catch (error: any) {
      console.error('[Store] Initialization error:', error)
      set({ error: error.message || 'Failed to initialize' })
    } finally {
      set({ isLoading: false })
    }
  },

  // Task management
  setCurrentTask: (task) => set({ currentTask: task }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks],
    currentTask: task
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ),
    currentTask: state.currentTask?.id === id 
      ? { ...state.currentTask, ...updates }
      : state.currentTask
  })),

  // UI state management
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  // Authentication methods (delegated to UserSessionService)
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await userSessionService.signInWithGoogle()
      
      if (!result.success) {
        set({ error: result.error?.message || 'Sign in failed' })
        return { success: false, error: result.error?.message }
      }
      
      // OAuth redirect will handle the rest
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await userSessionService.signOut()
      
      if (!result.success) {
        set({ error: result.error?.message || 'Sign out failed' })
        return { success: false, error: result.error?.message }
      }

      // Clear tasks and current task on sign out
      set({ 
        currentTask: null,
        tasks: [],
        user: null,
        isAuthenticated: false
      })
      
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      set({ isLoading: false })
    }
  },

  // Payment methods (delegated to UserSessionService)
  createCheckoutSession: async (planId) => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await userSessionService.createCheckoutSession(planId)
      
      if (!result.success) {
        const errorMessage = result.error?.requiresAuth 
          ? 'Please sign in to upgrade your subscription'
          : (result.error?.message || 'Checkout failed')
        set({ error: errorMessage })
        return { success: false, error: errorMessage }
      }

      return { success: true, url: result.url }
    } catch (error: any) {
      const errorMessage = error.message || 'Checkout failed'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      set({ isLoading: false })
    }
  },

  createPortalSession: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const result = await userSessionService.createPortalSession()
      
      if (!result.success) {
        const errorMessage = result.error?.requiresAuth 
          ? 'Please sign in to manage your subscription'
          : (result.error?.message || 'Portal access failed')
        set({ error: errorMessage })
        return { success: false, error: errorMessage }
      }

      return { success: true, url: result.url }
    } catch (error: any) {
      const errorMessage = error.message || 'Portal access failed'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      set({ isLoading: false })
    }
  },

  // Usage tracking methods
  incrementUsage: async () => {
    try {
      const result = await userSessionService.incrementUsage()
      
      if (!result.success) {
        set({ error: result.error || 'Failed to track usage' })
      }
      
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to track usage'
      set({ error: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  checkUsageLimit: async () => {
    try {
      const result = await userSessionService.checkUsageLimit()
      return result
    } catch (error: any) {
      console.error('[Store] Usage check error:', error)
      return { canGenerate: false, remaining: 0, limit: 0 }
    }
  }
}))

// Helper hooks for common patterns
export const useUser = () => {
  const user = useAppStore(state => state.user)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)
  return { user, isAuthenticated }
}

export const useSubscription = () => {
  const user = useAppStore(state => state.user)
  return {
    subscription: user?.subscription || null,
    isSubscribed: user?.subscription.tier !== 'free',
    isTrialing: user?.subscription.status === 'trialing',
    tier: user?.subscription.tier || 'free'
  }
}

export const useUsage = () => {
  const user = useAppStore(state => state.user)
  const checkUsageLimit = useAppStore(state => state.checkUsageLimit)
  const incrementUsage = useAppStore(state => state.incrementUsage)
  
  return {
    usage: user?.usage || { monthly: 0, monthlyLimit: 10, daily: 0, dailyLimit: 3, remaining: 3 },
    checkUsageLimit,
    incrementUsage
  }
}

// Initialize store on app start
if (typeof window !== 'undefined') {
  useAppStore.getState().initialize()
}