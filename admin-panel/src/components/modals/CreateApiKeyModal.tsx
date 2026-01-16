import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Copy, Check } from 'lucide-react'
import { useCreateApiKey } from '@/hooks/useApiKeys'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { API_RESOURCES, API_ACTIONS } from '@/types/apikey.types'
import type { ApiKeyFormData } from '@/types/apikey.types'

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  permissions: z.object({
    products: z.array(z.enum(['READ', 'WRITE', 'DELETE'])).min(0),
    orders: z.array(z.enum(['READ', 'WRITE', 'DELETE'])).min(0),
    customers: z.array(z.enum(['READ', 'WRITE', 'DELETE'])).min(0),
    categories: z.array(z.enum(['READ', 'WRITE', 'DELETE'])).min(0),
  }).refine(
    (permissions) => {
      return Object.values(permissions).some(actions => actions.length > 0)
    },
    { message: 'At least one permission must be selected' }
  ),
  scopes: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
})

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateApiKeyModal({ isOpen, onClose }: CreateApiKeyModalProps) {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const createApiKey = useCreateApiKey()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      permissions: {
        products: [],
        orders: [],
        customers: [],
        categories: [],
      },
      scopes: [],
      expiresAt: '',
    },
  })

  const watchedPermissions = watch('permissions')

  const handlePermissionChange = (resource: string, action: string, checked: boolean) => {
    const currentActions = watchedPermissions[resource as keyof typeof watchedPermissions] || []
    let newActions: string[]
    
    if (checked) {
      newActions = [...currentActions, action]
    } else {
      newActions = currentActions.filter(a => a !== action)
    }
    
    setValue(`permissions.${resource}` as any, newActions)
  }

  const onSubmit = async (data: ApiKeyFormData) => {
    try {
      // Transform form data to API format
      const permissions = Object.entries(data.permissions)
        .filter(([_, actions]) => actions.length > 0)
        .map(([resource, actions]) => ({
          resource,
          actions: actions as ('READ' | 'WRITE' | 'DELETE')[]
        }))

      const result = await createApiKey.mutateAsync({
        name: data.name,
        permissions,
        scopes: data.scopes?.length ? data.scopes : undefined,
        expiresAt: data.expiresAt || undefined,
      })

      setGeneratedKey(result.key)
    } catch (error) {
      // Error handled by the hook
    }
  }

  const copyToClipboard = async () => {
    if (generatedKey) {
      try {
        await navigator.clipboard.writeText(generatedKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy to clipboard:', error)
      }
    }
  }

  const handleClose = () => {
    reset()
    setGeneratedKey(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {generatedKey ? 'API Key Created' : 'Create API Key'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {generatedKey ? (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                API Key Created Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Please copy your API key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
                <code className="flex-1 text-sm font-mono break-all">
                  {generatedKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* API Key Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key Name *
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="e.g., Mobile App Integration"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions *
              </label>
              <div className="space-y-4">
                {API_RESOURCES.map((resource) => (
                  <div key={resource} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {resource}
                    </h4>
                    <div className="flex gap-4">
                      {API_ACTIONS.map((action) => (
                        <label key={action} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={watchedPermissions[resource]?.includes(action) || false}
                            onChange={(e) => handlePermissionChange(resource, action, e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{action}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {errors.permissions && (
                <p className="mt-1 text-sm text-red-600">{errors.permissions.message}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                {...register('expiresAt')}
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for no expiration
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                Create API Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}