import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect } from 'react'
import { prefetchUtils } from '@/lib/query-client'

// Hook for prefetching on hover
export function usePrefetchOnHover() {
  const navigate = useNavigate()

  const prefetchRoute = useCallback((path: string) => {
    // Extract ID from path for prefetching detail pages
    const orderMatch = path.match(/\/orders\/([^/?]+)/)
    if (orderMatch) {
      const orderId = orderMatch[1]
      prefetchUtils.prefetchOrder(orderId)
    }

    const customerMatch = path.match(/\/customers\/([^/?]+)/)
    if (customerMatch) {
      // Could prefetch customer data here if needed
    }

    const productMatch = path.match(/\/products\/([^/?]+)/)
    if (productMatch) {
      const productId = productMatch[1]
      prefetchUtils.prefetchProduct(productId)
    }
  }, [])

  return { prefetchRoute }
}

// Hook for prefetching related data
export function usePrefetchRelated() {
  const prefetchDashboardData = useCallback(async () => {
    await prefetchUtils.prefetchDashboard()
  }, [])

  const prefetchOrderData = useCallback(async (orderId: string) => {
    await prefetchUtils.prefetchOrder(orderId)
  }, [])

  const prefetchProductData = useCallback(async (productId: string) => {
    await prefetchUtils.prefetchProduct(productId)
  }, [])

  return {
    prefetchDashboardData,
    prefetchOrderData,
    prefetchProductData,
  }
}

// Component for prefetching on page load
export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const { prefetchDashboardData } = usePrefetchRelated()

  useEffect(() => {
    // Prefetch dashboard data on app load
    const timer = setTimeout(() => {
      prefetchDashboardData()
    }, 2000) // Delay to not interfere with initial page load

    return () => clearTimeout(timer)
  }, [prefetchDashboardData])

  return <>{children}</>
}