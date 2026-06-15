import React, { useState, useEffect, forwardRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedUrl, getOptimizedSrcSet } from "@/lib/cdn";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  quality?: number;
  fetchPriority?: "high" | "low" | "auto";
  widths?: number[];
  sizes?: string;
  srcSet?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ className, imageClassName, src, alt, fallbackSrc, width, height, quality, onLoad, onError, fetchPriority, widths, sizes, srcSet: explicitSrcSet, ...props }, ref) => {
    const optimizedSrc = getOptimizedUrl(src, { width, height, quality });
    const autoSrcSet = explicitSrcSet || (src ? getOptimizedSrcSet(src, widths, { quality }) : "");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const displaySrc = error ? (fallbackSrc || src || optimizedSrc) : optimizedSrc;
    const hasRenderableSrc = Boolean(displaySrc);

    useEffect(() => {
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
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        <img
          ref={ref}
          src={displaySrc}
          srcSet={autoSrcSet || undefined}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority={fetchPriority}
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
