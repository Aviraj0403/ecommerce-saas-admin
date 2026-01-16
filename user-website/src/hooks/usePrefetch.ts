import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { prefetchUtils } from '@/lib/query-client'

// Hook for prefetching on hover
export function usePrefetchOnHover() {
  const router = useRouter()

  const prefetchRoute = useCallback((href: string) => {
    // Prefetch the route
    router.prefetch(href)
    
    // Extract product slug from href if it's a product page
    const productMatch = href.match(/\/products\/([^/?]+)/)
    if (productMatch) {
      const productSlug = productMatch[1]
      prefetchUtils.prefetchProduct(productSlug)
    }
  }, [router])

  return { prefetchRoute }
}

// Hook for prefetching related data
export function usePrefetchRelated() {
  const prefetchProductData = useCallback(async (productSlug: string) => {
    await Promise.all([
      prefetchUtils.prefetchProduct(productSlug),
      prefetchUtils.prefetchCategories(),
    ])
  }, [])

  const prefetchCheckoutData = useCallback(async () => {
    await Promise.all([
      prefetchUtils.prefetchOrders(),
      // Could prefetch address data here if needed
    ])
  }, [])

  const prefetchHomeData = useCallback(async () => {
    await Promise.all([
      prefetchUtils.prefetchFeaturedProducts(),
      prefetchUtils.prefetchCategories(),
    ])
  }, [])

  return {
    prefetchProductData,
    prefetchCheckoutData,
    prefetchHomeData,
  }
}

// Hook for prefetching on mount
export function usePrefetchOnMount() {
  const { prefetchHomeData } = usePrefetchRelated()

  useEffect(() => {
    // Prefetch common data on app load
    const timer = setTimeout(() => {
      prefetchHomeData()
    }, 1000) // Delay to not interfere with initial page load

    return () => clearTimeout(timer)
  }, [prefetchHomeData])
}