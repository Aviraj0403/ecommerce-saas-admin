import { Link } from 'react-router-dom'
import { usePrefetchOnHover } from '@/hooks/usePrefetch'
import { cn } from '@/lib/utils'

interface PrefetchLinkProps {
  to: string
  children: React.ReactNode
  className?: string
  prefetch?: boolean
  onMouseEnter?: () => void
}

export function PrefetchLink({
  to,
  children,
  className,
  prefetch = true,
  onMouseEnter,
}: PrefetchLinkProps) {
  const { prefetchRoute } = usePrefetchOnHover()

  const handleMouseEnter = () => {
    if (prefetch) {
      prefetchRoute(to)
    }
    onMouseEnter?.()
  }

  return (
    <Link
      to={to}
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  )
}

// Order link with automatic prefetching
export function OrderLink({
  orderId,
  children,
  className,
}: {
  orderId: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <PrefetchLink
      to={`/orders/${orderId}`}
      className={className}
    >
      {children}
    </PrefetchLink>
  )
}

// Customer link with automatic prefetching
export function CustomerLink({
  customerId,
  children,
  className,
}: {
  customerId: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <PrefetchLink
      to={`/customers/${customerId}`}
      className={className}
    >
      {children}
    </PrefetchLink>
  )
}

// Product link with automatic prefetching
export function ProductLink({
  productId,
  children,
  className,
}: {
  productId: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <PrefetchLink
      to={`/products/${productId}`}
      className={className}
    >
      {children}
    </PrefetchLink>
  )
}