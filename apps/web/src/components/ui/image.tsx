import * as React from "react";
import { cn } from "@/lib/utils";
import { getOptimizedUrl } from "@/lib/cdn";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, imageClassName, src, alt, fallbackSrc, width, height, quality, onLoad, onError, ...props }, ref) => {
    const optimizedSrc = getOptimizedUrl(src, { width, height, quality });
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const displaySrc = error ? (fallbackSrc || src || optimizedSrc) : optimizedSrc;
    const hasRenderableSrc = Boolean(displaySrc);

    React.useEffect(() => {
      setIsLoading(Boolean(src));
      setError(false);
    }, [src]);

    if (!hasRenderableSrc) {
      return (
        <div
          className={cn("relative overflow-hidden w-full h-full bg-muted/20", className)}
          aria-hidden="true"
        />
      );
    }

    return (
      <div className={cn("relative overflow-hidden w-full h-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          ref={ref}
          src={displaySrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            setIsLoading(false);
            onLoad?.(event);
          }}
          onError={(event) => {
            setIsLoading(false);
            setError(true);
            onError?.(event);
          }}
          className={cn(
            "transition-opacity duration-300 w-full h-full object-cover",
            isLoading ? "opacity-0" : "opacity-100",
            imageClassName
          )}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = "Image";
