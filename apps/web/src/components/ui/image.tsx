import * as React from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  imageClassName?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, imageClassName, src, alt, fallbackSrc, ...props }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    React.useEffect(() => {
      if (!src) return;

      const img = new window.Image();
      img.src = src;

      img.onload = () => {
        setIsLoading(false);
      };

      img.onerror = () => {
        setIsLoading(false);
        setError(true);
      };
    }, [src]);

    return (
      <div className={cn("relative overflow-hidden w-full h-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          ref={ref}
          src={error && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          loading="lazy"
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
