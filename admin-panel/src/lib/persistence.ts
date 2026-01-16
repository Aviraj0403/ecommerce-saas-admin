import { StateStorage } from 'zustand/middleware'

// Enhanced localStorage with error handling and validation
export class EnhancedStorage implements StateStorage {
  private prefix: string

  constructor(prefix = 'gk-admin') {
    this.prefix = prefix
  }

  getItem(name: string): string | null {
    try {
      const item = localStorage.getItem(`${this.prefix}-${name}`)
      if (!item) return null

      // Validate JSON structure
      const parsed = JSON.parse(item)
      if (!parsed.state || !parsed.version) {
        console.warn(`Invalid storage format for ${name}, clearing...`)
        this.removeItem(name)
        return null
      }

      return item
    } catch (error) {
      console.error(`Failed to get item ${name} from storage:`, error)
      this.removeItem(name)
      return null
    }
  }

  setItem(name: string, value: string): void {
    try {
      // Add metadata to stored value
      const enhanced = JSON.parse(value)
      enhanced.timestamp = Date.now()
      enhanced.version = '1.0'
      
      localStorage.setItem(`${this.prefix}-${name}`, JSON.stringify(enhanced))
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${this.prefix}-${name}`,
        newValue: JSON.stringify(enhanced),
        storageArea: localStorage
      }))
    } catch (error) {
      console.error(`Failed to set item ${name} in storage:`, error)
    }
  }

  removeItem(name: string): void {
    try {
      localStorage.removeItem(`${this.prefix}-${name}`)
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${this.prefix}-${name}`,
        newValue: null,
        storageArea: localStorage
      }))
    } catch (error) {
      console.error(`Failed to remove item ${name} from storage:`, error)
    }
  }
}

// Storage validation utilities
export const storageValidators = {
  auth: (state: any) => {
    return (
      state &&
      typeof state === 'object' &&
      (state.user === null || typeof state.user === 'object') &&
      (state.token === null || typeof state.token === 'string') &&
      typeof state.isAuthenticated === 'boolean'
    )
  },

  tenant: (state: any) => {
    return (
      state &&
      typeof state === 'object' &&
      (state.id === null || typeof state.id === 'string') &&
      (state.branding === null || typeof state.branding === 'object')
    )
  },

  ui: (state: any) => {
    return (
      state &&
      typeof state === 'object' &&
      typeof state.sidebarCollapsed === 'boolean'
    )
  }
}

// Cross-tab synchronization
export class CrossTabSync {
  private listeners: Map<string, (data: any) => void> = new Map()

  constructor() {
    window.addEventListener('storage', this.handleStorageChange.bind(this))
  }

  private handleStorageChange(event: StorageEvent) {
    if (!event.key || !event.key.startsWith('gk-admin-')) return

    const storeName = event.key.replace('gk-admin-', '')
    const listener = this.listeners.get(storeName)
    
    if (listener && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue)
        listener(parsed.state)
      } catch (error) {
        console.error('Failed to parse cross-tab sync data:', error)
      }
    }
  }

  subscribe(storeName: string, callback: (data: any) => void) {
    this.listeners.set(storeName, callback)
  }

  unsubscribe(storeName: string) {
    this.listeners.delete(storeName)
  }

  destroy() {
    window.removeEventListener('storage', this.handleStorageChange.bind(this))
    this.listeners.clear()
  }
}

// Migration utilities for state schema changes
export const stateMigrations = {
  auth: {
    '1.0': (state: any) => state, // Current version
  },
  
  tenant: {
    '1.0': (state: any) => state, // Current version
  },

  ui: {
    '1.0': (state: any) => state, // Current version
  }
}

// State restoration with validation and migration
export function restoreState<T>(
  storeName: string, 
  validator: (state: any) => boolean,
  defaultState: T
): T {
  try {
    const stored = localStorage.getItem(`gk-admin-${storeName}`)
    if (!stored) return defaultState

    const parsed = JSON.parse(stored)
    if (!parsed.state || !validator(parsed.state)) {
      console.warn(`Invalid state for ${storeName}, using default`)
      return defaultState
    }

    // Apply migrations if needed
    const migrations = stateMigrations[storeName as keyof typeof stateMigrations]
    if (migrations && parsed.version) {
      const migrated = migrations[parsed.version as keyof typeof migrations]?.(parsed.state)
      return migrated || defaultState
    }

    return parsed.state
  } catch (error) {
    console.error(`Failed to restore state for ${storeName}:`, error)
    return defaultState
  }
}

// Initialize persistence system
export function initializePersistence() {
  // Clean up invalid storage entries
  const keysToRemove: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('gk-admin-')) {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          JSON.parse(value)
        }
      } catch (error) {
        keysToRemove.push(key)
      }
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))

  console.log('Admin persistence system initialized')
}