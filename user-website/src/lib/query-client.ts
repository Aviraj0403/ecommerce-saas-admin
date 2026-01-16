import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized caching configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for critical data
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent cache keys
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.products.details(), slug] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
  },
  
  // Category queries
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
  },
  
  // Cart queries
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
  },
  
  // Order queries
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.orders.lists(), filters || {}] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  
  // Address queries
  addresses: {
    all: ['addresses'] as const,
    lists: () => [...queryKeys.addresses.all, 'list'] as const,
  },
  
  // Profile queries
  profile: {
    all: ['profile'] as const,
    user: () => [...queryKeys.profile.all, 'user'] as const,
  },
}

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate product data
  invalidateProducts: (productSlug?: string) => {
    if (productSlug) {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productSlug) })
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
    queryClient.invalidateQueries({ queryKey: queryKeys.products.featured() })
  },
  
  // Invalidate cart data
  invalidateCart: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.all })
  },
  
  // Invalidate order data
  invalidateOrders: (orderId?: string) => {
    if (orderId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
  },
  
  // Invalidate address data
  invalidateAddresses: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all })
  },
  
  // Invalidate profile data
  invalidateProfile: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear()
  },
}

// Prefetch helpers
export const prefetchUtils = {
  // Prefetch featured products
  prefetchFeaturedProducts: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.featured(),
      staleTime: 10 * 60 * 1000, // 10 minutes for featured products
    })
  },
  
  // Prefetch product details
  prefetchProduct: async (productSlug: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(productSlug),
      staleTime: 15 * 60 * 1000, // 15 minutes for product details
    })
  },
  
  // Prefetch categories
  prefetchCategories: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories.lists(),
      staleTime: 30 * 60 * 1000, // 30 minutes for categories
    })
  },
  
  // Prefetch user orders
  prefetchOrders: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders.lists(),
      staleTime: 2 * 60 * 1000, // 2 minutes for orders
    })
  },
}
