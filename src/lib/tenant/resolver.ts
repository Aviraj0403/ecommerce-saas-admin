// Tenant resolution utilities for multi-tenant admin panel

export interface TenantResolution {
  tenantId: string
  source: 'subdomain' | 'custom-domain' | 'env' | 'storage'
  domain: string
}

/**
 * Resolve tenant ID from various sources
 * Priority: subdomain > custom domain > localStorage > environment variable
 */
export function resolveTenant(): TenantResolution {
  const hostname = window.location.hostname
  const storedTenantId = localStorage.getItem('tenant_id')
  const envTenantId = import.meta.env.VITE_PROJECT_ID || 'default'

  // 1. Try subdomain resolution (e.g., tenant1-admin.gkstore.com)
  const subdomainMatch = hostname.match(/^([^.]+)\./)
  if (subdomainMatch && !['www', 'localhost'].includes(subdomainMatch[1])) {
    const tenantId = subdomainMatch[1].replace('-admin', '')
    // Store for future use
    localStorage.setItem('tenant_id', tenantId)
    return {
      tenantId,
      source: 'subdomain',
      domain: hostname
    }
  }

  // 2. Try custom domain resolution
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    const customDomainTenant = getCustomDomainTenant(hostname)
    if (customDomainTenant) {
      localStorage.setItem('tenant_id', customDomainTenant)
      return {
        tenantId: customDomainTenant,
        source: 'custom-domain',
        domain: hostname
      }
    }
  }

  // 3. Use stored tenant ID from localStorage
  if (storedTenantId) {
    return {
      tenantId: storedTenantId,
      source: 'storage',
      domain: hostname
    }
  }

  // 4. Fallback to environment variable
  return {
    tenantId: envTenantId,
    source: 'env',
    domain: hostname
  }
}

/**
 * Get tenant ID for custom domain
 */
function getCustomDomainTenant(domain: string): string | null {
  const customDomains = localStorage.getItem('custom_domain_mapping')
  if (customDomains) {
    try {
      const mapping = JSON.parse(customDomains)
      return mapping[domain] || null
    } catch (error) {
      console.error('Failed to parse custom domain mapping:', error)
      return null
    }
  }
  return null
}

/**
 * Store custom domain mapping
 */
export function setCustomDomainMapping(domain: string, tenantId: string): void {
  const customDomains = localStorage.getItem('custom_domain_mapping')
  let mapping: Record<string, string> = {}

  if (customDomains) {
    try {
      mapping = JSON.parse(customDomains)
    } catch (error) {
      console.error('Failed to parse custom domain mapping:', error)
    }
  }

  mapping[domain] = tenantId
  localStorage.setItem('custom_domain_mapping', JSON.stringify(mapping))
}

/**
 * Set tenant ID manually
 */
export function setTenantId(tenantId: string): void {
  localStorage.setItem('tenant_id', tenantId)
}

/**
 * Get current tenant ID
 */
export function getTenantId(): string {
  const resolution = resolveTenant()
  return resolution.tenantId
}

/**
 * Clear tenant data
 */
export function clearTenantData(): void {
  localStorage.removeItem('tenant_id')
  localStorage.removeItem('custom_domain_mapping')
}

/**
 * Validate tenant ID format
 */
export function isValidTenantId(tenantId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(tenantId) && tenantId.length >= 3 && tenantId.length <= 50
}

/**
 * Get tenant info from API
 */
export async function fetchTenantInfo(tenantId: string): Promise<any> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/api/tenants/${tenantId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant info: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch tenant info:', error)
    throw error
  }
}

/**
 * Initialize tenant resolution on app startup
 */
export function initializeTenantResolution(): TenantResolution {
  const resolution = resolveTenant()
  
  console.log('Admin tenant resolved:', {
    tenantId: resolution.tenantId,
    source: resolution.source,
    domain: resolution.domain
  })

  return resolution
}
