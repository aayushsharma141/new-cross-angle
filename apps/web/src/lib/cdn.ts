/**
 * ImageKit CDN Utility
 * --------------------
 *
 * Unified image optimization layer for Direct ImageKit URLs and Supabase
 * Storage URLs (legacy).
 *
 * Site-local assets under `public/` are deliberately NOT routed through
 * ImageKit. The `/cross-angle` URL-endpoint resolves against two sources
 * only: the ImageKit Media Library, and its Web-host origin, which is the
 * Supabase Storage public root. Files in `public/images/` are served by
 * Vercel and exist in neither, so rewriting them produced an origin miss
 * that ImageKit surfaced as `EBADREQ` / HTTP 400 rather than a 404.
 *
 * If static assets should go through the CDN later, the correct fix is a
 * second ImageKit URL-endpoint whose origin is the site itself — not a
 * path remap here.
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
 * Transforms a CDN-servable URL into an optimized ImageKit delivery URL.
 * Works with:
 * - Direct ImageKit URLs (ik.imagekit.io)
 * - Legacy Supabase Storage URLs
 *
 * Anything else — including site-local `/images/` assets — is returned
 * untouched. See the note at the top of this file.
 */
export const getOptimizedUrl = (url: string | undefined, options: OptimizationOptions = {}): string => {
  if (!url || typeof url !== 'string') return '';

  const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');
  if (isDataOrBlob) return url;

  const isImageKit = url.includes('ik.imagekit.io');
  const isSupabase = url.includes(SUPABASE_URL);

  const shouldBypass = import.meta.env.DEV || import.meta.env.VITE_BYPASS_IMAGEKIT === 'true';

  if ((!isImageKit && !isSupabase) || shouldBypass) return url;

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

  // When the URL is not transformable — a bypassed build, a site-local asset,
  // or any host ImageKit cannot serve — getOptimizedUrl returns it untouched.
  // Emitting the same URL at five widths would advertise sizes that do not
  // exist and let the browser pick the "largest" of five identical files.
  if (getOptimizedUrl(url, options) === url) return '';

  return widths
    .map(w => `${getOptimizedUrl(url, { ...options, width: w })} ${w}w`)
    .join(', ');
};


