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
    if (typeof window === 'undefined') return

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
      document.title = tenant.businessName
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
    primary: branding.primaryColor || '#22c55e',
    secondary: branding.secondaryColor || '#16a34a',
  }
}

/**
 * Check if tenant has specific feature enabled
 */
export function useTenantFeature(feature: string) {
  const { tenant } = useTenantStore()
  
  if (!tenant?.subscription) return false
  
  // Feature availability based on plan
  const planFeatures: Record<string, string[]> = {
    FREE: ['basic'],
    STARTER: ['basic', 'analytics'],
    PROFESSIONAL: ['basic', 'analytics', 'api', 'custom_domain'],
    ENTERPRISE: ['basic', 'analytics', 'api', 'custom_domain', 'priority_support'],
  }
  
  return planFeatures[tenant.subscription.plan]?.includes(feature) || false
}

/**
 * Get tenant subscription limits
 */
export function useTenantLimits() {
  const { tenant } = useTenantStore()
  
  // Default limits based on plan
  const planLimits: Record<string, any> = {
    FREE: { products: 10, orders: 100, storage: 1, apiCalls: 1000 },
    STARTER: { products: 100, orders: 1000, storage: 10, apiCalls: 10000 },
    PROFESSIONAL: { products: 1000, orders: 10000, storage: 100, apiCalls: 100000 },
    ENTERPRISE: { products: -1, orders: -1, storage: -1, apiCalls: -1 },
  }
  
  const plan = tenant?.subscription?.plan || 'FREE'
  return planLimits[plan] || planLimits.FREE
}
