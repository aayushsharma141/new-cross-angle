/**
 * Utility to convert standard Supabase Storage public URLs into optimized image URLs
 * leveraging Supabase's built-in Image Transformations.
 * 
 * Supabase transforms `/object/public/` to `/render/image/public/` and accepts
 * query parameters like `width`, `height`, `quality`, and `format`.
 */

export interface TransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'origin' | 'avif';
    resize?: 'cover' | 'contain' | 'fill';
}

export function getOptimizedUrl(originalUrl: string, options: TransformOptions = {}): string {
    if (!originalUrl || typeof originalUrl !== 'string') return originalUrl;

    // We only want to transform urls that are from our Supabase instance's storage.
    if (!originalUrl.includes('.supabase.co/storage/v1/object/public/')) {
        return originalUrl;
    }

    // Replace standard object path with render/image path
    const baseUrl = originalUrl.replace('/object/public/', '/render/image/public/');

    const url = new URL(baseUrl);

    if (options.width) url.searchParams.set('width', options.width.toString());
    if (options.height) url.searchParams.set('height', options.height.toString());
    if (options.quality) url.searchParams.set('quality', options.quality.toString());
    if (options.format) url.searchParams.set('format', options.format);
    if (options.resize) url.searchParams.set('resize', options.resize);

    return url.toString();
}
