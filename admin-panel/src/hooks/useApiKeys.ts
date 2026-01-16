import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/lib/toast'
import type { 
  ApiKey, 
  CreateApiKeyRequest, 
  UpdateApiKeyRequest, 
  ApiKeyUsageStats 
} from '@/types/apikey.types'

// Fetch API keys
export function useApiKeys() {
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: async (): Promise<ApiKey[]> => {
      return await apiClient.get<ApiKey[]>('/api-keys')
    },
  })
}

// Fetch API key usage statistics
export function useApiKeyUsage(keyId: string) {
  return useQuery({
    queryKey: ['apiKeyUsage', keyId],
    queryFn: async (): Promise<ApiKeyUsageStats> => {
      return await apiClient.get<ApiKeyUsageStats>(`/api-keys/${keyId}/usage`)
    },
    enabled: !!keyId,
  })
}

// Create API key
export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateApiKeyRequest): Promise<{ apiKey: ApiKey; key: string }> => {
      return await apiClient.post<{ apiKey: ApiKey; key: string }>('/api-keys', data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API key created successfully')
      return data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create API key')
    },
  })
}

// Update API key permissions
export function useUpdateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApiKeyRequest }): Promise<ApiKey> => {
      return await apiClient.put<ApiKey>(`/api-keys/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API key updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update API key')
    },
  })
}

// Revoke API key
export function useRevokeApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api-keys/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API key revoked successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke API key')
    },
  })
}

// Regenerate API key
export function useRegenerateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<{ apiKey: ApiKey; key: string }> => {
      return await apiClient.post<{ apiKey: ApiKey; key: string }>(`/api-keys/${id}/regenerate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
      toast.success('API key regenerated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to regenerate API key')
    },
  })
}