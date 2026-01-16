import { Suspense } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface DynamicLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function DynamicLoader({ 
  children, 
  fallback,
  className = "flex items-center justify-center min-h-[200px]"
}: DynamicLoaderProps) {
  const defaultFallback = (
    <div className={className}>
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withDynamicLoader<T extends object>(
  Component: React.ComponentType<T>,
  loaderProps?: Partial<DynamicLoaderProps>
) {
  return function DynamicComponent(props: T) {
    return (
      <DynamicLoader {...loaderProps}>
        <Component {...props} />
      </DynamicLoader>
    )
  }
}