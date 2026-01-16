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
  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
    revenue: (period: string) => [...queryKeys.dashboard.all, 'revenue', period] as const,
    recentOrders: () => [...queryKeys.dashboard.all, 'recent-orders'] as const,
    topProducts: () => [...queryKeys.dashboard.all, 'top-products'] as const,
  },
  
  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  
  // Order queries
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.orders.lists(), filters] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.orders.details(), id] as const,
  },
  
  // Customer queries
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    analytics: (id: string) => [...queryKeys.customers.detail(id), 'analytics'] as const,
  },
  
  // Category queries
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...queryKeys.categories.lists(), filters || {}] as const,
  },
  
  // Report queries
  reports: {
    all: ['reports'] as const,
    sales: (dateRange: { from: string; to: string }) => [...queryKeys.reports.all, 'sales', dateRange] as const,
    products: (dateRange: { from: string; to: string }) => [...queryKeys.reports.all, 'products', dateRange] as const,
    customers: (dateRange: { from: string; to: string }) => [...queryKeys.reports.all, 'customers', dateRange] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    business: () => [...queryKeys.settings.all, 'business'] as const,
    branding: () => [...queryKeys.settings.all, 'branding'] as const,
    payment: () => [...queryKeys.settings.all, 'payment'] as const,
    delivery: () => [...queryKeys.settings.all, 'delivery'] as const,
  },
  
  // Subscription queries
  subscription: {
    all: ['subscription'] as const,
    current: () => [...queryKeys.subscription.all, 'current'] as const,
    plans: () => [...queryKeys.subscription.all, 'plans'] as const,
    usage: () => [...queryKeys.subscription.all, 'usage'] as const,
  },
  
  // API Keys queries
  apiKeys: {
    all: ['api-keys'] as const,
    lists: () => [...queryKeys.apiKeys.all, 'list'] as const,
    usage: (keyId: string) => [...queryKeys.apiKeys.all, 'usage', keyId] as const,
  },
}

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all dashboard data
  invalidateDashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  },
  
  // Invalidate specific product data
  invalidateProduct: (productId?: string) => {
    if (productId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) })
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
  },
  
  // Invalidate order data
  invalidateOrders: (orderId?: string) => {
    if (orderId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() })
    // Also invalidate dashboard as it shows recent orders
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recentOrders() })
  },
  
  // Invalidate customer data
  invalidateCustomers: (customerId?: string) => {
    if (customerId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(customerId) })
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.lists() })
  },
  
  // Invalidate all reports
  invalidateReports: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear()
  },
}

// Prefetch helpers
export const prefetchUtils = {
  // Prefetch dashboard data
  prefetchDashboard: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.metrics(),
        staleTime: 2 * 60 * 1000, // 2 minutes for dashboard metrics
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.recentOrders(),
        staleTime: 1 * 60 * 1000, // 1 minute for recent orders
      }),
    ])
  },
  
  // Prefetch product details
  prefetchProduct: async (productId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(productId),
      staleTime: 10 * 60 * 1000, // 10 minutes for product details
    })
  },
  
  // Prefetch order details
  prefetchOrder: async (orderId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.orders.detail(orderId),
      staleTime: 2 * 60 * 1000, // 2 minutes for order details
    })
  },
}
