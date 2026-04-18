import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedUrl } from '@/lib/cdn';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  /** className applied to the outer wrapper div */
  className?: string;
  /** className applied directly to the <img> element (separate from wrapper) */
  imageClassName?: string;
  fallbackSrc?: string;
}

export function generateImageKitUrl(originalUrl: string, width?: number, height?: number, quality: number = 80): string {
  return getOptimizedUrl(originalUrl, { width, height, quality });
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  quality = 80, 
  className,
  imageClassName,
  fallbackSrc,
  ...props 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const optimizedSrc = generateImageKitUrl(src, width, height, quality);
  const displaySrc = hasError ? (fallbackSrc || src) : optimizedSrc;
  const hasRenderableSrc = Boolean(displaySrc);

  if (!hasRenderableSrc) {
    return <div className={cn('relative overflow-hidden bg-zinc-800/20', className)} aria-hidden="true" />;
  }

  return (
    <div className={cn('relative overflow-hidden bg-zinc-800/20', className)}>
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          isLoading ? 'scale-[1.02] blur-sm opacity-50' : 'scale-100 blur-0 opacity-100',
          imageClassName
        )}
        {...props}
      />
    </div>
  );
}
