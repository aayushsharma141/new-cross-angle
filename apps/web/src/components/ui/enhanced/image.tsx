import React, { useState, useEffect, useRef, useCallback, forwardRef, ImgHTMLAttributes } from "react";
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
    // Recovery only helps if it points somewhere different. When the CDN
    // rewrote the URL, the untouched `src` is a real second chance (ImageKit
    // down, origin up). When `getOptimizedUrl` passed the URL straight through
    // — any host it cannot serve — `src` IS what just failed, and retrying it
    // only re-renders the browser's broken-image glyph. In that case we fall
    // through to the same empty state used when there is no src at all.
    const recoverySrc = fallbackSrc || (optimizedSrc !== src ? src : undefined);
    const displaySrc = error ? recoverySrc : optimizedSrc;
    // A srcSet with `w` descriptors wins over `src` — the browser picks its
    // candidate from that list and never looks at `src`. Keeping the failed
    // candidates here would silently defeat the recovery above, so drop the
    // srcSet once the optimized source has errored.
    const displaySrcSet = error ? undefined : (autoSrcSet || undefined);
    const hasRenderableSrc = Boolean(displaySrc);

    // A cached image can already be `complete` before React attaches onLoad, so
    // that handler never fires and the fade-in stays parked at opacity-0 — the
    // image is fully loaded but invisible. Check the element directly instead of
    // trusting the event alone.
    const innerRef = useRef<HTMLImageElement | null>(null);
    const setRefs = useCallback(
      (node: HTMLImageElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
      },
      [ref],
    );

    useEffect(() => {
      setError(false);
      const node = innerRef.current;
      if (node?.complete && node.naturalWidth > 0) setIsLoading(false);
      else setIsLoading(Boolean(src));
    }, [src, displaySrc]);

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
          ref={setRefs}
          src={displaySrc}
          srcSet={displaySrcSet}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          // React 18 does not recognise camelCase fetchPriority on a DOM node —
          // the HTML attribute is all-lowercase. Same spread used in Hero,
          // HubHero and HeroPattern; can become a plain prop on React 19.
          {...(fetchPriority ? ({ fetchpriority: fetchPriority } as any) : {})}
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
