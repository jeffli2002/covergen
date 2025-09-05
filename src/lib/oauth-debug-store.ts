// Store debug logs in memory (will reset on redeploy)
export interface DebugLogEntry {
  timestamp: string
  message: string
  data?: any
}

class DebugLogStore {
  private static instance: DebugLogStore
  private logs: DebugLogEntry[] = []
  private maxLogs = 100

  private constructor() {}

  static getInstance(): DebugLogStore {
    if (!DebugLogStore.instance) {
      DebugLogStore.instance = new DebugLogStore()
    }
    return DebugLogStore.instance
  }

  add(message: string, data?: any): void {
    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      message,
      data
    }
    
    this.logs.push(entry)
    console.log(`[Auth Callback Debug] ${message}`, data || '')
    
    // Keep only last N entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  getLogs(): DebugLogEntry[] {
    return [...this.logs]
  }

  clear(): void {
    this.logs = []
  }

  getCount(): number {
    return this.logs.length
  }
}

export const debugLogStore = DebugLogStore.getInstance()