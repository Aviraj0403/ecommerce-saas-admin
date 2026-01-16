'use client'

import { useEffect } from 'react'
import { useApplyBranding, useTenantInfo } from '@/hooks/useTenant'

interface TenantBrandingProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that fetches and applies tenant branding
 */
export function TenantBrandingProvider({ children }: TenantBrandingProviderProps) {
  // Fetch tenant information
  const { data: tenant, isLoading, error } = useTenantInfo()
  
  // Apply branding when tenant data is available
  useApplyBranding()

  // Log tenant information in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && tenant) {
      console.log('Tenant loaded:', {
        id: tenant.id,
        businessName: tenant.businessName,
        branding: tenant.branding,
      })
    }
  }, [tenant])

  // Show loading state (optional)
  if (isLoading) {
    return <>{children}</>
  }

  // Show error state (optional)
  if (error) {
    console.error('Failed to load tenant:', error)
    return <>{children}</>
  }

  return <>{children}</>
}
