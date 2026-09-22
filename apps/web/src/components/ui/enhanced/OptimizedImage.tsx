import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
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

  // A cached image can already be `complete` before React attaches onLoad, so
  // that handler never fires and the blur/fade transition stays parked at
  // opacity-50 — loaded, but rendered washed out. Check the element directly.
  const imgRef = useRef<HTMLImageElement | null>(null);

  const optimizedSrc = generateImageKitUrl(src, width, height, quality);
  // Recovery only helps if it points somewhere different. When the CDN rewrote
  // the URL, the untouched `src` is a real second chance (ImageKit down, origin
  // up). When getOptimizedUrl passed the URL straight through — any host it
  // cannot serve — `src` IS what just failed, so retrying it only re-renders the
  // browser's broken-image glyph. Fall through to the empty state instead.
  const recoverySrc = fallbackSrc || (optimizedSrc !== src ? src : undefined);
  const displaySrc = hasError ? recoverySrc : optimizedSrc;
  const hasRenderableSrc = Boolean(displaySrc);

  useEffect(() => {
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) setIsLoading(false);
  }, [displaySrc]);

  if (!hasRenderableSrc) {
    return <div className={cn('relative overflow-hidden bg-zinc-800/20', className)} aria-hidden="true" />;
  }

  return (
    <div className={cn('relative overflow-hidden bg-zinc-800/20', className)}>
      <img
        ref={imgRef}
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
