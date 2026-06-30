/**
 * ImageKit CDN Utility
 * --------------------
 * 
 * Unified image optimization layer. After migrating all media to ImageKit,
 * this utility handles Direct ImageKit URLs, Supabase URLs (legacy), and
 * local static assets.
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

const buildTransform = ({ width, height, quality = 80, blur, format = 'webp' }: OptimizationOptions) => {
  let t = `tr:q-${quality},f-${format},pr-true`;
  if (width)  t += `,w-${width}`;
  if (height) t += `,h-${height}`;
  if (blur)   t += `,bl-${blur}`;
  return t;
};

/**
 * Transforms any URL into an optimized ImageKit delivery URL.
 * Works with:
 * - Direct ImageKit URLs (ik.imagekit.io)
 * - Legacy Supabase Storage URLs
 * - Local /images/ assets
 */
export const getOptimizedUrl = (url: string | undefined, options: OptimizationOptions = {}): string => {
  if (!url || typeof url !== 'string') return '';

  const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');
  if (isDataOrBlob) return url;

  const isImageKit = url.includes('ik.imagekit.io');
  const isSupabase = url.includes(SUPABASE_URL);
  const isLocalImage = url.startsWith('/images/');

  const shouldBypass = import.meta.env.DEV || import.meta.env.VITE_BYPASS_IMAGEKIT === 'true';

  if ((!isImageKit && !isSupabase && !isLocalImage) || shouldBypass) return url;

  const endpoint = IMAGEKIT_URL_ENDPOINT.replace(/\/+$/, '');
  const endpointMatch = endpoint.match(/^https?:\/\/ik\.imagekit\.io\/([^/]+)(.*)$/);
  const accountId = endpointMatch ? endpointMatch[1] : '';
  const endpointSubfolder = endpointMatch ? stripLeadingSlash(endpointMatch[2]) : '';

  let path = '';

  if (isImageKit) {
    const ikBasePattern = new RegExp(`^https?://ik\\.imagekit\\.io/${accountId}/`);
    const withoutBase = url.replace(ikBasePattern, '');
    path = withoutBase.replace(/^tr:[^/]+\//, '');
  } else if (isSupabase) {
    const publicIdx = url.indexOf('/storage/v1/object/public/');
    if (publicIdx !== -1) {
      path = stripLeadingSlash(url.slice(publicIdx + '/storage/v1/object/public/'.length));
    } else {
      return url;
    }
  } else if (isLocalImage) {
    path = stripLeadingSlash(url);
  }

  if (endpointSubfolder && path.startsWith(endpointSubfolder + '/')) {
    path = stripLeadingSlash(path.slice(endpointSubfolder.length));
  } else if (endpointSubfolder && path === endpointSubfolder) {
    path = '';
  }

  if (!path) return url;

  const transformations = buildTransform(options);
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


