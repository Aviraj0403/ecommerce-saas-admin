import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useUpdateApiKey } from '@/hooks/useApiKeys'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { API_RESOURCES, API_ACTIONS } from '@/types/apikey.types'
import type { ApiKey } from '@/types/apikey.types'

const updateApiKeySchema = z.object({
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
})

interface EditApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  apiKey: ApiKey
}

interface FormData {
  permissions: {
    products: ('READ' | 'WRITE' | 'DELETE')[]
    orders: ('READ' | 'WRITE' | 'DELETE')[]
    customers: ('READ' | 'WRITE' | 'DELETE')[]
    categories: ('READ' | 'WRITE' | 'DELETE')[]
  }
  scopes: string[]
}

export function EditApiKeyModal({ isOpen, onClose, apiKey }: EditApiKeyModalProps) {
  const updateApiKey = useUpdateApiKey()

  // Transform API key permissions to form format
  const getInitialPermissions = () => {
    const permissions = {
      products: [] as ('READ' | 'WRITE' | 'DELETE')[],
      orders: [] as ('READ' | 'WRITE' | 'DELETE')[],
      customers: [] as ('READ' | 'WRITE' | 'DELETE')[],
      categories: [] as ('READ' | 'WRITE' | 'DELETE')[],
    }

    apiKey.permissions.forEach(permission => {
      if (permission.resource in permissions) {
        permissions[permission.resource as keyof typeof permissions] = permission.actions
      }
    })

    return permissions
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(updateApiKeySchema),
    defaultValues: {
      permissions: getInitialPermissions(),
      scopes: apiKey.scopes || [],
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

  const onSubmit = async (data: FormData) => {
    try {
      // Transform form data to API format
      const permissions = Object.entries(data.permissions)
        .filter(([_, actions]) => actions.length > 0)
        .map(([resource, actions]) => ({
          resource,
          actions: actions as ('READ' | 'WRITE' | 'DELETE')[]
        }))

      await updateApiKey.mutateAsync({
        id: apiKey.id,
        data: {
          permissions,
          scopes: data.scopes?.length ? data.scopes : undefined,
        }
      })

      onClose()
    } catch (error) {
      // Error handled by the hook
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit API Key Permissions
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* API Key Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-1">{apiKey.name}</h3>
            <p className="text-sm text-gray-600">
              Key: <code className="bg-white px-2 py-1 rounded text-xs">{apiKey.maskedKey}</code>
            </p>
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

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scopes (Optional)
            </label>
            <textarea
              {...register('scopes')}
              placeholder="Enter scopes separated by commas (e.g., store:read, orders:write)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional scopes to further restrict API access
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
              Update Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}