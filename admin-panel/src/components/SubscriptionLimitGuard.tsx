import { ReactNode } from 'react'
import { AlertTriangle, ArrowUpCircle } from 'lucide-react'
import { useSubscriptionLimit } from '@/hooks/useTenant'
import { useTenantStore } from '@/store/tenant-store'
import { Link } from 'react-router-dom'

interface SubscriptionLimitGuardProps {
  limitType: 'products' | 'orders' | 'storage' | 'apiCalls'
  children: ReactNode
  fallback?: ReactNode
  showWarning?: boolean
}

export function SubscriptionLimitGuard({
  limitType,
  children,
  fallback,
  showWarning = true,
}: SubscriptionLimitGuardProps) {
  const { reached, usage, limit, percentage } = useSubscriptionLimit(limitType)

  // If limit is reached, show fallback or upgrade prompt
  if (reached) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          {getLimitTitle(limitType)} Limit Reached
        </h3>
        <p className="text-red-700 mb-4">
          You've reached your plan limit of {limit} {limitType}. Upgrade your plan to continue.
        </p>
        <Link
          to="/subscription"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <ArrowUpCircle className="w-5 h-5" />
          Upgrade Plan
        </Link>
      </div>
    )
  }

  // Show warning if usage is above 90%
  if (showWarning && percentage >= 90) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Approaching {getLimitTitle(limitType)} Limit
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                You're using {usage} of {limit} {limitType} ({percentage.toFixed(0)}%). Consider upgrading your plan.
              </p>
              <Link
                to="/subscription"
                className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
        {children}
      </div>
    )
  }

  return <>{children}</>
}

function getLimitTitle(limitType: string): string {
  const titles: Record<string, string> = {
    products: 'Product',
    orders: 'Order',
    storage: 'Storage',
    apiCalls: 'API Call',
    users: 'User',
  }
  return titles[limitType] || limitType
}

/**
 * Hook to check if an action is allowed based on subscription limits
 */
export function useCanPerformAction(limitType: 'products' | 'orders' | 'storage' | 'apiCalls') {
  const { reached } = useSubscriptionLimit(limitType)
  return !reached
}

/**
 * Component to show subscription limit warning banner
 */
export function SubscriptionLimitBanner() {
  const { tenant } = useTenantStore()
  
  if (!tenant?.subscription) return null

  const limits = [
    { type: 'products' as const, label: 'Products' },
    { type: 'orders' as const, label: 'Orders' },
    { type: 'storage' as const, label: 'Storage' },
    { type: 'apiCalls' as const, label: 'API Calls' },
  ]

  const warnings = limits
    .map(({ type, label }) => {
      const usageData = tenant.subscription.usage?.[type]
      const usage = usageData?.used || 0
      const limit = usageData?.limit || 0
      const percentage = limit > 0 ? (usage / limit) * 100 : 0
      
      if (percentage >= 90) {
        return { type, label, usage, limit, percentage }
      }
      return null
    })
    .filter(Boolean)

  if (warnings.length === 0) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Subscription Limits Warning</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning) => (
                <li key={warning!.type}>
                  {warning!.label}: {warning!.usage} / {warning!.limit} ({warning!.percentage.toFixed(0)}%)
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3">
            <Link
              to="/subscription"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Upgrade your plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
