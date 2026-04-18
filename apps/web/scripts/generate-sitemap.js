import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SITE_URL = 'https://crossangleinterior.com';

const routes = [
  { url: '/', lastmod: new Date().toISOString().split('T')[0], priority: 1.0 },
  { url: '/about-us', lastmod: new Date().toISOString().split('T')[0], priority: 0.8 },
  { url: '/gallery', lastmod: new Date().toISOString().split('T')[0], priority: 0.9 },
  { url: '/contact', lastmod: new Date().toISOString().split('T')[0], priority: 0.8 },
  { url: '/estimator', lastmod: new Date().toISOString().split('T')[0], priority: 0.7 },
];

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
