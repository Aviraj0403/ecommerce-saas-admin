'use client'

import { useEffect } from 'react'
import { initializePersistence } from '@/lib/persistence'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useTenantStore } from '@/store/tenant-store'

interface PersistenceProviderProps {
  children: React.ReactNode
}

export function PersistenceProvider({ children }: PersistenceProviderProps) {
  const initializeAuth = useAuthStore((state) => state.initialize)
  const calculateCartTotals = useCartStore((state) => state.calculateTotals)
  const initializeTenant = useTenantStore((state) => state.initializeTenant)

  useEffect(() => {
    // Initialize persistence system
    initializePersistence()

    // Initialize stores
    initializeAuth()
    calculateCartTotals()
    initializeTenant()

    // Handle page visibility change for state sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Re-initialize when page becomes visible (handles cross-tab sync)
        initializeAuth()
        calculateCartTotals()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Handle storage events for cross-tab sync
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('gk-store-')) {
        // Reinitialize relevant stores when storage changes
        if (event.key.includes('auth')) {
          initializeAuth()
        }
        if (event.key.includes('cart')) {
          calculateCartTotals()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [initializeAuth, calculateCartTotals, initializeTenant])

  return <>{children}</>
}