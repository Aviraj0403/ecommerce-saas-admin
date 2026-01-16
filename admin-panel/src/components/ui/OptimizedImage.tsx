import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  lazy?: boolean
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  lazy = true,
  quality = 75,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, shouldLoad])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      {shouldLoad ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={lazy ? 'lazy' : 'eager'}
          className={cn(
            'transition-opacity duration-300 object-cover',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div
          ref={imgRef}
          className={cn(
            'flex items-center justify-center bg-gray-100 animate-pulse',
            className
          )}
          style={{ width, height }}
        >
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      )}
      {isLoading && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      )}
    </div>
  )
}

// Product image component
export function ProductImage({
  src,
  alt,
  className,
  size = 'md',
}: {
  src: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: { width: 60, height: 60 },
    md: { width: 120, height: 120 },
    lg: { width: 200, height: 200 },
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizes[size].width}
      height={sizes[size].height}
      className={cn('rounded-lg', className)}
      quality={80}
    />
  )
}

// Avatar image component
export function AvatarImage({
  src,
  alt,
  className,
  size = 'md',
}: {
  src: string
  alt: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizes[size].width}
      height={sizes[size].height}
      className={cn('rounded-full', className)}
      quality={70}
    />
  )
}