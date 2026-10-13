import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITE_URL = 'https://crossangleinterior.com';

const today = new Date().toISOString().split('T')[0];
// Static fallback only: vercel.json rewrites /sitemap.xml to the `sitemap` edge function,
// which is the live source. Keep these paths identical to src/routes/publicRoutes.tsx.
const routes = [
  { url: '/', priority: 1.0 },
  { url: '/about-us', priority: 0.8 },
  { url: '/our-process', priority: 0.8 },
  { url: '/services', priority: 0.9 },
  { url: '/portfolio', priority: 0.8 },
  { url: '/gallery', priority: 0.8 },
  { url: '/blog', priority: 0.8 },
  { url: '/locations', priority: 0.7 },
  { url: '/contact-us', priority: 0.75 },
  { url: '/estimate', priority: 0.7 },
  { url: '/aesthetic-discovery-engine', priority: 0.7 },
].map((r) => ({ ...r, lastmod: today }));

const generateSitemap = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  // Write to public for dev and dist for production build
  const publicPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(publicPath, xml);
  console.log(`✅ Sitemap generated at ${publicPath}`);

  if (fs.existsSync(DIST_DIR)) {
    const distPath = path.join(DIST_DIR, 'sitemap.xml');
    fs.writeFileSync(distPath, xml);
    console.log(`✅ Sitemap copied to ${distPath}`);
  }
};

generateSitemap();
