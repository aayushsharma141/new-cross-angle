/**
 * ImageKit CDN Utility
 * --------------------
 * 
 * ─── RECOMMENDED: Web Folder Origin Configuration ────────────────────────────
 *  This is the most reliable setup for Supabase.
 * 
 *  Origin Type : Web Folder
 *  Base URL    : https://iuuivmwqodefdrrrewol.supabase.co/storage/v1/object/public/
 *  
 *  This avoids S3-compatibility issues with buckets, folders, and access keys.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const IMAGEKIT_URL_ENDPOINT =
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/wdrs8y61o/cross-angle';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://iuuivmwqodefdrrrewol.supabase.co';

interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  blur?: number;
  format?: 'webp' | 'avif' | 'auto';
}

const stripLeadingSlash = (value: string) => value.replace(/^\/+/, '');

const buildTransform = ({ width, height, quality = 80, blur, format = 'auto' }: OptimizationOptions) => {
  // 'auto' lets ImageKit pick the best format (AVIF > WebP > original).
  // Explicitly passing 'avif' forces AVIF for maximum compression.
  let t = `tr:q-${quality},f-${format},pr-true`;
  if (width)  t += `,w-${width}`;
  if (height) t += `,h-${height}`;
  if (blur)   t += `,bl-${blur}`;
  return t;
};

/**
 * Transforms a Supabase Storage public URL into an ImageKit delivery URL.
 */
export const getOptimizedUrl = (url: string | undefined, options: OptimizationOptions = {}): string => {
  if (!url) return '';

  // Pass-through: data URIs, blob URLs, and already optimized URLs with different patterns
  const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');
  if (isDataOrBlob) return url;

  const isSupabase = url.includes(SUPABASE_URL);
  const isImageKit = url.includes('ik.imagekit.io');
  // Local static assets under /images/
  const isLocalImage = url.startsWith('/images/') || url.startsWith('/images');

  // BYPASS ImageKit for local images in development mode or if explicitly disabled
  const shouldBypass = isLocalImage && (import.meta.env.DEV || import.meta.env.VITE_BYPASS_IMAGEKIT === 'true');

  if ((!isSupabase && !isImageKit && !isLocalImage) || shouldBypass) return url;

  const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/+$/, '');
  
  // 1. Identify account ID and sub-path from the endpoint
  const endpointMatch = endpoint.match(/^https?:\/\/ik\.imagekit\.io\/([^/]+)(.*)$/);
  const accountId = endpointMatch ? endpointMatch[1] : '';
  const endpointSubfolder = endpointMatch ? stripLeadingSlash(endpointMatch[2]) : '';

  let path = '';

  if (isSupabase) {
    const publicIdx = url.indexOf('/storage/v1/object/public/');
    if (publicIdx !== -1) {
      path = stripLeadingSlash(url.slice(publicIdx + '/storage/v1/object/public/'.length));
    } else {
      return url;
    }
  } else if (isLocalImage) {
    path = stripLeadingSlash(url);
  } else if (isImageKit) {
    const ikBasePattern = new RegExp(`^https?://ik\\.imagekit\\.io/${accountId}/`);
    const withoutBase = url.replace(ikBasePattern, '');
    // Strip existing transformations if any
    path = withoutBase.replace(/^tr:[^/]+\//, '');
  }

  // 2. DE-DUPLICATE: If the path already contains the endpoint's subfolder at the start, remove it.
  // This handles cases where VITE_IMAGEKIT_URL_ENDPOINT=".../cross-angle" 
  // and Supabase path is "cross-angle/image.jpg"
  if (endpointSubfolder && path.startsWith(endpointSubfolder + '/')) {
    path = stripLeadingSlash(path.slice(endpointSubfolder.length));
  } else if (endpointSubfolder && path === endpointSubfolder) {
    path = '';
  }

  if (!path) return url;

  const transformations = buildTransform(options);
  
  // 3. CONSTRUCT: [endpoint] / [transformations] / [path]
  // We use the cleaned endpoint and path to ensure no double slashes
  return `${endpoint}/${transformations}/${path}`.replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Generates a responsive srcset string from a Supabase/ImageKit URL.
 *
 * Usage:
 *   <img
 *     src={getOptimizedUrl(url, { width: 800 })}
 *     srcSet={getOptimizedSrcSet(url, [320, 640, 960, 1280, 1920])}
 *     sizes="(max-width: 768px) 100vw, 50vw"
 *   />
 */
export const getOptimizedSrcSet = (
  url: string | undefined,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<OptimizationOptions, 'width'> = {},
): string => {
  if (!url) return '';
  return widths
    .map(w => `${getOptimizedUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
};

/**
 * Returns a low-quality image placeholder (LQIP) URL — a 20px-wide blurred
 * thumbnail for use as a `src` before the full image loads.
 *
 * Usage:
 *   const lqip = getBlurPlaceholder(imageUrl);
 *   <img src={lqip} ... />
 */
export const getBlurPlaceholder = (
  url: string | undefined,
  blurAmount = 10,
): string => {
  return getOptimizedUrl(url, { width: 20, quality: 20, blur: blurAmount, format: 'webp' });
};
