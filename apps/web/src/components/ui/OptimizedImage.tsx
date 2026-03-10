import React from 'react';
import { getOptimizedUrl, TransformOptions } from '@/lib/image-optimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    transform?: TransformOptions;
}

/**
 * OptimizedImage acts as a drop-in replacement for `<img>`.
 * It passes the `src` string to our optimization utility to rewrite Supabase
 * Storage URLs to take advantage of on-the-fly image transformations.
 */
export function OptimizedImage({ src, transform, ...props }: OptimizedImageProps) {
    // Combine width/height attributes if explicitly provided but not in transform options
    const defaultTransform: TransformOptions = { ...transform };

    if (!defaultTransform.width && props.width) {
        defaultTransform.width = Number(props.width);
    }
    if (!defaultTransform.height && props.height) {
        defaultTransform.height = Number(props.height);
    }

    // Default to sensible web optimization target
    if (!defaultTransform.format) {
        defaultTransform.format = 'avif';
    }
    if (!defaultTransform.quality) {
        defaultTransform.quality = 80;
    }

    const optimizedSrc = getOptimizedUrl(src, defaultTransform);

    return <img src={optimizedSrc} loading={props.loading || "lazy"} {...props} />;
}
