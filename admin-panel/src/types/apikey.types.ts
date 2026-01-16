export interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  permissions: ApiKeyPermission[]
  scopes?: string[]
  expiresAt?: string
  lastUsedAt?: string
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface ApiKeyPermission {
  resource: string
  actions: ('READ' | 'WRITE' | 'DELETE')[]
}

export interface CreateApiKeyRequest {
  name: string
  permissions: ApiKeyPermission[]
  scopes?: string[]
  expiresAt?: string
}

export interface UpdateApiKeyRequest {
  permissions: ApiKeyPermission[]
  scopes?: string[]
}

export interface ApiKeyUsageStats {
  totalRequests: number
  requestsToday: number
  requestsThisWeek: number
  requestsThisMonth: number
  lastUsedAt?: string
  topEndpoints: {
    endpoint: string
    count: number
  }[]
}

export interface ApiKeyFormData {
  name: string
  permissions: {
    products: ('READ' | 'WRITE' | 'DELETE')[]
    orders: ('READ' | 'WRITE' | 'DELETE')[]
    customers: ('READ' | 'WRITE' | 'DELETE')[]
    categories: ('READ' | 'WRITE' | 'DELETE')[]
  }
  scopes: string[]
  expiresAt: string
}

export const API_RESOURCES = [
  'products',
  'orders', 
  'customers',
  'categories'
] as const

export const API_ACTIONS = ['READ', 'WRITE', 'DELETE'] as const