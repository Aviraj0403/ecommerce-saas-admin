import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useTenantStore } from '@/store/tenant-store'
import { Tenant } from '@/types/tenant.types'
import { getTenantId } from '@/lib/tenant'

/**
 * Fetch tenant information from API
 */
export function useTenantInfo() {
  const { setTenant, setLoading, tenantId } = useTenantStore()
  
  const query = useQuery({
    queryKey: ['tenant', tenantId || getTenantId()],
    queryFn: async () => {
      const id = tenantId || getTenantId()
      return apiClient.get<Tenant>(`/tenants/${id}`)
    },
    enabled: !!tenantId || !!getTenantId(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  })

  useEffect(() => {
    setLoading(query.isLoading)
    
    if (query.data) {
      setTenant(query.data)
    }
  }, [query.data, query.isLoading, setTenant, setLoading])

  return query
}

/**
 * Apply tenant branding to the application
 */
export function useApplyBranding() {
  const { branding, tenant } = useTenantStore()

  useEffect(() => {
    // Apply CSS custom properties
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', branding.primaryColor)
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', branding.secondaryColor)
    }

    // Apply favicon
    if (branding.favicon) {
      const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (favicon) {
        favicon.href = branding.favicon
      }
    }

    // Apply page title
    if (tenant?.businessName) {
      document.title = `${tenant.businessName} - Admin Panel`
    }
  }, [branding, tenant])
}

/**
 * Get tenant logo URL
 */
export function useTenantLogo() {
  const { branding } = useTenantStore()
  return branding.logo || '/logo.png'
}

/**
 * Get tenant colors
 */
export function useTenantColors() {
  const { branding } = useTenantStore()
  return {
    primary: branding.primaryColor || '#3b82f6',
    secondary: branding.secondaryColor || '#2563eb',
  }
}

/**
 * Check if tenant has specific feature enabled
 */
export function useTenantFeature(feature: string) {
  const { tenant } = useTenantStore()
  
  if (!tenant?.subscription) return false
  
  // Check based on subscription plan
  const planFeatures: Record<string, string[]> = {
    FREE: ['basic'],
    STARTER: ['basic', 'analytics'],
    PROFESSIONAL: ['basic', 'analytics', 'api', 'custom-domain'],
    ENTERPRISE: ['basic', 'analytics', 'api', 'custom-domain', 'priority-support', 'white-label'],
  }
  
  return planFeatures[tenant.subscription.plan]?.includes(feature) || false
}

/**
 * Get tenant subscription limits
 */
export function useTenantLimits() {
  const { tenant } = useTenantStore()
  
  return {
    products: tenant?.subscription?.usage?.products?.limit || 0,
    orders: tenant?.subscription?.usage?.orders?.limit || 0,
    storage: tenant?.subscription?.usage?.storage?.limit || 0,
    apiCalls: tenant?.subscription?.usage?.apiCalls?.limit || 0,
  }
}

/**
 * Check if subscription limit is reached
 */
export function useSubscriptionLimit(limitType: 'products' | 'orders' | 'storage' | 'apiCalls') {
  const { tenant } = useTenantStore()
  
  if (!tenant?.subscription) {
    return { reached: false, usage: 0, limit: 0, percentage: 0 }
  }

  const usageData = tenant.subscription.usage?.[limitType]
  const usage = usageData?.used || 0
  const limit = usageData?.limit || 0
  const percentage = limit > 0 ? (usage / limit) * 100 : 0
  const reached = usage >= limit

  return { reached, usage, limit, percentage }
}
