import Link from 'next/link'
import { usePrefetchOnHover } from '@/hooks/usePrefetch'
import { cn } from '@/lib/utils'

interface PrefetchLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  prefetch?: boolean
  onMouseEnter?: () => void
}

export function PrefetchLink({
  href,
  children,
  className,
  prefetch = true,
  onMouseEnter,
}: PrefetchLinkProps) {
  const { prefetchRoute } = usePrefetchOnHover()

  const handleMouseEnter = () => {
    if (prefetch) {
      prefetchRoute(href)
    }
    onMouseEnter?.()
  }

  return (
    <Link
      href={href}
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      prefetch={false} // We handle prefetching manually
    >
      {children}
    </Link>
  )
}

// Product link with automatic prefetching
export function ProductLink({
  productSlug,
  children,
  className,
}: {
  productSlug: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <PrefetchLink
      href={`/products/${productSlug}`}
      className={className}
    >
      {children}
    </PrefetchLink>
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
      href={`/orders/${orderId}`}
      className={className}
    >
      {children}
    </PrefetchLink>
  )
}