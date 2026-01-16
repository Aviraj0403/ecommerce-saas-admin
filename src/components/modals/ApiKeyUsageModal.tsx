import { X, TrendingUp, Calendar, Globe, Activity } from 'lucide-react'
import { useApiKeyUsage } from '@/hooks/useApiKeys'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ApiKey } from '@/types/apikey.types'

interface ApiKeyUsageModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: ApiKey
}

export function ApiKeyUsageModal({ isOpen, onClose, apiKey }: ApiKeyUsageModalProps) {
  const { data: usage, isLoading, error } = useApiKeyUsage(apiKey.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              API Key Usage Statistics
            </h2>
            <p className="text-sm text-gray-600 mt-1">{apiKey.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage message="Failed to load usage statistics" />
          ) : usage ? (
            <div className="space-y-6">
              {/* Usage Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {usage.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Today</p>
                      <p className="text-2xl font-bold text-green-900">
                        {usage.requestsToday.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium">This Week</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {usage.requestsThisWeek.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-600 font-medium">This Month</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {usage.requestsThisMonth.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Used */}
              {usage.lastUsedAt && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Last Activity</h3>
                  <p className="text-gray-600">
                    Last used on {formatDate(usage.lastUsedAt)}
                  </p>
                </div>
              )}

              {/* Top Endpoints Chart */}
              {usage.topEndpoints && usage.topEndpoints.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Most Used Endpoints
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={usage.topEndpoints}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="endpoint" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value, 'Requests']}
                          labelFormatter={(label) => `Endpoint: ${label}`}
                        />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* API Key Details */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Key Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Key ID</p>
                    <p className="text-sm text-gray-900 font-mono">{apiKey.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(apiKey.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      apiKey.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  {apiKey.expiresAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Expires</p>
                      <p className="text-sm text-gray-900">{formatDate(apiKey.expiresAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
                <div className="flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {permission.resource}: {permission.actions.join(', ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No usage data available</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}