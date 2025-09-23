import { create } from 'zustand'
import { Platform, StyleTemplate } from './utils'

export interface User {
  id: string
  email: string
  tier: 'free' | 'pro' | 'pro_plus'
  quotaUsed: number
  quotaLimit: number
}

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
  user: User | null
  currentTask: GenerationTask | null
  tasks: GenerationTask[]
  usageRefreshTrigger: number  // Increment this to trigger usage refresh
  
  // Actions
  setUser: (user: User | null) => void
  setCurrentTask: (task: GenerationTask | null) => void
  addTask: (task: GenerationTask) => void
  updateTask: (id: string, updates: Partial<GenerationTask>) => void
  triggerUsageRefresh: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  currentTask: null,
  tasks: [],
  usageRefreshTrigger: 0,

  setUser: (user) => set({ user }),
  
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

  triggerUsageRefresh: () => set((state) => ({
    usageRefreshTrigger: state.usageRefreshTrigger + 1
  }))
}))