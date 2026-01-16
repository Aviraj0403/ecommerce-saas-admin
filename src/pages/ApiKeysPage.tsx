import { useState } from 'react'
import { Plus, Eye, EyeOff, Copy, Edit, Trash2, BarChart3, RefreshCw } from 'lucide-react'
import { useApiKeys, useRevokeApiKey, useRegenerateApiKey } from '@/hooks/useApiKeys'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { CreateApiKeyModal } from '@/components/modals/CreateApiKeyModal'
import { EditApiKeyModal } from '@/components/modals/EditApiKeyModal'
import { ApiKeyUsageModal } from '@/components/modals/ApiKeyUsageModal'
import { toast } from '@/lib/toast'
import type { ApiKey } from '@/types/apikey.types'

export default function ApiKeysPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [viewingUsage, setViewingUsage] = useState<ApiKey | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null)

  const { data: apiKeys, isLoading, error } = useApiKeys()
  const revokeApiKey = useRevokeApiKey()
  const regenerateApiKey = useRegenerateApiKey()

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleRevoke = async (key: ApiKey) => {
    if (window.confirm(`Are you sure you want to revoke the API key "${key.name}"? This action cannot be undone.`)) {
      revokeApiKey.mutate(key.id)
    }
  }

  const handleRegenerate = async (key: ApiKey) => {
    if (window.confirm(`Are you sure you want to regenerate the API key "${key.name}"? The old key will stop working immediately.`)) {
      setRegeneratingKey(key.id)
      try {
        const result = await regenerateApiKey.mutateAsync(key.id)
        // Show the new key in a modal or alert
        const newKey = result.key
        if (window.confirm(`New API key generated successfully!\n\nKey: ${newKey}\n\nClick OK to copy to clipboard. This is the only time you'll see the full key.`)) {
          await copyToClipboard(newKey)
        }
      } finally {
        setRegeneratingKey(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (key: ApiKey) => {
    if (!key.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Revoked</span>
    }
    
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Expired</span>
    }
    
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorMessage message="Failed to load API keys" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">Manage API keys for programmatic access to your store</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      {!apiKeys?.length ? (
        <EmptyState
          title="No API keys found"
          description="Create your first API key to start integrating with external systems"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create API Key
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        <div className="text-sm text-gray-500">
                          Created {formatDate(key.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {visibleKeys.has(key.id) ? key.key : key.maskedKey}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(visibleKeys.has(key.id) ? key.key : key.maskedKey)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {permission.resource}: {permission.actions.join(', ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(key)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {key.usageCount.toLocaleString()} requests
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingUsage(key)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Usage"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        {key.isActive && (
                          <>
                            <button
                              onClick={() => setEditingKey(key)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Permissions"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRegenerate(key)}
                              disabled={regeneratingKey === key.id}
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              title="Regenerate Key"
                            >
                              <RefreshCw className={`w-4 h-4 ${regeneratingKey === key.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleRevoke(key)}
                              className="text-red-600 hover:text-red-900"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateApiKeyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingKey && (
        <EditApiKeyModal
          isOpen={!!editingKey}
          onClose={() => setEditingKey(null)}
          apiKey={editingKey}
        />
      )}

      {viewingUsage && (
        <ApiKeyUsageModal
          isOpen={!!viewingUsage}
          onClose={() => setViewingUsage(null)}
          apiKey={viewingUsage}
        />
      )}
    </div>
  )
}